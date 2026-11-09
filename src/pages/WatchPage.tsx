import { PageIntro } from '../components/PageIntro';
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Maximize,
  Youtube,
  ExternalLink,
  Calendar,
  Heart,
  MessageSquare,
  Radio,
  CheckCircle2,
  Video
} from 'lucide-react';
import { CHURCH_INFO } from '../data/churchData';
import { LEGACY_SERMONS } from '../data/legacyArchive';
import { youtubeEmbedUrl, youtubeVideoId, youtubeWatchUrl } from '../data/youtube';
import { SectionReveal } from '../components/SectionReveal';
import { INITIAL_LIVE_STREAM, type PublicLive } from '../data/adminStore';
import { usePublicData } from '../data/api';
import { FormError, useServerForm } from '../components/ServerForm';

interface ServiceVideo {
  id: string;
  title: string;
  preacher: string;
  date: string;
  embedUrl: string;
  watchUrl: string;
  thumbnailUrl: string;
}

const DEFAULT_THUMBNAIL = '/assets/extracted/hero_worship.jpg';
const RECORDINGS: ServiceVideo[] = LEGACY_SERMONS.flatMap(sermon => {
  const id = youtubeVideoId(sermon.videoUrl);
  const embedUrl = youtubeEmbedUrl(sermon.videoUrl);
  const watchUrl = youtubeWatchUrl(sermon.videoUrl);
  return id && embedUrl && watchUrl ? [{
    id,
    embedUrl,
    watchUrl,
    title: sermon.title,
    preacher: sermon.preacher,
    date: sermon.type,
    thumbnailUrl: sermon.imageSrc || DEFAULT_THUMBNAIL,
  }] : [];
}).slice(0, 5);

interface WatchPageProps {
  onNavigate: (route: string) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({ onNavigate }) => {
  const live = usePublicData<PublicLive>('/public/live', {
    ...INITIAL_LIVE_STREAM,
    embedUrl: null,
    channelUrl: `${CHURCH_INFO.youtubeUrl}/live`,
  });
  const submission = useServerForm();
  const [selectedService, setSelectedService] = useState<ServiceVideo | null>(null);
  const [playingId, setPlayingId] = useState<string>();
  const [fillsViewport, setFillsViewport] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);
  const [prayerText, setPrayerText] = useState('');
  const [prayerName, setPrayerName] = useState('');
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const isLiveNow = live.status === 'LIVE NOW';

  const broadcastId = youtubeVideoId(live.embedUrl ?? undefined);
  const broadcast = live.embedUrl && broadcastId ? {
    id: broadcastId,
    title: live.streamTitle || 'Sanctuary Broadcast',
    preacher: live.preacher,
    date: live.status,
    embedUrl: live.embedUrl,
    watchUrl: youtubeWatchUrl(broadcastId) || live.channelUrl,
    thumbnailUrl: live.thumbnailUrl || DEFAULT_THUMBNAIL,
  } : null;
  const activeVideo = selectedService ?? broadcast ?? RECORDINGS[0];
  const isPlaying = playingId === activeVideo.id;
  const isWatchingLive = !selectedService && Boolean(broadcast) && isLiveNow;

  function play(video: ServiceVideo) {
    setPlayingId(video.id);
    playerContainerRef.current?.focus({ preventScroll: true });
  }

  async function toggleFullscreen() {
    const player = playerContainerRef.current;
    if (!player) return;
    if (fillsViewport) {
      setFillsViewport(false);
    } else if (document.fullscreenElement === player) {
      await document.exitFullscreen();
    } else {
      try {
        await player.requestFullscreen();
      } catch {
        setFillsViewport(true);
      }
    }
  }

  useEffect(() => {
    if (!fillsViewport) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFillsViewport(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [fillsViewport]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = document.fullscreenElement === playerContainerRef.current;
      setIsFullscreen(fullscreen);
      if (fullscreen) playerContainerRef.current?.focus();
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
        description="Watch live services and church recordings right here."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">

        {/* Main Broadcast Screen with Embedded Player */}
        <SectionReveal delay={0.05} yOffset={16} className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">

          <div
            ref={playerContainerRef}
            tabIndex={-1}
            aria-label="Worship video player"
            className={`flex min-h-[200px] flex-col items-center justify-center overflow-hidden bg-black fullscreen:h-full ${
              fillsViewport ? 'fixed inset-0 z-[100] h-dvh w-screen' : 'relative aspect-video'
            }`}
          >
            {(isFullscreen || fillsViewport) && (
              <button type="button" onClick={toggleFullscreen}
                className="self-end px-4 py-2 text-sm font-semibold text-white hover:underline">
                Exit Full Screen
              </button>
            )}
            {isPlaying ? (
              <iframe
                src={`${activeVideo.embedUrl}?autoplay=1&rel=0&playsinline=1`}
                title={activeVideo.title}
                className="h-full min-h-0 w-full flex-1 border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <>
                <img
                  src={activeVideo.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover filter brightness-70 scale-105 transition-transform duration-700"
                />

                {/* Broadcast Overlay Badges */}
                <div className="absolute top-2 left-2 sm:top-6 sm:left-6 z-20 flex flex-wrap items-center gap-2">
                  <motion.span
                    animate={{ scale: isWatchingLive ? [1, 1.05, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow flex items-center gap-1.5 ${
                      isWatchingLive ? 'bg-red-600 animate-pulse' : 'bg-[#08281d] text-[#fae19c] border border-[#fae19c]/30'
                    }`}
                  >
                    {isWatchingLive && <Radio className="w-3.5 h-3.5" />}
                    <span>{isWatchingLive ? 'Live now' : 'Recording'}</span>
                  </motion.span>
                </div>

                {/* Center Play Button & Title */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center bg-gradient-to-t from-black/85 via-black/35 to-black/50">
                  <motion.button
                    onClick={() => play(activeVideo)}
                    aria-label="Play on this page"
                    whileHover={{ scale: 1.1, backgroundColor: '#ffffff' }}
                    whileTap={{ scale: 0.94 }}
                    className="mb-2 grid size-12 sm:mb-4 sm:size-20 place-items-center rounded-full bg-[#fae19c] text-[#08281d] shadow-2xl transition-colors cursor-pointer"
                  >
                    <Play className="size-6 sm:size-9 fill-current ml-1" />
                  </motion.button>
                  <h2 className="text-white text-lg sm:text-3xl md:text-4xl font-bold font-serif-heading max-w-2xl text-balance drop-shadow-lg">
                    {activeVideo.title}
                  </h2>
                  <p className="text-[#fae19c] text-xs sm:text-base font-semibold mt-2">
                    {activeVideo.preacher}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Interactive Player Control Bar */}
          <div className="p-4 sm:p-6 bg-stone-900 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-stone-300">
            <div className="flex flex-wrap items-center gap-3">
              {isPlaying ? (
                <button
                  onClick={() => setPlayingId(undefined)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
                  title="Reset to video cover"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#fae19c]" />
                  <span>Reset Player View</span>
                </button>
              ) : (
                <button
                  onClick={() => play(activeVideo)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fae19c] hover:bg-white text-[#08281d] text-xs font-bold transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Directly</span>
                </button>
              )}

              {isPlaying && (
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-700"
                >
                  <Maximize className="w-3.5 h-3.5 text-[#fae19c]" aria-hidden="true" />
                  <span>Full Screen</span>
                </button>
              )}
              {selectedService && broadcast && (
                <button type="button" className="font-semibold text-[#fae19c] hover:underline"
                  onClick={() => { setSelectedService(null); play(broadcast); }}>
                  {isLiveNow ? 'Watch live broadcast' : 'Watch featured broadcast'}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={activeVideo.watchUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-red-700 text-stone-200 hover:text-white text-xs font-semibold border border-stone-700 hover:border-red-600 transition-all"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Online Giving Action */}
              <motion.button
                onClick={() => onNavigate('/give')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c] font-semibold border border-[#fae19c]/30 transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Give Offering Online</span>
              </motion.button>
            </div>
          </div>
          {(live.scheduledTime || live.pinnedNotice) && (
            <div className="space-y-2 px-4 pb-4 text-sm text-stone-200 sm:px-6">
              {live.scheduledTime && <p>{live.scheduledTime}</p>}
              {live.pinnedNotice && <p>{live.pinnedNotice}</p>}
            </div>
          )}
        </SectionReveal>

        {/* Recent Sanctuary Broadcasts & Sermons Selector */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#b48227] uppercase tracking-wider">
                <Video className="w-4 h-4" />
                <span>Sanctuary Broadcast Library</span>
              </div>
              <h3 className="font-serif-heading font-bold text-stone-900 text-2xl mt-1">
                Recorded Services & Messages
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm">
                Choose a recording to play it above.
              </p>
            </div>
            <a
              href={CHURCH_INFO.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              <Youtube className="w-4 h-4" />
              <span>Visit Church YouTube Channel</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {RECORDINGS.map(service => {
              const isSelected = activeVideo.id === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedService(service);
                    playerContainerRef.current?.scrollIntoView({ block: 'center' });
                    play(service);
                  }}
                  className={`group text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#08281d] text-white border-[#fae19c]/40 ring-2 ring-[#fae19c]'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-900 border-stone-200'
                  }`}
                >
                  <div className="aspect-video w-full rounded-xl overflow-hidden relative mb-3 bg-stone-900">
                    <img
                      src={service.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <span className={`grid size-10 place-items-center rounded-full shadow-lg transition-transform group-hover:scale-110 ${
                        isSelected ? 'bg-[#fae19c] text-[#08281d]' : 'bg-white/90 text-[#08281d]'
                      }`}>
                        <Play className="size-5 fill-current ml-0.5" />
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                      isSelected ? 'text-[#fae19c]' : 'text-[#8a621c]'
                    }`}>
                      {service.date}
                    </span>
                    <h4 className="font-semibold text-sm line-clamp-2 leading-snug">
                      {service.title}
                    </h4>
                    <p className={`text-xs mt-1.5 ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                      {service.preacher}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Prayer Petition Box & Broadcast Schedule Grid */}
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
                Browse All Sermons →
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
