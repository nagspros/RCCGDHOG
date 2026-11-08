import { AboutLinks } from '../components/AboutLinks';
import { PageIntro } from '../components/PageIntro';
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Mail, Phone, ChevronRight } from 'lucide-react';
import { CHURCH_LEADERSHIP } from '../data/churchData';
import { SectionReveal } from '../components/SectionReveal';

interface LeadershipPageProps {
  onNavigate: (route: string) => void;
}

export const LeadershipPage: React.FC<LeadershipPageProps> = ({ onNavigate }) => {
  const boardMembers = CHURCH_LEADERSHIP.filter((l) => l.section === 'Board of Trustees' || l.section === 'Board / Pastor');
  const ministers = CHURCH_LEADERSHIP.filter((l) => l.section === 'Ministers');

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label="Our team"
        title="Church Leadership"
        description="Meet the people who serve and oversee our parish."
        parent={{ title: "About", route: "/about" }}
      />
      <AboutLinks currentRoute="/about/leadership" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
        
        {/* Section 1: Board of Trustees */}
        <SectionReveal delay={0.05} yOffset={16} className="space-y-8">
          <div className="border-b border-stone-200 pb-4">
            <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider block">
              Governance & Oversight
            </span>
            <h2 className="font-serif-heading text-3xl font-bold text-stone-900 mt-1">
              Board of Trustees
            </h2>
            <p className="text-stone-600 text-sm mt-1 max-w-2xl">
              Responsible for the general administrative, legal, and operational governance of Dominion Hope of Glory in Newark, New Jersey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardMembers.map((trustee) => (
              <div
                key={trustee.name}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#08281d] text-[#fae19c] flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-heading font-bold text-stone-900 text-lg">
                      {trustee.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#b48227] mt-0.5">
                      {trustee.role}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                    {trustee.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* Section 2: Ministers & Departmental Coordinators */}
        <SectionReveal delay={0.08} yOffset={18} className="space-y-8 pt-6">
          <div className="border-b border-stone-200 pb-4">
            <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider block">
              Pastoral & Ministerial Staff
            </span>
            <h2 className="font-serif-heading text-3xl font-bold text-stone-900 mt-1">
              Ministers & Department Leads
            </h2>
            <p className="text-stone-600 text-sm mt-1 max-w-2xl">
              Leading the 21 vital ministries across worship, discipleship, family life, prayer, and Newark community impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ministers.map((minister) => (
              <div
                key={minister.name + minister.role}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-[#08281d] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-heading font-bold text-stone-900 text-lg">
                      {minister.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#08281d] mt-0.5">
                      {minister.role}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                    {minister.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* Connect Action Box */}
        <SectionReveal delay={0.06} yOffset={14} className="bg-[#08281d] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-serif-heading text-2xl font-bold text-white">
              Need Pastoral Counseling or Prayer?
            </h3>
            <p className="text-[#d1e2db] text-sm max-w-xl">
              Our pastoral staff is available to pray with you, counsel couples and families, and walk alongside you in your spiritual walk.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/ask-pastor')}
              className="px-5 py-3 rounded-xl bg-[#fae19c] text-[#08281d] font-bold text-xs sm:text-sm hover:bg-[#f6d782] transition-colors"
            >
              Ask the Pastor
            </button>
            <button
              onClick={() => onNavigate('/contact')}
              className="px-5 py-3 rounded-xl border border-white/30 text-white font-medium text-xs sm:text-sm hover:bg-white/10 transition-colors"
            >
              Contact Office
            </button>
          </div>
        </SectionReveal>

      </div>

    </div>
  );
};
