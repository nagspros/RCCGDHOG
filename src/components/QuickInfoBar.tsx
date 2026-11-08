import { CalendarDays, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';

/** Push a client-side route without a full page reload. */
function navigate(route: string) {
  window.history.pushState(null, '', route);
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function QuickInfoBar() {
  return (
    <div className="home-quick-info-bar">
      <motion.div
        className="home-quick-info"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.a href="/visit" onClick={(e) => { e.preventDefault(); navigate('/visit'); }} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <MapPin aria-hidden="true" /><span>Newark, New Jersey</span>
        </motion.a>
        <motion.a href="/programmes" onClick={(e) => { e.preventDefault(); navigate('/programmes'); }} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <CalendarDays aria-hidden="true" /><span>Sunday Worship<br />10:00 AM</span>
        </motion.a>
        <motion.a href="/connect" onClick={(e) => { e.preventDefault(); navigate('/connect'); }} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Users aria-hidden="true" /><span>A Welcoming<br />Church Family</span>
        </motion.a>
      </motion.div>
    </div>
  );
}
