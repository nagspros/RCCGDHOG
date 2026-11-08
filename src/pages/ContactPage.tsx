import { FormError, useServerForm } from '../components/ServerForm';
import { usePublicData } from '../data/api';
import type { PublicSite } from '../data/adminStore';
import { INITIAL_CHURCH_CONTACT } from '../data/adminStore';
import { PageIntro } from '../components/PageIntro';
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Navigation, Send, CheckCircle2, Clock, Car, MessageSquare } from 'lucide-react';
import { SectionReveal } from '../components/SectionReveal';
import { CHURCH_INFO } from '../data/churchData';
import { motion } from 'framer-motion';

interface ContactPageProps {
  onNavigate: (route: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const contactConfig = usePublicData<Partial<PublicSite>>('/public/site', {}).churchContactConfig ?? INITIAL_CHURCH_CONTACT;
  const submission = useServerForm();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Question',
    message: ''
  });




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await submission.submit('/forms/contact', formData)) setSubmitted(true);
  };

  const openGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactConfig.sanctuaryAddress || CHURCH_INFO.officialParishAddress)}`,
      '_blank'
    );
  };


  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label="Newark, New Jersey"
        title="Contact Dominion Hope of Glory"
        description="Find our church office, send a message, or get directions to the sanctuary."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Church Office Contacts & Location Info */}
          <SectionReveal delay={0.05} yOffset={16} className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-7 border border-stone-200 shadow-sm space-y-5">
              <h3 className="font-serif-heading font-bold text-stone-900 text-2xl">
                Church Location & Office
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b48227] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Sanctuary Address</span>
                    <p className="text-stone-700">{contactConfig.sanctuaryAddress || CHURCH_INFO.officialParishAddress}</p>
                    <button
                      onClick={openGoogleMaps}
                      className="mt-1.5 inline-flex items-center gap-1 font-semibold text-[#08281d] hover:text-[#b48227] text-xs cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Get Directions on Google Maps →</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-stone-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#08281d] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Telephone & SMS</span>
                    <a href={`tel:${contactConfig.phone || CHURCH_INFO.phone}`} className="text-stone-800 font-semibold hover:underline block">
                      {contactConfig.phone || CHURCH_INFO.phone} (Main Church Line)
                    </a>
                    <span className="text-stone-500 text-xs block">
                      Directory Phone: {contactConfig.directoryPhone || CHURCH_INFO.directoryPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-stone-100">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Official Church Email</span>
                    <a href={`mailto:${contactConfig.email || CHURCH_INFO.email}`} className="text-[#08281d] font-semibold hover:underline">
                      {contactConfig.email || CHURCH_INFO.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-stone-100 rounded-3xl p-7 border border-stone-200/80 space-y-4">
              <h4 className="font-serif-heading font-bold text-stone-900 text-lg">
                Quick Visitor Pathways
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('/visit')}
                  className="w-full text-left p-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 font-semibold text-xs sm:text-sm text-stone-900 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#b48227]" />
                    <span>Plan Your First Sunday Visit</span>
                  </span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => onNavigate('/visit')}
                  className="w-full text-left p-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 font-semibold text-xs sm:text-sm text-stone-900 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#08281d]" />
                    <span>Request Church Shuttle Ride</span>
                  </span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => onNavigate('/ask-pastor')}
                  className="w-full text-left p-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 font-semibold text-xs sm:text-sm text-stone-900 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#b48227]" />
                    <span>Ask Pastor Remi a Question</span>
                  </span>
                  <span>→</span>
                </button>
              </div>
            </div>

          </SectionReveal>

          {/* Right Column: Send Us a Message Form from PDF page 4 & 7 */}
          <SectionReveal delay={0.08} yOffset={18} className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm space-y-6">
              
              <div className="space-y-1">
                <h3 className="font-serif-heading font-bold text-stone-900 text-2xl">
                  Send Us a Message
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm">
                  Our church secretariat monitors submissions daily and will be happy to assist you.
                </p>
              </div>

              {submitted ? (
                <div className="py-8 text-center space-y-3 bg-stone-50 rounded-2xl p-6 border border-stone-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-xl font-bold text-stone-900">Message Delivered</h4>
                  <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto">
                    Thank you, <span className="font-semibold text-stone-900">{formData.name}</span>. Your message is in the church office inbox. The team can reply to {formData.email}.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 px-5 py-2 bg-[#08281d] text-white text-xs font-semibold rounded-xl"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormError error={submission.error} />
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
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Phone (optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(973) 000-0000"
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm bg-white"
                    >
                      <option value="General Question">General Church Inquiry</option>
                      <option value="Baby Dedication">Baby Dedication / Thanksgiving</option>
                      <option value="Wedding / Marriage Blessing">Wedding / Marriage Blessing</option>
                      <option value="Community Welfare Support">Community Welfare / Food Pantry Support</option>
                      <option value="Volunteer Ministry">Volunteer & Ministry Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How may our church community assist you today?"
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submission.busy}
                    className="w-full bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-bold py-3.5 rounded-xl shadow transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Church Message</span>
                  </button>
                </form>
              )}

            </div>
          </SectionReveal>

        </div>

      </div>

    </div>
  );
};
