import { BookOpen, CalendarDays, ChevronRight, Heart, Users, UsersRound } from 'lucide-react';
import { motion } from 'framer-motion';

/** Push a client-side route without a full page reload. */
function navigate(route: string) {
  window.history.pushState(null, '', route);
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

const ministries = [
  { title: <>Workers’<br />Ministry</>, icon: BookOpen, id: 'workers' },
  { title: <>Youth &amp;<br />Young Adults</>, icon: UsersRound, id: 'youth' },
  { title: <>Children’s<br />Ministry</>, icon: Users, id: 'children' },
  { title: <>Women’s &amp; Men’s<br />Fellowship</>, icon: Heart, id: 'fellowship' },
];

export function MinistriesSection() {
  return (
    <section className="home-ministries" aria-labelledby="home-ministries-title">
      <div className="home-ministries-inner">
        <h2 id="home-ministries-title">Our Ministries</h2>
        <ul className="home-ministry-grid">
          {ministries.map(({ title, icon: Icon, id }, index) => (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <motion.a
                href="/ministries"
                onClick={(e) => { e.preventDefault(); navigate('/ministries'); }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Icon aria-hidden="true" />{title}
              </motion.a>
            </motion.li>
          ))}
        </ul>
        <motion.div
          className="home-schedule"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.a href="/programmes" onClick={(e) => { e.preventDefault(); navigate('/programmes'); }} whileHover={{ backgroundColor: '#f3e9d7' }}>
            <CalendarDays aria-hidden="true" />
            <span><strong>Sunday Worship<br />10:00 AM</strong><small>In person &amp; online</small></span>
          </motion.a>
          <motion.a href="/programmes" onClick={(e) => { e.preventDefault(); navigate('/programmes'); }} whileHover={{ backgroundColor: '#f3e9d7' }}>
            <CalendarDays aria-hidden="true" />
            <span><strong>Weekly Services</strong><small>Bible study, prayer meetings,<br />and other weekly gatherings</small></span>
            <ChevronRight className="home-chevron" aria-hidden="true" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
