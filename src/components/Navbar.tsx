import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { RccgLogo } from './RccgLogo';

const mainLinks = [
  ['Home', '/'],
  ['About', '/about'],
  ['Ministries', '/ministries'],
  ['Programs', '/programmes'],
  ['Sermons', '/sermons'],
  ['Contact', '/contact'],
];

const linkGroups = [
  {
    title: 'Our church',
    links: [['Meet the Pastor', '/about/pastor'], ['Church Leadership', '/about/leadership'], ['Photo Gallery', '/gallery']],
  },
  {
    title: 'Worship & care',
    links: [['Watch Online', '/watch'], ['Prayer Request', '/prayer'], ['Ask the Pastor', '/ask-pastor']],
  },
  {
    title: 'Get involved',
    links: [['Connect & Membership', '/connect'], ['Give', '/give']],
  },
];

/** Pushes a new history entry and dispatches a popstate so App re-renders. */
function navigateTo(route: string) {
  window.history.pushState(null, '', route);
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function Navbar({ currentRoute }: { currentRoute: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const moreButton = useRef<HTMLButtonElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);

  const closeMenus = () => {
    setMobileOpen(false);
    setMoreOpen(false);
  };

  useEffect(() => {
    closeMenus();
  }, [currentRoute]);

  useEffect(() => {
    if (!mobileOpen && !moreOpen) return;

    const handleOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) closeMenus();
    };
    document.addEventListener('pointerdown', handleOutsidePress);
    return () => document.removeEventListener('pointerdown', handleOutsidePress);
  }, [mobileOpen, moreOpen]);

  const navLink = ([label, route]: string[]) => (
    <a key={route} href={route} aria-current={currentRoute === route ? 'page' : undefined}
      onClick={(e) => { e.preventDefault(); closeMenus(); navigateTo(route); }}>
      {label}
    </a>
  );

  return (
    <header className="home-header site-header" ref={header} onKeyDown={event => {
      if (event.key === 'Escape' && (mobileOpen || moreOpen)) {
        closeMenus();
        (mobileOpen ? mobileButton : moreButton).current?.focus();
      }
    }}>
      <div className="home-header-inner">
        <a className="home-skip" href="#site-content" onClick={event => {
          event.preventDefault();
          document.getElementById('site-content')?.focus();
        }}>Skip to content</a>
        <motion.a
          className="home-brand"
          href="/"
          onClick={(e) => { e.preventDefault(); closeMenus(); navigateTo('/'); }}
          aria-label="RCCG Dominion Hope of Glory home"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RccgLogo size={44} />
          <span>RCCG<br />Dominion Hope<br />of Glory (DHOG)</span>
        </motion.a>
        <button className="home-menu-toggle" ref={mobileButton} type="button"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen} aria-controls="site-nav" onClick={() => {
            if (mobileOpen) closeMenus();
            else setMobileOpen(true);
          }}>
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav className="home-nav site-nav" id="site-nav" aria-label="Main navigation" data-open={mobileOpen}>
          <div className="site-nav-primary">{mainLinks.map(navLink)}</div>
          <div className="site-nav-more">
            <button ref={moreButton} className="site-more-toggle" type="button" aria-expanded={moreOpen}
              aria-controls="site-nav-groups" onClick={() => setMoreOpen(open => !open)}>
              More <ChevronDown aria-hidden="true" />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  className="site-nav-groups"
                  id="site-nav-groups"
                  data-open="true"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                >
                  {linkGroups.map(group => (
                    <div key={group.title}>
                      <p>{group.title}</p>
                      {group.links.map(navLink)}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
        <motion.a
          className="home-button home-header-visit"
          href="/visit"
          onClick={(e) => { e.preventDefault(); closeMenus(); navigateTo('/visit'); }}
          aria-current={currentRoute === '/visit' ? 'page' : undefined}
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.96 }}
        >
          Plan a Visit
        </motion.a>
      </div>
    </header>
  );
}
