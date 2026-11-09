import { lazy, Suspense, useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { ExtendedFooter } from './components/ExtendedFooter';
import './site.css';

// Dedicated Pages (No modals!)
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { PastorPage } from './pages/PastorPage';
import { LeadershipPage } from './pages/LeadershipPage';
import { MinistriesPage } from './pages/MinistriesPage';
import { ProgrammesPage } from './pages/ProgrammesPage';
import { SermonsPage } from './pages/SermonsPage';
import { VisitPage } from './pages/VisitPage';
import { PrayerPage } from './pages/PrayerPage';
import { AskPastorPage } from './pages/AskPastorPage';
import { GivingPage } from './pages/GivingPage';
import { ContactPage } from './pages/ContactPage';
import { ConnectPage } from './pages/ConnectPage';
import { WatchPage } from './pages/WatchPage';
import { GalleryPage } from './pages/GalleryPage';
import { EventsPage, GalleryDetailPage, MinistryDetailPage, ProgrammeDetailPage } from './pages/ArchivePages';

const AdminDashboardPage = lazy(async () => {
  const { AdminDashboardPage } = await import('./pages/AdminDashboardPage');
  return { default: AdminDashboardPage };
});

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return (window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : window.location.pathname).replace(/\/$/, '') || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute((window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : window.location.pathname).replace(/\/$/, '') || '/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: string) => {
    window.history.pushState(null, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Route dispatcher rendering full dedicated pages
  const renderCurrentPage = () => {
    const [, area, entry] = currentRoute.split('/');
    if (entry) {
      if (area === 'sermons') return <SermonsPage sermonId={entry} />;
      if (area === 'events') return <EventsPage eventId={entry} />;
      if (area === 'gallery') return <GalleryDetailPage photoId={entry} />;
      if (area === 'ministries') return <MinistryDetailPage ministryId={entry} />;
      if (area === 'programmes') return <ProgrammeDetailPage programmeId={entry} />;
    }
    switch (currentRoute) {
      case '/about':
        return <AboutPage onNavigate={navigateTo} />;
      case '/about/pastor':
        return <PastorPage onNavigate={navigateTo} />;
      case '/about/leadership':
        return <LeadershipPage onNavigate={navigateTo} />;
      case '/ministries':
        return <MinistriesPage onNavigate={navigateTo} />;
      case '/programmes':
      case '/programs':
        return <ProgrammesPage onNavigate={navigateTo} />;
      case '/sermons':
        return <SermonsPage />;
      case '/events':
        return <EventsPage />;
      case '/visit':
        return <VisitPage onNavigate={navigateTo} />;
      case '/prayer':
        return <PrayerPage onNavigate={navigateTo} />;
      case '/ask-pastor':
        return <AskPastorPage onNavigate={navigateTo} />;
      case '/give':
        return <GivingPage onNavigate={navigateTo} />;
      case '/contact':
        return <ContactPage onNavigate={navigateTo} />;
      case '/connect':
        return <ConnectPage onNavigate={navigateTo} />;
      case '/watch':
        return <WatchPage onNavigate={navigateTo} />;
      case '/gallery':
        return <GalleryPage onNavigate={navigateTo} />;
      default:
        return null;
    }
  };

  if (currentRoute === '/admin') {
    return (
      <Suspense fallback={<p className="p-6" role="status">Loading staff console…</p>}>
        <AdminDashboardPage onNavigate={navigateTo} />
      </Suspense>
    );
  }

  const page = renderCurrentPage();

  return (
    <div className={page ? 'public-shell' : 'home-shell'}>
      <Navbar currentRoute={page ? (currentRoute === '/programs' ? '/programmes' : currentRoute) : '/'} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="site-content"
          key={currentRoute}
          tabIndex={-1}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 w-full"
        >
          {page || <HomePage />}
        </motion.main>
      </AnimatePresence>
      <ExtendedFooter />
    </div>
  );
}
