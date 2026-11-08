import { ChevronRight, HandHeart, Mail, Users } from 'lucide-react';
import { motion } from 'framer-motion';

/** Push a client-side route without a full page reload. */
function navigate(route: string) {
  window.history.pushState(null, '', route);
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

const connections = [
  { title: 'New Here?', description: 'We’d love to welcome you to DHOG!', icon: Users, href: '/connect' },
  { title: 'Prayer Request', description: 'Send us your prayer requests.', icon: HandHeart, href: '/prayer' },
  { title: 'Stay Connected', description: 'Get updates on services, events, and programs.', icon: Mail, href: '/connect' },
];

export function QuickConnectCards() {
  return (
    <nav className="home-connect" aria-label="Connect with DHOG">
      <div className="home-connect-inner">
        {connections.map(({ title, description, icon: Icon, href }, index) => (
          <motion.a
            key={title}
            href={href}
            onClick={(e) => { e.preventDefault(); navigate(href); }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -3, backgroundColor: '#f3e9d7' }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon aria-hidden="true" />
            <strong>{title}</strong>
            <span>{description}</span>
            <ChevronRight className="home-chevron" aria-hidden="true" />
          </motion.a>
        ))}
      </div>
    </nav>
  );
}
