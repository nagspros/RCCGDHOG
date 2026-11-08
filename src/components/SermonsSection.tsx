import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function navigate(route: string) {
  window.history.pushState(null, '', route);
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function SermonsSection() {
  return (
    <motion.section
      className="home-feature home-sermons"
      aria-labelledby="home-sermons-title"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src="/assets/extracted/open_bible.jpg"
        alt="An open Bible in warm light"
        width="238"
        height="112"
        loading="lazy"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      />
      <div>
        <h2 id="home-sermons-title">Sermons &amp; Messages</h2>
        <p>Be inspired by life-transforming messages from our recent services.</p>
        <motion.a
          className="home-button home-button-amber"
          href="/sermons"
          onClick={(e) => { e.preventDefault(); navigate('/sermons'); }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          Watch Sermons <ArrowRight />
        </motion.a>
      </div>
    </motion.section>
  );
}
