import { Facebook, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { CHURCH_INFO } from '../data/churchData';
import { RccgLogo } from './RccgLogo';

/** Push a client-side route without a full page reload. */
function navigate(route: string) {
  window.history.pushState(null, '', route);
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

const footerGroups = [
  {
    title: 'Our church',
    links: [['About DHOG', '/about'], ['Meet the Pastor', '/about/pastor'], ['Church Leadership', '/about/leadership'], ['Ministries', '/ministries']],
  },
  {
    title: 'Worship with us',
    links: [['Plan a Visit', '/visit'], ['Service Schedule', '/programmes'], ['Watch Online', '/watch'], ['Sermons', '/sermons'], ['Photo Gallery', '/gallery']],
  },
  {
    title: 'Get connected',
    links: [['Prayer Request', '/prayer'], ['Ask the Pastor', '/ask-pastor'], ['Membership', '/connect'], ['Contact', '/contact'], ['Give', '/give']],
  },
];

export function ExtendedFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-contact">
            <a className="home-brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              <RccgLogo size={44} />
              <span>RCCG<br />Dominion Hope of Glory</span>
            </a>
            <address>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CHURCH_INFO.displayAddress)}`} target="_blank" rel="noreferrer">
                <MapPin aria-hidden="true" /> {CHURCH_INFO.displayAddress}
              </a>
              <a href={`tel:${CHURCH_INFO.phone.replace(/\D/g, '')}`}><Phone aria-hidden="true" /> {CHURCH_INFO.phone}</a>
              <a href={`mailto:${CHURCH_INFO.email}`}><Mail aria-hidden="true" /> {CHURCH_INFO.email}</a>
            </address>
            <div className="site-footer-social">
              <motion.a
                href={CHURCH_INFO.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(228, 202, 138, 0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
                <Youtube aria-hidden="true" />
              </motion.a>
              <motion.a
                href={CHURCH_INFO.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(228, 202, 138, 0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
                <Facebook aria-hidden="true" />
              </motion.a>
            </div>
          </div>
          {footerGroups.map(group => (
            <nav key={group.title} aria-label={group.title}>
              <h2>{group.title}</h2>
              <ul>{group.links.map(([label, route]) => <li key={route}><a href={route} onClick={(e) => { e.preventDefault(); navigate(route); }}>{label}</a></li>)}</ul>
            </nav>
          ))}
        </div>
        <div className="site-footer-bottom">
          <p>© {new Date().getFullYear()} RCCG Dominion Hope of Glory</p>
        </div>
      </div>
    </footer>
  );
}
