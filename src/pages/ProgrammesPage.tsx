import { usePublicData } from '../data/api';
import type { PublicSite } from '../data/adminStore';
import { SectionLink } from '../components/SectionLink';
import { PageIntro } from '../components/PageIntro';
import { ArchivePagination } from '../components/ArchiveContent';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Download, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { SectionReveal } from '../components/SectionReveal';
import { WEEKLY_PROGRAMS, CHURCH_INFO, programmeSlug } from '../data/churchData';

interface ProgrammesPageProps {
  onNavigate: (route: string) => void;
}

const eventsPerPage = 6;

export const ProgrammesPage: React.FC<ProgrammesPageProps> = ({ onNavigate }) => {
  const site = usePublicData<Partial<PublicSite>>('/public/site', {});
  const services = site.services ?? [];
  const recurringPrograms = site.recurringPrograms ?? WEEKLY_PROGRAMS;
  const [requestedPage, setPage] = useState(1);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  const upcoming = services.filter(service => service.date >= today && service.status !== 'Completed')
    .sort((left, right) => left.date.localeCompare(right.date));
  const totalPages = Math.ceil(upcoming.length / eventsPerPage);
  const page = Math.min(requestedPage, Math.max(totalPages, 1));
  const start = (page - 1) * eventsPerPage;
  const visibleEvents = upcoming.slice(start, start + eventsPerPage);

  const downloadCalendarReminder = (programTitle: string) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RCCG Dominion Hope of Glory//EN
BEGIN:VEVENT
SUMMARY:${programTitle} - RCCG Dominion Hope of Glory
DESCRIPTION:${programTitle} at RCCG Dominion Hope of Glory Newark.
LOCATION:${CHURCH_INFO.displayAddress}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${programTitle.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label="Weekly & annual schedule"
        title="Worship & Service Programmes"
        description="Find service times, Bible study, prayer meetings, and special gatherings throughout the year."
      >
        <div className="page-intro-actions">
          <SectionLink id="weekly-services" className="home-button">Weekly services</SectionLink>
          <SectionLink id="special-programmes" className="home-button home-button-outline">Special programmes</SectionLink>
          <a href="/events" className="home-button home-button-outline">Past event archive</a>
        </div>
      </PageIntro>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
        
        {upcoming.length > 0 && (
          <section aria-labelledby="upcoming-events" className="space-y-4">
            <h2 id="upcoming-events" tabIndex={-1} className="font-serif-heading text-3xl">Upcoming church events</h2>
            <p className="text-sm text-stone-600" role="status">Showing {start + 1}–{start + visibleEvents.length} of {upcoming.length} events</p>
            <ul className="grid gap-4 md:grid-cols-2">
              {visibleEvents.map((event, index) => (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.07 }}
                  whileHover={{ y: -2 }}
                  className="space-y-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-[#765618]">
                    {new Date(`${event.date}T12:00:00-05:00`).toLocaleDateString('en-US', { timeZone: 'America/New_York', dateStyle: 'long' })} · {event.startTime}
                  </p>
                  <h3 className="font-serif-heading text-xl"><a className="hover:underline" href={`/programmes/${encodeURIComponent(event.id)}`}>{event.title}</a></h3>
                  <p className="text-sm text-stone-700">{event.location}</p>
                  {event.theme && <p className="text-sm text-stone-700">{event.theme}</p>}
                </motion.li>
              ))}
            </ul>
            <ArchivePagination label="Upcoming event pages" page={page} totalPages={totalPages} onPage={next => {
              setPage(next);
              document.getElementById('upcoming-events')?.focus();
            }} />
          </section>
        )}

        {/* Core Weekly Highlights */}
        <SectionReveal delay={0.05} yOffset={16}>
          <div id="weekly-services" tabIndex={-1} className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider block">
                Weekly Gatherings
              </span>
              <h2 className="font-serif-heading text-3xl font-bold text-stone-900 mt-1">
                Join Us Every Week
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recurringPrograms.filter(program => program.frequency === 'Weekly').map((prog, index) => (
                <motion.div
                  key={prog.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(8,40,29,0.08)' }}
                  className="bg-white rounded-2xl p-7 border border-stone-200 shadow-sm hover:border-[#08281d]/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-[#08281d] text-[#fae19c] text-xs font-bold rounded-lg uppercase">
                        {prog.frequency}
                      </span>
                      {prog.badge && (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg">
                          {prog.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif-heading font-bold text-stone-900 text-xl sm:text-2xl">
                      <a className="hover:underline" href={`/programmes/${programmeSlug(prog.title)}`}>{prog.title}</a>
                    </h3>

                    <div className="space-y-1.5 text-xs sm:text-sm text-stone-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#b48227]" />
                        <span className="font-semibold">{prog.day}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#b48227]" />
                        <span>{prog.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        <span>{prog.location}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                      {prog.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <motion.button
                      onClick={() => downloadCalendarReminder(prog.title)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-[#08281d] font-bold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#b48227]" />
                      <span>Add to Calendar</span>
                    </motion.button>
                    <motion.button
                      onClick={() => onNavigate('/visit')}
                      whileHover={{ scale: 1.03, x: 2 }}
                      whileTap={{ scale: 0.96 }}
                      className="text-xs font-bold text-[#08281d] hover:text-[#b48227] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Plan Your Visit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* Monthly, Quarterly & Annual Programmes */}
        <SectionReveal delay={0.06} yOffset={16}>
          <div id="special-programmes" tabIndex={-1} className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider block">
                Monthly, Quarterly & Annual Events
              </span>
              <h2 className="font-serif-heading text-3xl font-bold text-stone-900 mt-1">
                Special Church Programmes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recurringPrograms.filter(program => program.frequency !== 'Weekly').map((prog, index) => (
                <motion.div
                  key={prog.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(8,40,29,0.08)' }}
                  className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:border-[#08281d]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 text-[11px] font-bold rounded uppercase">
                        {prog.frequency}
                      </span>
                      {prog.badge && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                          {prog.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif-heading font-bold text-stone-900 text-lg">
                      <a className="hover:underline" href={`/programmes/${programmeSlug(prog.title)}`}>{prog.title}</a>
                    </h4>

                    <div className="space-y-1 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#b48227]" />
                        <span className="font-medium text-stone-800">{prog.day}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#b48227]" />
                        <span>{prog.time}</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed pt-1">
                      {prog.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <motion.button
                      onClick={() => downloadCalendarReminder(prog.title)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-[#08281d] font-semibold cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#b48227]" />
                      <span>Save Event</span>
                    </motion.button>
                    <motion.button
                      onClick={() => onNavigate('/visit')}
                      whileHover={{ scale: 1.03, x: 2 }}
                      whileTap={{ scale: 0.96 }}
                      className="text-[11px] font-bold text-[#08281d] hover:text-[#b48227] cursor-pointer"
                    >
                      Attend →
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* Authentic Parish Event Flyers from live site */}
        <SectionReveal delay={0.08} yOffset={18}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider block">
                  Special Gatherings & Flyers
                </span>
                <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                  Parish Events & Vigils
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/gallery')}
                className="text-xs font-semibold text-[#08281d] hover:text-[#b48227] flex items-center gap-1 cursor-pointer"
              >
                <span>Explore Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Flyer 1: Night of Glory */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0 }}
                whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(8,40,29,0.08)' }}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm transition-all group"
              >
                <div className="h-48 overflow-hidden bg-stone-100 relative">
                  <img
                    src="/assets/site/NIGHT-OF-GLORY-FLYER.jpg"
                    alt="Night of Glory Prayer Vigil Flyer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-[#08281d]/85 text-[#fae19c] text-[10px] font-bold px-2 py-0.5 rounded">
                    Monthly Vigil
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-serif-heading font-bold text-stone-900 text-base">Night of Glory Vigil</h4>
                  <p className="text-xs text-stone-600 line-clamp-2">Overnight miracle, prayer and deliverance service held monthly.</p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-stone-500 text-[11px]">Last Friday Monthly</span>
                    <button onClick={() => onNavigate('/visit')} className="text-[#08281d] font-bold hover:text-[#b48227] cursor-pointer">Join In →</button>
                  </div>
                </div>
              </motion.div>

              {/* Flyer 2: Couples Dinner */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 }}
                whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(8,40,29,0.08)' }}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm transition-all group"
              >
                <div className="h-48 overflow-hidden bg-stone-100 relative">
                  <img
                    src="/assets/gallery/Couples-Dinner.jpg"
                    alt="Community Couples Dinner Flyer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-[#08281d]/85 text-[#fae19c] text-[10px] font-bold px-2 py-0.5 rounded">
                    Annual Dinner
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-serif-heading font-bold text-stone-900 text-base">Community Couples Dinner</h4>
                  <p className="text-xs text-stone-600 line-clamp-2">Annual celebration honoring Christian marriages, covenant love and family harmony.</p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-stone-500 text-[11px]">Special Season</span>
                    <button onClick={() => onNavigate('/contact')} className="text-[#08281d] font-bold hover:text-[#b48227] cursor-pointer">Register →</button>
                  </div>
                </div>
              </motion.div>

              {/* Flyer 3: Teens & Parents */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.16 }}
                whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(8,40,29,0.08)' }}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm transition-all group"
              >
                <div className="h-48 overflow-hidden bg-stone-100 relative">
                  <img
                    src="/assets/gallery/TEENS-PARENTS-CONNECT-Copy.jpg"
                    alt="Teens & Parents Connect Flyer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-[#08281d]/85 text-[#fae19c] text-[10px] font-bold px-2 py-0.5 rounded">
                    Family Forum
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-serif-heading font-bold text-stone-900 text-base">Teens & Parents Connect</h4>
                  <p className="text-xs text-stone-600 line-clamp-2">Equipping parents and empowering youth to walk in kingdom identity and academic excellence.</p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-stone-500 text-[11px]">Quarterly</span>
                    <button onClick={() => onNavigate('/ministries')} className="text-[#08281d] font-bold hover:text-[#b48227] cursor-pointer">Details →</button>
                  </div>
                </div>
              </motion.div>

              {/* Flyer 4: House Fellowships */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.24 }}
                whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(8,40,29,0.08)' }}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm transition-all group"
              >
                <div className="h-48 overflow-hidden bg-stone-100 relative">
                  <img
                    src="/assets/gallery/HOUSE-FELLOWSHIP-New-Now.jpg"
                    alt="House Fellowship Centers Flyer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-[#08281d]/85 text-[#fae19c] text-[10px] font-bold px-2 py-0.5 rounded">
                    Weekly Center
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-serif-heading font-bold text-stone-900 text-base">House Fellowship Centers</h4>
                  <p className="text-xs text-stone-600 line-clamp-2">Intimate neighborhood small groups gathering weekly for communion and prayer in NJ.</p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-stone-500 text-[11px]">Sunday Evenings</span>
                    <button onClick={() => onNavigate('/contact')} className="text-[#08281d] font-bold hover:text-[#b48227] cursor-pointer">Find Center →</button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </SectionReveal>

        {/* Disciples Retreat Callout from PDF page 5 */}
        <SectionReveal delay={0.06} yOffset={14}>
          <div className="bg-[#08281d] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="px-3 py-1 bg-[#fae19c] text-[#08281d] text-xs font-bold rounded-md uppercase tracking-wider">
                Annual Flagship Gathering
              </span>
              <h3 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#faecd0]">
                Disciples Retreat (Easter Period)
              </h3>
              <p className="text-[#d1e2db] text-sm sm:text-base leading-relaxed">
                A yearly, interdenominational gathering held around Easter to encourage spiritual consecration, deep prayer, and discipleship. The published description includes complimentary registration, lodging, and food.
              </p>
              <div className="pt-2">
                <motion.button
                  onClick={() => onNavigate('/contact')}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-6 py-3 bg-[#fae19c] hover:bg-[#f6d782] text-[#08281d] font-bold text-sm rounded-xl shadow transition-colors cursor-pointer"
                >
                  Inquire About Next Retreat
                </motion.button>
              </div>
            </div>
          </div>
        </SectionReveal>

      </div>

    </div>
  );
};
