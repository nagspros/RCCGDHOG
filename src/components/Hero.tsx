import { ArrowRight, ChevronLeft, ChevronRight, CirclePlay, Pause, Play, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { CHURCH_INFO } from '../data/churchData';
import type { HeroSlide, SiteLink } from '../data/heroSlides';
import { SectionLink } from './SectionLink';

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const publishedSlides = slides.filter(s => s.published !== false);
  const activeSlides = publishedSlides.length > 0 ? publishedSlides : slides;

  const [activeId, setActiveId] = useState<string>(activeSlides[0]?.id);
  const [playback, setPlayback] = useState<boolean>();
  const reducedMotion = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const index = Math.max(0, activeSlides.findIndex(slide => slide.id === activeId));
  const slide = activeSlides[index] || activeSlides[0];

  const showText = slide?.showText ?? Boolean(slide?.videoSrc);
  const isCover = slide?.imageFit !== 'contain';
  const hasMultipleSlides = activeSlides.length > 1;
  const hasControls = hasMultipleSlides || Boolean(slide?.videoSrc);
  const playing = playback ?? !reducedMotion;
  const rotating = playing && hasMultipleSlides;
  const nextSlideId = hasMultipleSlides ? activeSlides[(index + 1) % activeSlides.length].id : undefined;

  function step(direction: number) {
    if (!hasMultipleSlides) return;
    setPlayback(false);
    setActiveId(prevId => {
      const currentIndex = Math.max(0, activeSlides.findIndex(s => s.id === prevId));
      const nextIndex = (currentIndex + direction + activeSlides.length) % activeSlides.length;
      return activeSlides[nextIndex].id;
    });
  }

  // Auto-advance timer (7.5 seconds)
  useEffect(() => {
    if (!rotating || !nextSlideId) return;
    const timer = window.setTimeout(() => setActiveId(nextSlideId), 7500);
    return () => window.clearTimeout(timer);
  }, [rotating, slide?.id, nextSlideId]);

  const startVideo = useCallback((player: HTMLVideoElement) => {
    if (!player.paused) return;
    player.muted = true;
    void player.play().catch(error => {
      if (!hasMultipleSlides && video.current === player && error.name !== 'AbortError') setPlayback(false);
    });
  }, [hasMultipleSlides]);

  // Video playback sync
  useEffect(() => {
    const player = video.current;
    if (!player) return;
    if (playing) startVideo(player);
    else player.pause();
  }, [playing, slide?.id, slide?.videoSrc, startVideo]);

  function togglePlayback() {
    setPlayback(!playing);
    const player = video.current;
    if (!player) return;
    if (playing) player.pause();
    else startVideo(player);
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasMultipleSlides) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    }
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStart.current = null;
    if (!hasMultipleSlides || event.touches.length !== 1) return;
    if (event.target instanceof Element && event.target.closest('a, button')) return;
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || event.touches.length > 0) return;
    const touch = event.changedTouches[0];
    const distance = start.x - touch.clientX;
    if (Math.abs(distance) > Math.max(45, Math.abs(start.y - touch.clientY))) {
      step(distance > 0 ? 1 : -1);
    }
  };

  if (!slide) return null;
  const videoElement = slide.videoSrc && (
    <video ref={video} src={slide.videoSrc} poster={slide.imageSrc}
      className={showText ? undefined : 'home-hero-flyer-img'} aria-hidden="true"
      muted loop playsInline preload={playing ? 'metadata' : 'none'} />
  );

  return (
    <section
      className={hasControls ? 'home-hero home-hero--has-controls' : 'home-hero'}
      aria-labelledby="home-title"
      aria-roledescription={hasMultipleSlides ? 'carousel' : undefined}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { touchStart.current = null; }}
      tabIndex={0}
    >
      <motion.div
        key={slide.id}
        className="home-hero-slide"
        initial={reducedMotion ? false : { opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {showText ? (
          /* ============================================================ */
          /* MODE 1: WELCOME BANNER WITH TEXT OVERLAY                     */
          /* ============================================================ */
          <>
            {/* Background Media */}
            <div className="home-hero-art" aria-hidden="true">
              <img
                src={slide.imageSrc}
                alt=""
                fetchPriority={index === 0 ? 'high' : 'auto'}
                className="home-hero-bg-img"
              />
              {videoElement}
              {/* Gradient Scrim */}
              <div className="home-hero-scrim" />
            </div>

            {/* Foreground Content */}
            <div className="home-hero-inner">
              <div className="home-hero-copy">
                <div className="home-hero-content" aria-live={rotating ? 'off' : 'polite'}>
                  <div className="home-hero-caption">
                    <div className="home-eyebrow-wrapper">
                      <Sparkles size={14} className="text-[#e6ba6a] shrink-0" aria-hidden="true" />
                      <span className="home-eyebrow">{CHURCH_INFO.denomination}</span>
                    </div>
                    <h1 id="home-title" className="whitespace-pre-line">
                      {slide.title}
                    </h1>
                    {slide.subtitle && <p className="home-tagline">{slide.subtitle}</p>}
                  </div>

                  <HeroActions buttons={[slide.primaryButton, slide.secondaryButton]} />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ============================================================ */
          /* MODE 2: FULL IMAGE / FLYER BANNER (NO OVERLAY TEXT)          */
          /* ============================================================ */
          <>
            {/* Screen reader announcement */}
            <h1 id="home-title" className="sr-only">
              {slide.title || `${CHURCH_INFO.heroHeadingLine1} ${CHURCH_INFO.heroHeadingLine2}`}
              {slide.subtitle ? ` — ${slide.subtitle}` : ''}
            </h1>

            <div className={isCover ? 'home-hero-flyer-canvas home-hero-flyer-canvas--cover' : 'home-hero-flyer-canvas'}>
              <div className="home-hero-ambient" aria-hidden="true">
                <img src={slide.imageSrc} alt="" className="home-hero-ambient-img" />
                <div className="home-hero-ambient-scrim" />
              </div>
              <div className="home-hero-flyer-frame">
                <div className="home-hero-flyer-media">
                  {videoElement || <img
                    src={slide.imageSrc}
                    alt={slide.title || slide.subtitle || 'Church event banner'}
                    className="home-hero-flyer-img"
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                  />}
                </div>
                <HeroActions buttons={[slide.primaryButton, slide.secondaryButton]} imageOnly />
              </div>
            </div>
          </>
        )}
      </motion.div>

      {hasControls && (
        <div className="home-hero-navigation" role="group" aria-label="Hero carousel controls">
          {hasMultipleSlides && <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous slide"
            className="home-hero-arrow home-hero-arrow--prev"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>}
          <div className="home-hero-hub">
            {hasMultipleSlides && <div className="home-hero-pills" role="tablist" aria-label="Slide selector">
              {activeSlides.map((item, pos) => {
                const isActive = pos === index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Slide ${pos + 1}: ${item.title || 'Banner'}`}
                    className={`home-hero-pill ${isActive ? 'home-hero-pill--active' : ''}`}
                    onClick={() => {
                      setPlayback(false);
                      setActiveId(item.id);
                    }}
                  />
                );
              })}
            </div>}
            {hasMultipleSlides && (
              <span className="home-hero-counter" aria-live={rotating ? 'off' : 'polite'}>
                <span className="sr-only">Slide {index + 1} of {activeSlides.length}</span>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')} / {String(activeSlides.length).padStart(2, '0')}</span>
              </span>
            )}
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={`${playing ? 'Pause' : 'Play'} ${hasMultipleSlides ? 'slideshow' : 'video'}`}
              className="home-hero-play-btn"
            >
              {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>
          {hasMultipleSlides && <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next slide"
            className="home-hero-arrow home-hero-arrow--next"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>}
        </div>
      )}

      {/* Signature Double Golden Wave Graphic */}
      <svg className="home-wave" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="home-wave-gold" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#dfad57" />
            <stop offset=".47" stopColor="#ffebad" />
            <stop offset="1" stopColor="#dba448" />
          </linearGradient>
        </defs>
        <path d="M0 36C117 11 258 74 457 62C685 48 837 -12 1000 9V80H0Z" fill="url(#home-wave-gold)" />
        <path d="M0 50C126 27 260 78 457 66C685 56 837 2 1000 23V80H0Z" fill="#05271f" />
      </svg>
    </section>
  );
}

function HeroActions({ buttons, imageOnly = false }: { buttons: SiteLink[]; imageOnly?: boolean }) {
  const links = buttons.filter(button => button?.label?.trim());
  if (!links.length) return null;

  return (
    <div className={imageOnly ? 'home-hero-flyer-actions' : 'home-actions'}>
      {links.map(({ label, url }, position) => {
        const className = position ? 'home-button home-button-outline' : 'home-button';
        const Icon = url === '/watch' ? CirclePlay : ArrowRight;
        const content = <><span>{label}</span><Icon aria-hidden="true" /></>;
        return url.startsWith('#') ? (
          <SectionLink key={position} id={url.slice(1)} className={className}>{content}</SectionLink>
        ) : (
          <a key={position} href={url} className={className}>{content}</a>
        );
      })}
    </div>
  );
}
