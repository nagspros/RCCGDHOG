import { PageIntro } from '../components/PageIntro';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Youtube, ExternalLink, Calendar, Heart, MessageSquare, Clock, MapPin, Radio, Users, CheckCircle2, Volume2, Share2 } from 'lucide-react';
import { CHURCH_INFO } from '../data/churchData';
import { SectionReveal } from '../components/SectionReveal';
import { INITIAL_LIVE_STREAM, type PublicLive } from '../data/adminStore';
import { usePublicData } from '../data/api';
import { FormError, useServerForm } from '../components/ServerForm';

interface WatchPageProps {
  onNavigate: (route: string) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({ onNavigate }) => {
  const live = usePublicData<PublicLive>('/public/live', {
    ...INITIAL_LIVE_STREAM, embedUrl: null, channelUrl: `${CHURCH_INFO.youtubeUrl}/live`,
  });
  const submission = useServerForm();
  const [isPlaying, setIsPlaying] = useState(false);
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);
  const [prayerText, setPrayerText] = useState('');
  const [prayerName, setPrayerName] = useState('');

  const isLiveNow = live.status === 'LIVE NOW';

  const handleSendPrayer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prayerText.trim()) return;
    if (await submission.submit('/forms/prayer', {
      name: prayerName.trim() || 'Online Worshipper',
      category: 'Spiritual Growth',
      subjectOrTopic: 'Online worship prayer',
      message: prayerText,
    })) {
      setPrayerSubmitted(true);
      setPrayerText('');
    }
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      
      <PageIntro
        label={isLiveNow ? 'Live sanctuary broadcast' : 'Online worship'}
        title="Watch & Worship Online"
        description="Join the sanctuary online or catch up on recent services and teachings."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        
        {/* Main Broadcast Screen with Player */}
        <SectionReveal delay={0.05} yOffset={16} className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
          
          <div className="bg-black aspect-video relative flex items-center justify-center overflow-hidden">
            {isPlaying && live.embedUrl ? (
              <iframe
                src={`${live.embedUrl}?autoplay=1&rel=0`}
                title={live.streamTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={live.thumbnailUrl || '/assets/extracted/hero_worship.jpg'}
                  alt={live.streamTitle}
                  className="w-full h-full object-cover filter brightness-70 scale-105"
                />

                {/* Broadcast Overlay Badges */}
                <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-2">
                  <motion.span
                    animate={{ scale: isLiveNow ? [1, 1.05, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`px-3 py-1 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow flex items-center gap-1.5 ${
                    isLiveNow ? 'bg-red-600 animate-pulse' : 'bg-[#08281d] text-[#fae19c]'
                  }`}>
                    {isLiveNow && <Radio className="w-3.5 h-3.5" />}
                    <span>{live.status}</span>
                  </motion.span>
                  

                </div>

                {/* Center Play Button */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
                  {live.embedUrl ? (
                    <motion.button onClick={() => setIsPlaying(true)} aria-label="Play YouTube video"
                      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                      className="mb-4 grid size-16 place-items-center rounded-full bg-[#fae19c] text-[#08281d] hover:bg-white">
                      <Play className="size-8 fill-current" />
                    </motion.button>
                  ) : (
                    <a href={live.channelUrl} target="_blank" rel="noreferrer" className="mb-4 rounded-xl bg-[#fae19c] px-4 py-2 font-semibold text-[#08281d]">
                      Open YouTube channel
                    </a>
                  )}
                  <h2 className="text-white text-2xl sm:text-4xl font-bold font-serif-heading max-w-xl text-balance drop-shadow-md">
                    {live.streamTitle}
                  </h2>
                  <p className="text-[#d1e2db] text-sm sm:text-base mt-2">
                    {live.preacher} · {live.scripture}
                  </p>
                </div>

                {/* Bottom Right Direct Link */}
                <div className="absolute bottom-6 right-6 z-20">
                  <a
                    href={live.channelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-lg transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Interactive Live Control Bar */}
          <div className="p-6 bg-stone-900 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-stone-300">
            <div className="flex items-center gap-4">
              <span className="text-stone-300">
                <Clock className="w-4 h-4 inline mr-1 text-[#fae19c]" />
                {live.scheduledTime}
              </span>
              {live.pinnedNotice && (
                <span className="text-[#fae19c] hidden md:inline">
                  "{live.pinnedNotice}"
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isPlaying && (
                <button
                  onClick={() => setIsPlaying(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium cursor-pointer"
                >
                  Reset Player View
                </button>
              )}
              <motion.button
                onClick={() => onNavigate('/give')}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-medium border border-[#fae19c]/30 transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Give Offering Online</span>
              </motion.button>
            </div>
          </div>

        </SectionReveal>

        {/* Live Prayer Petition Box & Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Live Online Prayer Petition Form */}
          <div className="md:col-span-6 bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b48227] uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Live Sanctuary Prayer Watch</span>
            </div>
            <h3 className="font-serif-heading font-bold text-stone-900 text-2xl">
              Can We Pray With You Right Now?
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Watching from home or abroad? Our intercessors and ministerial team lift up every prayer note during altar ministration.
            </p>

            {prayerSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-3 text-xs sm:text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Your prayer note has been received and added to today’s prayer altar.</span>
              </div>
            ) : (
              <form onSubmit={handleSendPrayer} className="space-y-3 pt-2 text-xs">
                <FormError error={submission.error} />
                <input
                  type="text"
                  placeholder="Your Name (or Sister / Brother)"
                  value={prayerName}
                  onChange={(e) => setPrayerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#08281d]"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Type your prayer request or praise report here..."
                  value={prayerText}
                  onChange={(e) => setPrayerText(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#08281d]"
                />
                <button
                  type="submit"
                  disabled={submission.busy}
                  className="w-full py-2.5 bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Send to Pastor & Prayer Altar
                </button>
              </form>
            )}
          </div>

          {/* Broadcast Schedule Card */}
          <div className="md:col-span-6 bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b48227] uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Broadcast Times</span>
            </div>
            <h3 className="font-serif-heading font-bold text-stone-900 text-2xl">
              Weekly Live Gathering Times
            </h3>
            
            <div className="space-y-3 text-xs sm:text-sm text-stone-700">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 block">Sunday Worship Celebration</span>
                <span className="text-stone-600">Every Sunday · 10:00 AM – 12:15 PM EST (Doors open 8:30 AM)</span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 block">Wednesday Bible Study (Digging Deep)</span>
                <span className="text-stone-600">Every Wednesday · 7:00 PM – 8:30 PM EST</span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 block">Night of Glory Prayer Vigil</span>
                <span className="text-stone-600">Last Friday of Every Month · 9:00 PM – 1:00 AM EST</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onNavigate('/sermons')}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Browse Sermon Archive →
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
