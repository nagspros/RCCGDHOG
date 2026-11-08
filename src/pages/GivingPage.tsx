import { usePublicData } from '../data/api';
import { INITIAL_CHURCH_CONTACT, type PublicSite } from '../data/adminStore';
import { PageIntro } from '../components/PageIntro';
import React, { useState } from 'react';
import { Heart, Smartphone, CreditCard, Copy, Check, ArrowRight } from 'lucide-react';
import { SectionReveal } from '../components/SectionReveal';
import { CHURCH_INFO } from '../data/churchData';
import { motion } from 'framer-motion';

interface GivingPageProps {
  onNavigate: (route: string) => void;
}

export const GivingPage: React.FC<GivingPageProps> = ({ onNavigate }) => {
  const [copiedZelle, setCopiedZelle] = useState(false);
  const [copiedSMS, setCopiedSMS] = useState(false);
  const giving = usePublicData<Partial<PublicSite>>('/public/site', {}).churchContactConfig ?? INITIAL_CHURCH_CONTACT;

  const handleCopyZelle = () => {
    navigator.clipboard.writeText(giving.zelleEmail);
    setCopiedZelle(true);
    setTimeout(() => setCopiedZelle(false), 2000);
  };

  const handleCopySMS = () => {
    navigator.clipboard.writeText(`GIVE to ${giving.smsGivingNumber}`);
    setCopiedSMS(true);
    setTimeout(() => setCopiedSMS(false), 2000);
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label="Faithful stewardship"
        title="Give With Purpose"
        description="Your giving supports church programs, discipleship, and community service in Newark and beyond."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        
        {/* Scripture Quote */}
        <SectionReveal delay={0.04} yOffset={12}>
          <motion.div
            className="bg-amber-50 border border-amber-200/80 rounded-2xl p-6 text-center space-y-2"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-serif-heading text-lg sm:text-xl font-bold text-amber-950">
              "Honor the Lord with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing."
            </p>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
              — Proverbs 3:9–10
            </span>
          </motion.div>
        </SectionReveal>

        {/* 3 Verified Giving Channels from PDF page 8 & 14 */}
        <SectionReveal delay={0.07} yOffset={16}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Method 1: Zelle Giving */}
            <motion.div
              className="bg-white rounded-3xl p-7 border border-stone-200 shadow-sm space-y-4 hover:border-[#b48227]/60 transition-all"
              whileHover={{ y: -4, boxShadow: '0 12px 32px 0 rgba(8,40,29,0.10)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#7414CA]/10 text-[#7414CA] flex items-center justify-center font-bold text-xl">
                  Z
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                  Zero Processing Fees
                </span>
              </div>

              <div>
                <h3 className="font-serif-heading font-bold text-stone-900 text-2xl">
                  Zelle Giving
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">
                  Direct bank-to-bank transfer with zero deduction fees. Send directly to our verified church Zelle account:
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between gap-2">
                <span className="font-mono text-sm sm:text-base font-bold text-[#08281d] break-all">
                  {giving.zelleEmail}
                </span>
                <motion.button
                  onClick={handleCopyZelle}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-semibold text-xs rounded-lg transition-colors shrink-0"
                >
                  {copiedZelle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedZelle ? 'Copied' : 'Copy'}</span>
                </motion.button>
              </div>

              <p className="text-[11px] text-stone-500">
                In your Zelle memo/note, please specify: <em>Tithe, Offering, or Building Fund</em>.
              </p>
            </motion.div>

            {/* Method 2: SMS Text Giving */}
            <motion.div
              className="bg-white rounded-3xl p-7 border border-stone-200 shadow-sm space-y-4 hover:border-[#b48227]/60 transition-all"
              whileHover={{ y: -4, boxShadow: '0 12px 32px 0 rgba(8,40,29,0.10)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#08281d] flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full uppercase">
                  Instant Mobile Text
                </span>
              </div>

              <div>
                <h3 className="font-serif-heading font-bold text-stone-900 text-2xl">
                  SMS Text Giving
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">
                  Give anytime directly from your phone in seconds. Send a text message to our dedicated church line:
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-stone-500 block">Text keyword:</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-[#08281d]">
                    GIVE to {giving.smsGivingNumber}
                  </span>
                </div>
                <motion.button
                  onClick={handleCopySMS}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-semibold text-xs rounded-lg transition-colors shrink-0"
                >
                  {copiedSMS ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSMS ? 'Copied' : 'Copy'}</span>
                </motion.button>
              </div>

              <p className="text-[11px] text-stone-500">
                Follow the quick one-time link sent to your phone to finalize your gift.
              </p>
            </motion.div>

          </div>
        </SectionReveal>

        {/* Method 3: Card Giving Portal */}
        <SectionReveal delay={0.09} yOffset={18}>
          <motion.div
            className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm space-y-6 hover:border-[#b48227]/60 transition-all"
            whileHover={{ y: -4, boxShadow: '0 12px 32px 0 rgba(8,40,29,0.10)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#b48227] flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-heading font-bold text-stone-900 text-2xl">
                    Card Checkout (Online Portal)
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500">
                    Visa, MasterCard, American Express, Discover
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-stone-700">Use the church’s giving portal to choose your amount and complete your donation.</p>
            <motion.a
              href={CHURCH_INFO.giving.onlinePortal}
              target="_blank"
              rel="noreferrer"
              className="home-button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowRight aria-hidden="true" /> Open the giving portal
            </motion.a>
          </motion.div>
        </SectionReveal>

      </div>

    </div>
  );
};
