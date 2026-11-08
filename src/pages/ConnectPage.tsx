import { FormError, useServerForm } from '../components/ServerForm';
import { PageIntro } from '../components/PageIntro';
import React, { useState } from 'react';
import { Users, UserPlus, GraduationCap, Award, Droplets, CheckCircle2, Heart, Gift, Sparkles, Send } from 'lucide-react';
import { CHURCH_INFO } from '../data/churchData';
import { SectionReveal } from '../components/SectionReveal';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectPageProps {
  onNavigate: (route: string) => void;
}

export const ConnectPage: React.FC<ConnectPageProps> = ({ onNavigate }) => {
  const submission = useServerForm();
  const [subscribe, setSubscribe] = useState(false);
  const [activeForm, setActiveForm] = useState<'newcomer' | 'membership' | 'baptism' | 'wit'>('newcomer');
  const [submittedForm, setSubmittedForm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    waterBaptized: 'No',
    priorChurch: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const types = { newcomer: 'Newcomer', membership: 'Membership', baptism: 'Water Baptism', wit: 'Workers in Training (WIT)' };
    const { fullName, email, phone, address, notes, waterBaptized } = formData;
    if (await submission.submit('/forms/connect', {
      formType: types[activeForm], fullName, email, phone, address, notes, waterBaptized,
      subscribe: activeForm === 'membership' && subscribe,
    })) {
      setSubmittedForm(activeForm);
      setSubscribe(false);
    }
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label="Belonging & discipleship"
        title="Connect, Grow & Belong"
        description="Explore your next step, from getting to know DHOG to baptism, membership, and serving."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        
        {/* 4 Pathway Cards */}
        <SectionReveal delay={0.05} yOffset={16} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveForm('newcomer');
              setSubmittedForm(null);
            }}
            className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
              activeForm === 'newcomer'
                ? 'bg-[#08281d] text-white border-[#08281d] shadow-md'
                : 'bg-white text-stone-900 border-stone-200 hover:border-[#b48227]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${activeForm === 'newcomer' ? 'bg-white/10 text-[#fae19c]' : 'bg-amber-50 text-[#b48227]'}`}>
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg">Newcomer Form</h3>
            <p className={`text-xs mt-1 leading-relaxed ${activeForm === 'newcomer' ? 'text-stone-300' : 'text-stone-600'}`}>
              First-time guest registration and welcome gift packet reservation.
            </p>
          </motion.button>

          <button
            onClick={() => {
              setActiveForm('membership');
              setSubmittedForm(null);
            }}
            className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
              activeForm === 'membership'
                ? 'bg-[#08281d] text-white border-[#08281d] shadow-md'
                : 'bg-white text-stone-900 border-stone-200 hover:border-[#b48227]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${activeForm === 'membership' ? 'bg-white/10 text-[#fae19c]' : 'bg-emerald-50 text-[#08281d]'}`}>
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg">Membership Form</h3>
            <p className={`text-xs mt-1 leading-relaxed ${activeForm === 'membership' ? 'text-stone-300' : 'text-stone-600'}`}>
              Commit to the church family & attend the monthly orientation.
            </p>
          </button>

          <button
            onClick={() => {
              setActiveForm('baptism');
              setSubmittedForm(null);
            }}
            className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
              activeForm === 'baptism'
                ? 'bg-[#08281d] text-white border-[#08281d] shadow-md'
                : 'bg-white text-stone-900 border-stone-200 hover:border-[#b48227]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${activeForm === 'baptism' ? 'bg-white/10 text-[#fae19c]' : 'bg-blue-50 text-blue-700]'}`}>
              <Droplets className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-base sm:text-lg">Believers & Baptism</h3>
            <p className={`text-xs mt-1 leading-relaxed ${activeForm === 'baptism' ? 'text-stone-300' : 'text-stone-600'}`}>
              Foundational discipleship and water baptism by immersion.
            </p>
          </button>

          <button
            onClick={() => {
              setActiveForm('wit');
              setSubmittedForm(null);
            }}
            className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
              activeForm === 'wit'
                ? 'bg-[#08281d] text-white border-[#08281d] shadow-md'
                : 'bg-white text-stone-900 border-stone-200 hover:border-[#b48227]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${activeForm === 'wit' ? 'bg-white/10 text-[#fae19c]' : 'bg-stone-100 text-stone-800'}`}>
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg">Workers in Training</h3>
            <p className={`text-xs mt-1 leading-relaxed ${activeForm === 'wit' ? 'text-stone-300' : 'text-stone-600'}`}>
              Volunteer leadership and departmental servant preparation.
            </p>
          </button>

        </SectionReveal>

        {/* Selected Form Container */}
        <SectionReveal delay={0.08} yOffset={18} className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm max-w-2xl mx-auto">
          {submittedForm ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
              <h3 className="text-2xl font-serif-heading font-bold text-stone-900">
                Form Successfully Submitted!
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Thank you, <span className="font-semibold text-stone-900">{formData.fullName}</span>. Your {submittedForm} registration has been received by our ministerial discipleship desk. You will receive orientation details by email and phone.
              </p>
              <button
                onClick={() => setSubmittedForm(null)}
                className="mt-3 px-6 py-2.5 bg-[#08281d] text-white text-xs font-semibold rounded-xl"
              >
                Submit Another Form
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormError error={submission.error} />
              
              <div className="border-b border-stone-100 pb-3">
                <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider">
                  Registration Step
                </span>
                <h3 className="text-2xl font-serif-heading font-bold text-stone-900 mt-1 capitalize">
                  {activeForm === 'newcomer' && 'New Comers Registration Form'}
                  {activeForm === 'membership' && 'Church Membership Registration'}
                  {activeForm === 'baptism' && 'Believers & Baptismal Class Registration'}
                  {activeForm === 'wit' && 'Workers in Training (WIT) Enrollment'}
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Brother Samuel"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile Phone *
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, City, Zip"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                />
              </div>

              {activeForm === 'baptism' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Have you been baptized by water immersion before?
                  </label>
                  <select
                    value={formData.waterBaptized}
                    onChange={(e) => setFormData({ ...formData, waterBaptized: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm bg-white"
                  >
                    <option value="No">No, I desire water baptism</option>
                    <option value="Yes">Yes, previously baptized</option>
                  </select>
                </div>
              )}

              {activeForm === 'membership' && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                  <strong>Orientation schedule:</strong> Held after worship service on the last Sunday of each month in the fellowship hall.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Additional Notes or Questions
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any questions for the discipleship coordinator..."
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                />
              </div>

              {activeForm === 'membership' && (
                <label className="flex items-start gap-2 text-sm text-stone-700">
                  <input type="checkbox" checked={subscribe} onChange={event => setSubscribe(event.target.checked)} />
                  Email me church news and event invitations. I can unsubscribe at any time.
                </label>
              )}
              <button
                type="submit"
                disabled={submission.busy}
                className="w-full bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-bold py-3.5 rounded-xl shadow transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Form Registration</span>
              </button>
            </form>
          )}
        </SectionReveal>

      </div>

    </div>
  );
};
