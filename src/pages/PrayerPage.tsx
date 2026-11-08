import { FormError, useServerForm } from '../components/ServerForm';
import { PageIntro } from '../components/PageIntro';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Send, 
  CheckCircle2, 
  Lock, 
  Phone, 
  Mail, 
  Heart, 
  Clock, 
  UserCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { SectionReveal } from '../components/SectionReveal';
import type { PrayerInquiryItem } from '../data/adminStore';
import { CHURCH_INFO } from '../data/churchData';

interface PrayerPageProps {
  onNavigate: (route: string) => void;
}

export const PrayerPage: React.FC<PrayerPageProps> = ({ onNavigate }) => {
  const [submittedItem, setSubmittedItem] = useState<PrayerInquiryItem | null>(null);
  const { submit, busy: isSubmitting, error } = useServerForm();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'Spiritual Growth' as PrayerInquiryItem['category'],
    need: '',
    routing: 'Pastor Remi Afolabi (Pastor-in-Charge, Strictly Confidential)',
    urgency: 'Standard' as 'Standard' | 'Urgent' | 'Thanksgiving',
    preferredContact: 'Email & Phone',
    requestFollowupCall: true,
    confidentialToPastorOnly: true,
    consentUnderstood: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentUnderstood) return;
    const created = await submit<PrayerInquiryItem>('/forms/prayer', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      category: formData.category,
      subjectOrTopic: formData.subject || `${formData.category} Petition`,
      message: formData.need,
      isConfidentialToPastorOnly: formData.confidentialToPastorOnly || formData.routing.includes('Strictly Confidential'),
      urgency: formData.urgency,
      wantsCall: formData.requestFollowupCall,
      preferredContact: formData.preferredContact,
    });
    if (created) setSubmittedItem(created);
  };

  const handleReset = () => {
    setSubmittedItem(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: 'Spiritual Growth',
      need: '',
      routing: 'Pastor Remi Afolabi (Pastor-in-Charge, Strictly Confidential)',
      urgency: 'Standard',
      preferredContact: 'Email & Phone',
      requestFollowupCall: true,
      confidentialToPastorOnly: true,
      consentUnderstood: true
    });
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label="Prayer & pastoral care"
        title="Submit a Prayer Request"
        description="Share what’s on your heart with Pastor Remi Afolabi and our prayer team."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <SectionReveal delay={0.06} yOffset={16}>
        {submittedItem ? (
          /* Confirmation Message Upon Submission */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-200 shadow-xl space-y-6"
          >
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center ring-8 ring-emerald-50 shadow-inner"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                Delivered Directly to Church Leadership
              </span>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-900">
                Your Prayer Request Has Been Received
              </h2>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                Beloved <span className="font-semibold text-stone-900">{submittedItem.name}</span>, your prayer petition has been directly transferred to the Pastoral Altar of RCCG Dominion Hope of Glory. Pastor Remi Afolabi and our appointed intercessors are holding your request before God in faith.
              </p>
            </div>

            {/* Submission Receipt Card */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3 text-xs sm:text-sm text-stone-700">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <span className="text-stone-500 font-medium">Petition Reference ID:</span>
                <span className="font-mono font-semibold text-stone-900">{submittedItem.id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <span className="text-stone-500 font-medium">Recipient Leadership:</span>
                <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  {submittedItem.assignedMinister}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <span className="text-stone-500 font-medium">Prayer Focus:</span>
                <span className="font-medium text-stone-900">{submittedItem.category}</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <span className="text-stone-500 font-medium">Subject / Topic:</span>
                <span className="font-medium text-stone-900">{submittedItem.subjectOrTopic}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">Received Date & Time:</span>
                <span className="text-stone-800">{new Date(submittedItem.submittedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Scriptural Promise */}
            <div className="p-4 bg-emerald-900/5 rounded-2xl border border-emerald-900/10 text-xs text-[#08281d] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#08281d]">
                <Heart className="w-3.5 h-3.5 text-emerald-700 fill-emerald-100" />
                <span>Scriptural Assurance for Your Heart</span>
              </div>
              <p className="italic leading-relaxed text-stone-700">
                "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus." — Philippians 4:6–7
              </p>
            </div>

            {/* Privacy Reassurance */}
            <div className="flex items-start gap-2.5 text-xs text-stone-600 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
              <Lock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <p>
                <strong>Confidentiality Guarantee:</strong> Your information is treated in sacred confidence according to biblical pastoral standards and will never be shared without your explicit consent.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <motion.button
                type="button"
                onClick={handleReset}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-sm text-center"
              >
                Submit Another Request
              </motion.button>
              <motion.button
                type="button"
                onClick={() => onNavigate('/')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs sm:text-sm rounded-xl transition-all cursor-pointer text-center"
              >
                Return to Church Home
              </motion.button>
              <motion.button
                type="button"
                onClick={() => onNavigate('/watch')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-medium text-xs sm:text-sm rounded-xl transition-all cursor-pointer text-center"
              >
                Join Live Stream
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Dedicated Prayer Request Form */
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-7 sm:p-10 border border-stone-200 shadow-sm space-y-6">
            <FormError error={error} />
            
            <div className="space-y-1.5 border-b border-stone-200 pb-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                <Shield className="w-4 h-4 text-emerald-700" />
                <span>Direct Pastoral Submission Channel</span>
              </div>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-900">
                Church Leadership Prayer Form
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Whether you are seeking physical healing, financial breakthrough, family restoration, or spiritual direction, our Pastor and Altar of Intercession stand ready to pray with you.
              </p>
            </div>

            {/* Direct Routing Option */}
            <div className="space-y-2 bg-[#f6f9f7] p-4 rounded-2xl border border-emerald-900/10">
              <label className="block text-xs font-bold text-[#08281d] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Direct My Prayer Request To: *</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <label className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  formData.routing.includes('Pastor Remi')
                    ? 'bg-white border-[#08281d] shadow-xs text-stone-900 ring-1 ring-[#08281d]'
                    : 'bg-white/60 border-stone-200 text-stone-700 hover:bg-white'
                }`}>
                  <input
                    type="radio"
                    name="routing"
                    checked={formData.routing.includes('Pastor Remi')}
                    onChange={() => setFormData({ 
                      ...formData, 
                      routing: 'Pastor Remi Afolabi (Pastor-in-Charge, Strictly Confidential)',
                      confidentialToPastorOnly: true 
                    })}
                    className="mt-0.5 text-[#08281d] focus:ring-[#08281d]"
                  />
                  <div>
                    <span className="font-bold text-stone-900 block">Pastor Remi Afolabi Only</span>
                    <span className="text-[11px] text-stone-500">Strict pastoral seal. Handled exclusively by the Pastor-in-Charge.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  !formData.routing.includes('Pastor Remi')
                    ? 'bg-white border-[#08281d] shadow-xs text-stone-900 ring-1 ring-[#08281d]'
                    : 'bg-white/60 border-stone-200 text-stone-700 hover:bg-white'
                }`}>
                  <input
                    type="radio"
                    name="routing"
                    checked={!formData.routing.includes('Pastor Remi')}
                    onChange={() => setFormData({ 
                      ...formData, 
                      routing: 'Pastoral Team & Intercessory Prayer Altar',
                      confidentialToPastorOnly: false 
                    })}
                    className="mt-0.5 text-[#08281d] focus:ring-[#08281d]"
                  />
                  <div>
                    <span className="font-bold text-stone-900 block">Pastoral Team & Prayer Altar</span>
                    <span className="text-[11px] text-stone-500">Lifted by the church intercessory warriors during prayer meetings.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Full Name (or First Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Brother Emmanuel / Sister Grace"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08281d] bg-stone-50/40 focus:bg-white transition-colors"
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
                  placeholder="e.g. grace@example.com"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08281d] bg-stone-50/40 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(973) 000-0000"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08281d] bg-stone-50/40 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Urgency / Nature of Petition
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#08281d]"
                >
                  <option value="Standard">Standard Prayer Altar Need</option>
                  <option value="Urgent">Critical Need / Hospital Altar Request</option>
                  <option value="Thanksgiving">Thanksgiving / Answered Prayer Praise Report</option>
                </select>
              </div>
            </div>

            {/* Category & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Prayer Need Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#08281d]"
                >
                  <option value="Spiritual Growth">Spiritual Growth & Guidance</option>
                  <option value="Healing & Health">Healing & Physical Well-being</option>
                  <option value="Family & Marriage">Family, Marriage & Children</option>
                  <option value="Financial Breakthrough">Career, Business & Financial Breakthrough</option>
                  <option value="Theological / Doctrine">Spiritual Warfare & Deliverance</option>
                  <option value="Thanksgiving">Thanksgiving & Testimony</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Divine intervention on medical test result"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08281d] bg-stone-50/40 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Need Details */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Prayer Petition Details *
              </label>
              <textarea
                rows={5}
                required
                value={formData.need}
                onChange={(e) => setFormData({ ...formData, need: e.target.value })}
                placeholder="Please describe your prayer need with as much detail as you feel comfortable sharing. We stand with you in faith..."
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08281d] bg-stone-50/40 focus:bg-white transition-colors leading-relaxed"
              />
            </div>

            {/* Follow-up & Safeguards */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs text-stone-700">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requestFollowupCall}
                  onChange={(e) => setFormData({ ...formData, requestFollowupCall: e.target.checked })}
                  className="mt-0.5 rounded border-stone-300 text-[#08281d] focus:ring-[#08281d]"
                />
                <span className="font-medium text-stone-800">
                  I would appreciate a pastoral phone call or follow-up prayer session from Pastor Remi or a designated minister.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consentUnderstood}
                  onChange={(e) => setFormData({ ...formData, consentUnderstood: e.target.checked })}
                  required
                  className="mt-0.5 rounded border-stone-300 text-[#08281d] focus:ring-[#08281d]"
                />
                <span className="text-stone-600 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>I understand that this request is submitted directly to church leadership in pastoral confidence.</span>
                </span>
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting || !formData.consentUnderstood}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#08281d] hover:bg-[#0c392a] disabled:opacity-50 text-[#fae19c] font-bold py-3.5 rounded-xl shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting to Pastoral Altar...' : 'Submit Prayer Request to Leadership'}</span>
            </motion.button>
          </form>
        )}
        </SectionReveal>

        {/* Alternate pastoral actions */}
        <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-800" />
            <span>Have a theological or life question for the Pastor?</span>
          </div>
          <div className="flex gap-4 font-semibold text-[#08281d]">
            <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate('/ask-pastor')} className="hover:underline cursor-pointer">
              Ask the Pastor →
            </motion.button>
            <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate('/contact')} className="hover:underline cursor-pointer">
              Contact Church Office →
            </motion.button>
          </div>
        </div>

      </div>

    </div>
  );
};
