import { usePublicData } from '../data/api';
import type { PublicSite } from '../data/adminStore';
import { motion } from 'framer-motion';
import { AboutSection } from '../components/AboutSection';
import { HomeExplore } from '../components/HomeExplore';
import { Hero } from '../components/Hero';
import { MinistriesSection } from '../components/MinistriesSection';
import { QuickConnectCards } from '../components/QuickConnectCards';
import { QuickInfoBar } from '../components/QuickInfoBar';
import { SermonsSection } from '../components/SermonsSection';
import './home.css';

export function HomePage() {
  const site = usePublicData<Partial<PublicSite>>('/public/site', {});
  const announcements = site.announcements ?? [];
  return (
    <div className="w-full">
      <Hero />
      <QuickInfoBar />
      {announcements.length > 0 && (
        <section aria-labelledby="home-announcements" className="bg-[#f6efdf] px-5 py-8 sm:px-10">
          <div className="max-w-7xl mx-auto space-y-4">
            <h2 id="home-announcements" className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-900">
              Church announcements
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {announcements.map((item, index) => (
                <motion.li
                  key={item.id}
                  className="space-y-1.5 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
                >
                  <h3 className="font-semibold text-stone-900">{item.title}</h3>
                  <p className="whitespace-pre-wrap text-sm text-stone-700 leading-relaxed">{item.content}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <AboutSection />
      <MinistriesSection />
      <SermonsSection />
      <HomeExplore site={site} />
      <QuickConnectCards />
    </div>
  );
}
