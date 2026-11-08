import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageIntroProps {
  label: ReactNode;
  title: string;
  description: ReactNode;
  parent?: { title: string; route: string };
  children?: ReactNode;
}

export function PageIntro({ label, title, description, parent, children }: PageIntroProps) {
  return (
    <section className="page-intro" aria-labelledby="page-intro-title">
      <div className="page-intro-inner">
        <motion.p
          className="page-intro-label"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          {parent && <><a href={parent.route} onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', parent.route); window.dispatchEvent(new PopStateEvent('popstate', { state: null })); window.scrollTo({ top: 0, behavior: 'instant' }); }}>{parent.title}</a><span aria-hidden="true">/</span></>}
          {label}
        </motion.p>
        <motion.h1
          id="page-intro-title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="page-intro-description"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          {description}
        </motion.p>
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
