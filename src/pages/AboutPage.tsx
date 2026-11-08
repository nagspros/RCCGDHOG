import { AboutLinks } from '../components/AboutLinks';
import { PageIntro } from '../components/PageIntro';
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Compass, Sparkles, User, Users, ArrowRight, MapPin, Heart, ChevronRight } from 'lucide-react';
import { SectionReveal } from '../components/SectionReveal';
import { CHURCH_INFO } from '../data/churchData';

interface AboutPageProps {
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label="Our story"
        title="About Dominion Hope of Glory"
        description="Get to know our church family, what we believe, and how we serve Newark."
      />
      <AboutLinks currentRoute="/about" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
        
        {/* Core Story Grid */}
        <SectionReveal delay={0.05} yOffset={16}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider">
                Who We Are
              </span>
              <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
                A Caring Spiritual Family in Newark, New Jersey
              </h2>
              <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
                Dominion Hope of Glory is a multicultural, English-speaking parish of The Redeemed Christian Church of God. Our community is committed to helping people know Jesus personally, develop into mature disciples and serve the world around them with compassion and integrity.
              </p>
              <p className="text-stone-700 text-base leading-relaxed">
                We believe Christian community is about becoming more like Jesus, not simply belonging to a denomination. Through Scripture, prayer, worship, service and genuine relationships, we encourage every generation to grow in faith and help others do the same.
              </p>
            </div>

            <div className="lg:col-span-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl overflow-hidden border border-stone-200 shadow-xl bg-white aspect-[16/10]"
              >
                <img
                  src="/assets/extracted/church_building.jpg"
                  alt="RCCG Dominion Hope of Glory Sanctuary Building"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </SectionReveal>

        {/* Purpose, Approach, Hope (Verbatim from PDF page 12) */}
        <SectionReveal delay={0.08} yOffset={18}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Our Purpose */}
            <motion.div
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(8,40,29,0.08)' }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-7 border border-stone-200 shadow-sm transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#08281d] text-[#fae19c] flex items-center justify-center">
                <Target className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="font-serif-heading text-2xl font-bold text-stone-900">
                Our Purpose
              </h3>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                To help people grow in Christlike character, stand firmly on biblical truth and live as faithful witnesses to Jesus in their families, workplaces and communities.
              </p>
            </motion.div>

            {/* Card 2: Our Approach */}
            <motion.div
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(8,40,29,0.08)' }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-7 border border-stone-200 shadow-sm transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#08281d] text-[#fae19c] flex items-center justify-center">
                <Compass className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="font-serif-heading text-2xl font-bold text-stone-900">
                Our Approach
              </h3>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                We pursue spiritual growth through Scripture, prayer, worship, discipleship, fellowship and service. We welcome people of different backgrounds to experience the love of Christ and become part of a caring spiritual family.
              </p>
            </motion.div>

            {/* Card 3: Our Hope */}
            <motion.div
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(8,40,29,0.08)' }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-7 border border-stone-200 shadow-sm transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#08281d] text-[#fae19c] flex items-center justify-center">
                <Sparkles className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="font-serif-heading text-2xl font-bold text-stone-900">
                Our Hope
              </h3>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                That every generation will know Christ more deeply, be equipped for meaningful service and help others encounter the transforming message of the gospel.
              </p>
            </motion.div>

          </div>
        </SectionReveal>

        {/* Life at DHOG Photo Preview */}
        <SectionReveal delay={0.08} yOffset={16}>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider block">
                  Sanctuary & Community Life
                </span>
                <h2 className="font-serif-heading text-3xl font-bold text-stone-900 mt-1">
                  Life at Dominion Hope of Glory
                </h2>
              </div>
              <motion.button
                onClick={() => onNavigate('/gallery')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#08281d] hover:text-[#b48227] bg-[#faecd0] hover:bg-[#fae19c] px-4 py-2 rounded-full transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>Explore All Photos in Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ['Our Sanctuary', '/assets/extracted/church_building.jpg'],
                ['Couples Dinner', '/assets/gallery/Couples-Dinner.jpg'],
                ['House Fellowship', '/assets/gallery/HOUSE-FELLOWSHIP-New-Now.jpg'],
                ['Voices of Dominion Choir', '/assets/gallery/Choir2.jpg'],
              ].map(([title, src]) => (
                <motion.a
                  key={src}
                  href="/gallery"
                  onClick={(e) => { e.preventDefault(); onNavigate('/gallery'); }}
                  whileHover={{ y: -3 }}
                  className="group rounded-2xl overflow-hidden aspect-4/3 relative shadow-sm block"
                >
                  <img src={src} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/70 p-3 text-white text-xs font-semibold">{title}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* Action Pathways from PDF page 12 */}
        <SectionReveal delay={0.06} yOffset={14}>
          <div className="bg-stone-100 rounded-3xl p-8 sm:p-12 border border-stone-200/80">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-900">
                  Discover More About Our Leadership & Community
                </h3>
                <p className="text-stone-600 text-sm sm:text-base mt-1">
                  Explore our shepherd's heart, board governance, and how to plan your first visit.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={() => onNavigate('/about/pastor')}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-5 py-3 rounded-xl bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-semibold text-sm transition-colors cursor-pointer"
                >
                  Meet the Pastor
                </motion.button>
                <motion.button
                  onClick={() => onNavigate('/about/leadership')}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-900 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Church Leadership
                </motion.button>
                <motion.button
                  onClick={() => onNavigate('/visit')}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-5 py-3 rounded-xl bg-[#fae19c] hover:bg-[#f6d782] text-[#08281d] font-bold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  Plan a Visit →
                </motion.button>
              </div>
            </div>
          </div>
        </SectionReveal>

      </div>

    </div>
  );
};
