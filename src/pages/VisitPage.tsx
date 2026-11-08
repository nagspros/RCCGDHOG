import { FormError, useServerForm } from '../components/ServerForm';
import { SectionLink } from '../components/SectionLink';
import { PageIntro } from '../components/PageIntro';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Navigation, Car, Users, CheckCircle2, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { SectionReveal } from '../components/SectionReveal';
import { CHURCH_INFO } from '../data/churchData';

interface VisitPageProps {
  onNavigate: (route: string) => void;
}

export const VisitPage: React.FC<VisitPageProps> = ({ onNavigate }) => {
  const visitSubmission = useServerForm();
  const rideSubmission = useServerForm();
  const [activeTab, setActiveTab] = useState<'plan' | 'ride'>('plan');
  
  // Plan visit form state
  const [planSubmitted, setPlanSubmitted] = useState(false);
  const [planData, setPlanData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceDate: 'Next Sunday (10:00 AM)',
    adults: '1',
    children: '0',
    firstTimeRCCG: 'Yes',
    notes: ''
  });

  // Need ride form state
  const [rideSubmitted, setRideSubmitted] = useState(false);
  const [rideData, setRideData] = useState({
    name: '',
    phone: '',
    pickupAddress: '',
    city: 'Newark',
    riders: '1',
    service: 'Sunday Worship (10:00 AM)'
  });

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, serviceDate, adults, children, notes } = planData;
    if (await visitSubmission.submit('/forms/visit', {
      name, email, phone, serviceDate, guests: `${adults} adults, ${children} children`, specialNeeds: notes,
    })) setPlanSubmitted(true);
  };

  const handleRideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, pickupAddress, city, riders, service } = rideData;
    if (await rideSubmission.submit('/forms/ride', {
      name, phone, address: `${pickupAddress}, ${city}`, passengers: riders, service,
    })) setRideSubmitted(true);
  };

  const openGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CHURCH_INFO.officialParishAddress)}`,
      '_blank'
    );
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label="Newark, New Jersey"
        title="Visit Dominion Hope of Glory"
        description="Join us for Sunday worship at 10:00 AM. Find directions, plan your first visit, or arrange a ride."
      >
        <div className="page-intro-actions">
          <motion.button
            onClick={openGoogleMaps}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fae19c] hover:bg-[#f6d782] text-[#08281d] font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>Open Directions in Google Maps</span>
          </motion.button>
          <SectionLink id="visit-forms" className="home-button home-button-outline" onJump={() => setActiveTab('plan')}>
            Plan your visit
          </SectionLink>
          <SectionLink id="visit-forms" className="home-button home-button-outline" onJump={() => setActiveTab('ride')}>
            <Car aria-hidden="true" /> Request a ride
          </SectionLink>
        </div>
      </PageIntro>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        
        {/* Location & Times Overview Strip */}
        <SectionReveal delay={0.05} yOffset={16}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b48227] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                Official Parish Address
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 font-medium">
                {CHURCH_INFO.officialParishAddress}
              </p>
              <p className="text-[11px] text-stone-500">
                Convenient parking available on-site and on surrounding streets in Newark.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#08281d] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                Sunday Worship Schedule
              </h3>
              <p className="text-xs sm:text-sm text-stone-700">
                <strong className="text-stone-900">8:30 AM:</strong> Doors open & Workers' Prayer<br />
                <strong className="text-stone-900">10:00 AM:</strong> Main Worship Service
              </p>
              <p className="text-[11px] text-stone-500">
                In-person in the sanctuary and streamed online worldwide.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.16 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                Complimentary Shuttle
              </h3>
              <p className="text-xs sm:text-sm text-stone-700">
                Free van rides provided for students, seniors, and non-drivers across Newark.
              </p>
              <button
                onClick={() => setActiveTab('ride')}
                className="text-xs font-bold text-[#08281d] hover:underline cursor-pointer"
              >
                Book a free pickup →
              </button>
            </motion.div>

          </div>
        </SectionReveal>

        {/* Interactive In-Page Forms Switch */}
        <SectionReveal delay={0.08} yOffset={18}>
          <div id="visit-forms" tabIndex={-1} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          
          <div className="flex border-b border-stone-200 bg-stone-50 px-6 sm:px-8 pt-4 gap-4">
            <motion.button
              onClick={() => setActiveTab('plan')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={activeTab === 'plan'}
              className={`pb-3 text-sm sm:text-base font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'plan'
                  ? 'border-[#08281d] text-[#08281d]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Plan a visit
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('ride')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={activeTab === 'ride'}
              className={`pb-3 text-sm sm:text-base font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'ride'
                  ? 'border-[#08281d] text-[#08281d]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Request a ride
            </motion.button>
          </div>

          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
            {activeTab === 'plan' ? (
              <motion.div
                key="plan-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {planSubmitted ? (
                  <div className="max-w-xl mx-auto text-center py-8 space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                    <h3 className="text-2xl font-serif-heading font-bold text-stone-900">
                      We Look Forward to Seeing You!
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">
                      Thank you, <span className="font-semibold text-stone-900">{planData.name}</span>! Our Welcome & Hospitality team has recorded your visit. When you arrive at 337 Avon Avenue, our greeters will have a personalized welcome packet ready for you.
                    </p>
                    <button
                      onClick={() => setPlanSubmitted(false)}
                      className="mt-4 px-6 py-2.5 bg-[#08281d] text-white text-xs font-semibold rounded-xl"
                    >
                      Plan Another Visit
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePlanSubmit} className="max-w-2xl mx-auto space-y-5">
                    <FormError error={visitSubmission.error} />
                    <div>
                      <h3 className="text-xl font-serif-heading font-bold text-stone-900">
                        Let Us Know You're Coming
                      </h3>
                      <p className="text-stone-600 text-xs sm:text-sm mt-1">
                        We will have a host ready at the door to welcome your family and help you find great seats.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={planData.name}
                          onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
                          placeholder="Your name"
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
                          value={planData.email}
                          onChange={(e) => setPlanData({ ...planData, email: e.target.value })}
                          placeholder="you@example.com"
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Mobile Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={planData.phone}
                          onChange={(e) => setPlanData({ ...planData, phone: e.target.value })}
                          placeholder="(973) 000-0000"
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Service
                        </label>
                        <select
                          value={planData.serviceDate}
                          onChange={(e) => setPlanData({ ...planData, serviceDate: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm bg-white"
                        >
                          <option value="Next Sunday (10:00 AM)">Next Sunday Worship (10:00 AM)</option>
                          <option value="Wednesday Bible Study (7:00 PM)">Wednesday Bible Study (7:00 PM)</option>
                          <option value="Night of Glory Vigil (9:00 PM)">Night of Glory Vigil (Last Friday)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Number of Adults
                        </label>
                        <select
                          value={planData.adults}
                          onChange={(e) => setPlanData({ ...planData, adults: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm bg-white"
                        >
                          {[1, 2, 3, 4, 5, '6+'].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Children with You
                        </label>
                        <select
                          value={planData.children}
                          onChange={(e) => setPlanData({ ...planData, children: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm bg-white"
                        >
                          {[0, 1, 2, 3, 4, '5+'].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Any questions or special assistance (wheelchair, interpretation, prayer)?
                      </label>
                      <textarea
                        rows={2}
                        value={planData.notes}
                        onChange={(e) => setPlanData({ ...planData, notes: e.target.value })}
                        placeholder="Let us know how we can best serve you..."
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={visitSubmission.busy}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-[#fae19c] hover:bg-[#f6d782] text-[#08281d] font-bold py-3.5 rounded-xl shadow transition-all text-sm sm:text-base cursor-pointer"
                    >
                      Confirm My Visit
                    </motion.button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="ride-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {rideSubmitted ? (
                  <div className="max-w-xl mx-auto text-center py-8 space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                    <h3 className="text-2xl font-serif-heading font-bold text-stone-900">
                      Ride Request Confirmed!
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">
                      Thank you, <span className="font-semibold text-stone-900">{rideData.name}</span>. Pastor Adedeji Ibraheem and our transportation drivers will pick you up at <span className="font-semibold text-stone-900">{rideData.pickupAddress}, {rideData.city}</span> for {rideData.service}.
                    </p>
                    <p className="text-xs text-stone-500">
                      Our driver will call or text {rideData.phone} before arrival.
                    </p>
                    <button
                      onClick={() => setRideSubmitted(false)}
                      className="mt-4 px-6 py-2.5 bg-[#08281d] text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Submit Another Ride Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRideSubmit} className="max-w-2xl mx-auto space-y-5">
                    <FormError error={rideSubmission.error} />
                    <div>
                      <h3 className="text-xl font-serif-heading font-bold text-stone-900">
                        Need a Ride? Church Transportation Request
                      </h3>
                      <p className="text-stone-600 text-xs sm:text-sm mt-1">
                        Complimentary transportation service for students, seniors, and Newark community residents.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={rideData.name}
                          onChange={(e) => setRideData({ ...rideData, name: e.target.value })}
                          placeholder="Your full name"
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
                          value={rideData.phone}
                          onChange={(e) => setRideData({ ...rideData, phone: e.target.value })}
                          placeholder="(973) 000-0000"
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Pickup Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={rideData.pickupAddress}
                        onChange={(e) => setRideData({ ...rideData, pickupAddress: e.target.value })}
                        placeholder="Street address & apartment/dorm number"
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          City / Neighborhood
                        </label>
                        <input
                          type="text"
                          value={rideData.city}
                          onChange={(e) => setRideData({ ...rideData, city: e.target.value })}
                          placeholder="Newark, East Orange, Irvington..."
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Riders
                        </label>
                        <select
                          value={rideData.riders}
                          onChange={(e) => setRideData({ ...rideData, riders: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm bg-white"
                        >
                          {[1, 2, 3, 4, '5+'].map((n) => (
                            <option key={n} value={n}>{n} Passenger(s)</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={rideSubmission.busy}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-bold py-3.5 rounded-xl shadow transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Car className="w-4 h-4" />
                      <span>Request Free Shuttle Ride</span>
                    </motion.button>
                  </form>
                )}
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </SectionReveal>

      </div>

    </div>
  );
};
