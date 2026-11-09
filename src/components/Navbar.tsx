import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { RccgLogo } from './RccgLogo';

const mainLinks: [string, string][] = [
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
    links: [
      ['Meet the Pastor', '/about/pastor'],
      ['Church Leadership', '/about/leadership'],
      ['Photo Gallery', '/gallery'],
    ],
  },
  {
    title: 'Worship & care',
    links: [
      ['Watch Online', '/watch'],
      ['Prayer Request', '/prayer'],
      ['Ask the Pastor', '/ask-pastor'],
    ],
  },
  {
    title: 'Get involved',
    links: [
      ['Connect & Membership', '/connect'],
      ['Give', '/give'],
    ],
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
  const [desktopOthersOpen, setDesktopOthersOpen] = useState(false);
  const [mobileOthersOpen, setMobileOthersOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const desktopOthersButton = useRef<HTMLButtonElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);

  const closeMenus = () => {
    setMobileOpen(false);
    setDesktopOthersOpen(false);
  };

  useEffect(() => {
    closeMenus();
  }, [currentRoute]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 880) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!mobileOpen && !desktopOthersOpen) return;

    const handleOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) {
        closeMenus();
      }
    };
    document.addEventListener('pointerdown', handleOutsidePress);
    return () => document.removeEventListener('pointerdown', handleOutsidePress);
  }, [mobileOpen, desktopOthersOpen]);

  const isOtherActive = linkGroups.some(group =>
    group.links.some(([, route]) => currentRoute === route)
  );

  return (
    <header className="home-header site-header" ref={header} onKeyDown={event => {
      if (event.key === 'Escape' && (mobileOpen || desktopOthersOpen)) {
        closeMenus();
        (mobileOpen ? mobileButton : desktopOthersButton).current?.focus();
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
          aria-expanded={mobileOpen} aria-controls="site-nav" onClick={() => setMobileOpen(open => !open)}>
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <nav className="home-nav site-nav" id="site-nav" aria-label="Main navigation" data-open={mobileOpen}>
          {/* Desktop Navigation (>= 880px) */}
          <div className="site-nav-desktop">
            <div className="site-nav-primary">
              {mainLinks.map(([label, route]) => (
                <a
                  key={route}
                  href={route}
                  aria-current={currentRoute === route ? 'page' : undefined}
                  onClick={(e) => { e.preventDefault(); closeMenus(); navigateTo(route); }}
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="site-nav-more">
              <button
                ref={desktopOthersButton}
                className={`site-more-toggle ${isOtherActive ? 'active' : ''}`}
                type="button"
                aria-expanded={desktopOthersOpen}
                aria-controls="site-nav-groups"
                onClick={() => setDesktopOthersOpen(open => !open)}
              >
                Others <ChevronDown aria-hidden="true" className={desktopOthersOpen ? 'open' : ''} />
              </button>
              <AnimatePresence>
                {desktopOthersOpen && (
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
                        {group.links.map(([label, route]) => (
                          <a
                            key={route}
                            href={route}
                            aria-current={currentRoute === route ? 'page' : undefined}
                            onClick={(e) => { e.preventDefault(); closeMenus(); navigateTo(route); }}
                          >
                            {label}
                          </a>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Navigation (< 880px) */}
          <div className="site-nav-mobile">
            <div className="site-mobile-primary">
              {mainLinks.map(([label, route]) => (
                <a
                  key={route}
                  href={route}
                  aria-current={currentRoute === route ? 'page' : undefined}
                  className={`site-mobile-link ${currentRoute === route ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); closeMenus(); navigateTo(route); }}
                >
                  {label}
                </a>
              ))}

              <button
                type="button"
                className={`site-mobile-others-btn ${mobileOthersOpen || isOtherActive ? 'active' : ''}`}
                aria-expanded={mobileOthersOpen}
                onClick={() => setMobileOthersOpen(open => !open)}
              >
                <span>Others</span>
                <ChevronDown
                  className={`site-mobile-chevron ${mobileOthersOpen ? 'open' : ''}`}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence initial={false}>
                {mobileOthersOpen && (
                  <motion.div
                    className="site-mobile-dropdown"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="site-mobile-groups">
                      {linkGroups.map(group => (
                        <div key={group.title} className="site-mobile-group">
                          <p className="site-mobile-group-title">{group.title}</p>
                          <div className="site-mobile-group-links">
                            {group.links.map(([label, route]) => (
                              <a
                                key={route}
                                href={route}
                                aria-current={currentRoute === route ? 'page' : undefined}
                                className={`site-mobile-sublink ${currentRoute === route ? 'active' : ''}`}
                                onClick={(e) => { e.preventDefault(); closeMenus(); navigateTo(route); }}
                              >
                                {label}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="site-mobile-action">
              <a
                href="/visit"
                className={`site-mobile-visit-btn ${currentRoute === '/visit' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); closeMenus(); navigateTo('/visit'); }}
              >
                Plan a Visit
              </a>
            </div>
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
