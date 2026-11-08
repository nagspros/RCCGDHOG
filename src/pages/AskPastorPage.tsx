import { FormError, useServerForm } from '../components/ServerForm';
import { PageIntro } from '../components/PageIntro';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { CHURCH_INFO } from '../data/churchData';
import { SectionReveal } from '../components/SectionReveal';

interface AskPastorPageProps {
  onNavigate: (route: string) => void;
}

export const AskPastorPage: React.FC<AskPastorPageProps> = ({ onNavigate }) => {
  const submission = useServerForm();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Biblical / Theological Question',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await submission.submit('/forms/ask-pastor', formData)) setSubmitted(true);
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label="Pastoral care"
        title="Ask the Pastor"
        description="Send Pastor Remi Afolabi a question about Scripture, discipleship, family life, or church doctrine."
        parent={{ title: "Pastor Remi Afolabi", route: "/about/pastor" }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <SectionReveal delay={0.06} yOffset={16}>
        
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-200 shadow-md text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
              className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-900">
              Message Sent to Pastor Remi
            </h2>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Thank you, <span className="font-semibold text-stone-900">{formData.name}</span>. Pastor Remi Afolabi personally reviews each pastoral question and will reply via email or phone at his earliest convenience.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <motion.button
                onClick={() => setSubmitted(false)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 bg-[#08281d] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Send Another Question
              </motion.button>
              <motion.button
                onClick={() => onNavigate('/sermons')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 bg-stone-100 text-stone-800 text-xs font-semibold rounded-xl hover:bg-stone-200 cursor-pointer"
              >
                Browse Sermons
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm space-y-6">
            
            <FormError error={submission.error} />
            <div className="space-y-1">
              <h2 className="font-serif-heading text-2xl font-bold text-stone-900">
                Direct Pastoral Inquiry
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm">
                Form requires full name, email, phone and message as outlined in the church directory.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08281d]"
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
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08281d]"
                />
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
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08281d]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Subject Topic
              </label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm bg-white"
              >
                <option value="Biblical / Theological Question">Biblical / Theological Question</option>
                <option value="Personal Spiritual Growth">Personal Spiritual Growth</option>
                <option value="Marriage & Relationship Guidance">Marriage & Relationship Guidance</option>
                <option value="Salvation & Discipleship Foundations">Salvation & Discipleship Foundations</option>
                <option value="Water Baptism Inquiries">Water Baptism Inquiries</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Message / Question *
              </label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your question for Pastor Remi..."
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08281d]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>All pastoral inquiries are strictly confidential between you and the pastor.</span>
            </div>

            <motion.button
              type="submit"
              disabled={submission.busy}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-bold py-3.5 rounded-xl shadow transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send to Pastor Remi</span>
            </motion.button>
          </form>
        )}
        </SectionReveal>

      </div>

    </div>
  );
};

