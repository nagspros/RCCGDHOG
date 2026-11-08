import type { PublicSite } from '../data/adminStore';
import { usePublicData } from '../data/api';
import { FormError, useServerForm } from '../components/ServerForm';
import { PageIntro } from '../components/PageIntro';
import { ArchivePagination } from '../components/ArchiveContent';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, ArrowRight, BookOpen, Users, Smile, Heart, Sparkles, Music, ShieldCheck, Megaphone, Gift, GraduationCap, Droplets, Award, PhoneCall, Home, Car, Video, Sparkle, Globe, Coins, Wrench, Send } from 'lucide-react';
import { SectionReveal } from '../components/SectionReveal';
import { MINISTRIES_CATALOG, Ministry } from '../data/churchData';

interface MinistriesPageProps {
  onNavigate: (route: string) => void;
}

const ministriesPerPage = 9;

export const MinistriesPage: React.FC<MinistriesPageProps> = ({ onNavigate }) => {
  const ministries = usePublicData<Partial<PublicSite>>('/public/site', {}).ministries ?? MINISTRIES_CATALOG;
  const submission = useServerForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [requestedPage, setPage] = useState(1);
  
  // In-page "Ask How to Get Involved" form state
  const [involvedMinistry, setInvolvedMinistry] = useState<string>(() => {
    const id = new URLSearchParams(window.location.search).get('ministry');
    return MINISTRIES_CATALOG.find(item => item.id === id)?.name ?? "Workers' Ministry";
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    if (window.location.hash === '#involvement-form') {
      document.getElementById('involvement-form')?.scrollIntoView();
    }
  }, []);

  const categories = ['All', 'Fellowship', 'Teaching & Discipleship', 'Service & Operations', 'Outreach & Care'];

  const filtered = ministries.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.leaderOrTeam && m.leaderOrTeam.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.ceil(filtered.length / ministriesPerPage);
  const page = Math.min(requestedPage, Math.max(totalPages, 1));
  const start = (page - 1) * ministriesPerPage;
  const visibleMinistries = filtered.slice(start, start + ministriesPerPage);

  const getMinistryIcon = (id: string) => {
    switch (id) {
      case 'workers': return BookOpen;
      case 'youth': return Users;
      case 'children': return Smile;
      case 'fellowship': return Heart;
      case 'teens': return Sparkles;
      case 'choir': return Music;
      case 'prayer': return ShieldCheck;
      case 'evangelism': return Megaphone;
      case 'welfare': return Gift;
      case 'sunday-school': return GraduationCap;
      case 'believer-class': return Droplets;
      case 'workers-in-training': return Award;
      case 'ushering': return ShieldCheck;
      case 'followup': return PhoneCall;
      case 'house-fellowship': return Home;
      case 'transportation': return Car;
      case 'engineering': return Video;
      case 'sanctuary': return Sparkle;
      case 'community-impact': return Globe;
      case 'finance': return Coins;
      case 'maintenance': return Wrench;
      default: return Users;
    }
  };

  const handleSubmitInvolved = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await submission.submit('/forms/ministry', { ...formData, ministry: involvedMinistry })) setFormSubmitted(true);
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label="Community life & service"
        title="Our Ministries & Departments"
        description="Find a fellowship, discipleship group, or service team that fits your interests and gifts."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        
        {/* Search & Category Filter Toolbar */}
        <SectionReveal delay={0.04} yOffset={14}>
          <div id="ministry-filters" tabIndex={-1} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  aria-label="Search ministries"
                  value={searchTerm}
                  onChange={event => { setSearchTerm(event.target.value); setPage(1); }}
                  placeholder="Search ministries…"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08281d]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    aria-pressed={selectedCategory === cat}
                    onClick={() => { setSelectedCategory(cat); setPage(1); }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#08281d] text-[#fae19c] shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* 21 Ministries Cards Grid */}
        <SectionReveal delay={0.08} yOffset={18}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="ministry-directory" tabIndex={-1} className="font-serif-heading text-3xl text-stone-900">Ministry Directory</h2>
              <p className="text-sm text-stone-600" role="status">{visibleMinistries.length
                ? `Showing ${start + 1}–${start + visibleMinistries.length} of ${filtered.length} ministries`
                : '0 ministries'}</p>
            </div>
            {filtered.length === 0 && (
              <p className="rounded-2xl border border-stone-200 bg-white p-5 text-stone-700">No ministries match your search.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleMinistries.map((ministry) => {
                const Icon = getMinistryIcon(ministry.id);

                return (
                  <div
                    key={ministry.id}
                    className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:border-[#b48227]/60 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-11 h-11 rounded-xl bg-[#08281d] text-[#fae19c] flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 stroke-[1.75]" />
                        </div>
                        <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full uppercase">
                          {ministry.category}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif-heading font-bold text-stone-900 text-lg sm:text-xl">
                          <a href={`/ministries/${ministry.id}`} className="hover:underline">{ministry.name}</a>
                        </h3>
                        {ministry.leaderOrTeam && (
                          <p className="text-xs font-semibold text-[#b48227] mt-0.5">
                            Coord: {ministry.leaderOrTeam}
                          </p>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                        {ministry.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setInvolvedMinistry(ministry.name);
                          document.getElementById('involvement-form')?.focus();
                        }}
                        className="text-xs font-bold text-[#08281d] hover:text-[#b48227] flex items-center gap-1 transition-colors"
                      >
                        <span>Get Involved</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <ArchivePagination label="Ministry directory pages" page={page} totalPages={totalPages} onPage={next => {
              setPage(next);
              document.getElementById('ministry-directory')?.focus();
            }} />
          </div>
        </SectionReveal>

        {/* Featured Fellowship Photo Highlights from live church community */}
        <SectionReveal delay={0.06} yOffset={16}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider block">
                  Explore by interest
                </span>
                <h2 className="font-serif-heading text-2xl font-bold text-stone-900">
                  Ministry Highlights
                </h2>
              </div>
              <button
                onClick={() => onNavigate('/gallery')}
                className="text-xs font-semibold text-[#08281d] hover:text-[#b48227] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All Ministry Photos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { title: "Men's Fellowship", icon: Users, cat: "Fellowship" },
                { title: "Women's Ministry", icon: Heart, cat: "Fellowship" },
                { title: "Kingdom Youths", icon: Users, cat: "Fellowship" },
                { title: "Dominion Teens", icon: Sparkles, cat: "Fellowship" },
                { title: "Voices of Praise", icon: Music, cat: "Service & Operations" },
                { title: "Children's Church", icon: Smile, cat: "Teaching & Discipleship" }
              ].map((card) => (
                <button
                  type="button"
                  key={card.title}
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(card.cat);
                    document.getElementById('ministry-filters')?.focus();
                  }}
                  className="group cursor-pointer rounded-xl overflow-hidden bg-white border border-stone-200 shadow-2xs hover:shadow-md hover:border-[#b48227] transition-all flex flex-col"
                >
                  <div className="flex w-full flex-col items-center gap-2 p-3 text-center">
                    <card.icon className="h-6 w-6 text-[#8a621c]" aria-hidden="true" />
                    <span className="text-xs font-semibold text-stone-900">{card.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* Dedicated In-Page "Ask How to Get Involved" Form from PDF page 13 */}
        <SectionReveal delay={0.06} yOffset={16}>
          <div id="involvement-form" tabIndex={-1} className="bg-stone-100 rounded-3xl p-8 sm:p-12 border border-stone-200 mt-12">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider">
                Action: Ask How to Get Involved
              </span>
              <h2 className="font-serif-heading text-3xl font-bold text-stone-900">
                Express Your Interest in Ministry Service
              </h2>
              <p className="text-stone-600 text-sm">
                Whether you enjoy teaching children, greeting guests, singing in the choir, or helping our media broadcast, there is a place for your spiritual gift.
              </p>
            </div>

            {formSubmitted ? (
              <div className="bg-white rounded-2xl p-8 text-center space-y-3 border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold text-stone-900">
                  Interest Received!
                </h3>
                <p className="text-stone-600 text-sm">
                  Thank you, <span className="font-semibold text-stone-900">{formData.name}</span>. The ministry coordinator for <span className="font-semibold text-stone-900">{involvedMinistry}</span> has received your expression of interest and will reach out with fellowship and training schedules.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-3 text-xs text-[#08281d] font-bold underline"
                >
                  Submit another ministry inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInvolved} className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <FormError error={submission.error} />
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Select Ministry of Interest *
                  </label>
                  <select
                    value={involvedMinistry}
                    onChange={(e) => setInvolvedMinistry(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm bg-white"
                  >
                    {ministries.map((m) => (
                      <option key={m.id} value={m.name}>{m.name} ({m.category})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Bro. David"
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(973) 000-0000"
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Brief Background or Questions (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us a little about your previous church experience or interests..."
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submission.busy}
                  className="w-full bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-bold py-3 rounded-xl shadow transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Expression of Interest</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </SectionReveal>

      </div>

    </div>
  );
};
