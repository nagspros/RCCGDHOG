import { ArrowRight, CirclePlay } from 'lucide-react';
import { motion } from 'framer-motion';
import { CHURCH_INFO } from '../data/churchData';

/** Push a client-side route without a full page reload. */
function navigate(route: string) {
  window.history.pushState(null, '', route);
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function Hero() {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-art" aria-hidden="true">
        <motion.img
          src="/assets/extracted/hero_worship.jpg"
          alt=""
          fetchPriority="high"
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </div>
      <div className="home-hero-inner">
        <div className="home-hero-copy">
          <motion.p
            className="home-eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {CHURCH_INFO.denomination}
          </motion.p>
          <motion.h1
            id="home-title"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {CHURCH_INFO.heroHeadingLine1}<br />{CHURCH_INFO.heroHeadingLine2}
          </motion.h1>
          <motion.p
            className="home-tagline"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {CHURCH_INFO.tagline}
          </motion.p>
          <motion.div
            className="home-actions"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.a
              className="home-button"
              href="/visit"
              onClick={(e) => { e.preventDefault(); navigate('/visit'); }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Plan a Visit <ArrowRight />
            </motion.a>
            <motion.a
              className="home-button home-button-outline"
              href="/watch"
              onClick={(e) => { e.preventDefault(); navigate('/watch'); }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <CirclePlay /> Watch Online
            </motion.a>
          </motion.div>
        </div>
      </div>
      <svg className="home-wave" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="home-wave-gold">
            <stop stopColor="#dfad57" />
            <stop offset=".47" stopColor="#ffebad" />
            <stop offset="1" stopColor="#dba448" />
          </linearGradient>
        </defs>
        <path d="M0 36C117 11 258 74 457 62C685 48 837 -12 1000 9V80H0Z" fill="url(#home-wave-gold)" />
        <path d="M0 50C126 27 260 78 457 66C685 56 837 2 1000 23V80H0Z" fill="#05291f" />
      </svg>
    </section>
  );
}
