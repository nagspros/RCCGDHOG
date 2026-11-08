import { motion } from 'framer-motion';

/** Push a client-side route without a full page reload. */
function navigate(route: string) {
  window.history.pushState(null, '', route);
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

const links = [
  ['Our Story', '/about'],
  ['Meet the Pastor', '/about/pastor'],
  ['Church Leadership', '/about/leadership'],
];

export function AboutLinks({ currentRoute }: { currentRoute: string }) {
  return (
    <nav className="about-links" aria-label="About DHOG">
      <div className="about-links-inner">
        {links.map(([label, route]) => (
          <motion.a
            key={route}
            href={route}
            aria-current={currentRoute === route ? 'page' : undefined}
            onClick={(e) => { e.preventDefault(); navigate(route); }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            {label}
          </motion.a>
        ))}
      </div>
    </nav>
  );
}
