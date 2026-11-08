import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CHURCH_INFO } from '../data/churchData';

function navigate(route: string) {
  window.history.pushState(null, '', route);
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function AboutSection() {
  return (
    <motion.section
      className="home-feature home-about"
      aria-labelledby="home-about-title"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src="/assets/extracted/church_building.jpg"
        alt="Dominion Hope of Glory church exterior"
        width="200"
        height="105"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      />
      <div>
        <h2 id="home-about-title">About DHOG</h2>
        <p>{CHURCH_INFO.aboutSummary}</p>
        <motion.a
          className="home-text-link"
          href="/about"
          onClick={(e) => { e.preventDefault(); navigate('/about'); }}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          Learn More <ArrowRight />
        </motion.a>
      </div>
    </motion.section>
  );
}
