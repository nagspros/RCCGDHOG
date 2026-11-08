import { usePublicData } from '../data/api';
import type { PublicSite } from '../data/adminStore';
import { archiveDate, LEGACY_SERMONS } from '../data/legacyArchive';
import { RccgLogo } from '../components/RccgLogo';
import { AboutLinks } from '../components/AboutLinks';
import { PageIntro } from '../components/PageIntro';
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, BookOpen, Heart, Award, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { SectionReveal } from '../components/SectionReveal';
import { CHURCH_INFO } from '../data/churchData';

interface PastorPageProps {
  onNavigate: (route: string) => void;
}

export const PastorPage: React.FC<PastorPageProps> = ({ onNavigate }) => {
  const { sermons = LEGACY_SERMONS } = usePublicData<Partial<PublicSite>>('/public/site', {});
  const pastorSermons = sermons.filter(sermon => /remi afolabi/i.test(sermon.preacher));

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label="Meet our pastor"
        title="Pastor Remi Afolabi"
        description="Pastor in Charge, RCCG Dominion Hope of Glory"
        parent={{ title: "About", route: "/about" }}
      />
      <AboutLinks currentRoute="/about/pastor" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
        
        {/* Profile Card & Bio */}
        <SectionReveal delay={0.05} yOffset={16}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Portrait column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="pastor-identity">
              <RccgLogo size={64} />
              <p>Pastor in Charge</p>
              <h2>Pastor Remi Afolabi</h2>
              <span>Called to pioneer DHOG in September 2012</span>
            </div>

            <div className="bg-stone-100 rounded-2xl p-6 border border-stone-200 space-y-3 text-xs sm:text-sm text-stone-700">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <ShieldCheck className="w-4 h-4 text-[#08281d]" />
                <span>Ministry Background & Calling</span>
              </div>
              <p>• Accepted Jesus Christ in March 1990</p>
              <p>• Formal Christian missionary and leadership training</p>
              <p>• Led revival-focused fellowships before pioneering DHOG</p>
              <p>• Ministering alongside wife, Deaconess Omowumi Afolabi</p>
            </div>
          </div>

          {/* Bio prose from PDF page 5 & 13 */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider block mb-1">
                A Shepherd's Heart
              </span>
              <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-stone-900">
                Discipleship, Revival & Living for Christ
              </h2>
            </div>

            <div className="space-y-4 text-stone-700 text-base sm:text-lg leading-relaxed">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0 }}
              >
                Pastor Remi Afolabi serves as the pastor of Dominion Hope of Glory. His ministry is especially focused on Christian discipleship, missions and spiritual revival. Following years of service and mission-focused work, he began leading the church in September 2012.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                His messages invite believers to move beyond outward religious activity toward a growing, personal relationship with Jesus Christ. He encourages practical obedience to Scripture, maturity in faith and a life that reflects God's character.
              </motion.p>
              <motion.p
                className="text-base text-stone-600"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                Under his leadership, Dominion Hope of Glory has blossomed into an intergenerational, multicultural spiritual family in Newark, emphasizing sound biblical exposition, vibrant Holy Ghost prayer, compassionate community welfare, and preparation for the Second Coming of Christ.
              </motion.p>
            </div>

            {/* Actions from PDF page 13: Explore Sermons · Ask the Pastor */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('/sermons')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-semibold text-sm rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Sermons</span>
              </button>

              <button
                onClick={() => onNavigate('/ask-pastor')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-900 font-semibold text-sm rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#b48227]" />
                <span>Ask the Pastor</span>
              </button>
            </div>

          </div>

        </div>
      </SectionReveal>

      {/* Selected Sermons by Pastor Remi */}
      <SectionReveal delay={0.08} yOffset={18}>
        <div className="space-y-6 pt-8 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-heading text-2xl font-bold text-stone-900">
                Recent Messages by Pastor Remi Afolabi
              </h3>
              <p className="text-stone-600 text-sm">
                Expository teachings from Sunday Worship and midweek Bible studies.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/sermons')}
              className="text-xs sm:text-sm font-semibold text-[#08281d] hover:text-[#b48227] flex items-center gap-1"
            >
              <span>View All Sermons</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastorSermons.slice(0, 3).map((sermon) => (
              <div
                key={sermon.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded uppercase">
                    {sermon.type}
                  </span>
                  <h4 className="font-serif-heading font-bold text-stone-900 text-lg">
                    {sermon.title}
                  </h4>
                  <p className="text-xs font-semibold text-[#b48227]">
                    {sermon.scripture}
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-3">
                    {sermon.summary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center text-xs text-stone-500">
                  <span>{archiveDate(sermon.date)}</span>
                  <button
                    onClick={() => onNavigate(`/sermons/${encodeURIComponent(sermon.id)}`)}
                    className="text-[#08281d] font-bold hover:underline"
                  >
                    Read & Watch →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      </div>

    </div>
  );
};
