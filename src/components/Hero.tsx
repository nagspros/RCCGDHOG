import { ArrowRight, ChevronLeft, ChevronRight, CirclePlay, Pause, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { CHURCH_INFO } from '../data/churchData';
import type { HeroSlide } from '../data/heroSlides';
import { SectionLink } from './SectionLink';

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [activeId, setActiveId] = useState<string>();
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const index = Math.max(0, slides.findIndex(slide => slide.id === activeId));
  const slide = slides[index];
  const showText = slide.showText ?? Boolean(slide.videoSrc);
  const containArtwork = !showText && slide.imageFit !== 'cover';
  const nextId = slides[(index + 1) % slides.length].id;
  const rotating = !paused && !reducedMotion;

  useEffect(() => {
    if (!rotating || slides.length < 2) return;
    const timer = window.setTimeout(() => setActiveId(nextId), 8000);
    return () => window.clearTimeout(timer);
  }, [rotating, slide.id, nextId, slides.length]);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    if (rotating) void player.play().catch(() => {});
    else player.pause();
  }, [rotating, slide.id, slide.videoSrc]);

  function step(direction: number) {
    setPaused(true);
    setActiveId(slides[(index + direction + slides.length) % slides.length].id);
  }

  return (
    <section className={showText ? 'home-hero' : `home-hero home-hero--media-only${containArtwork ? ' home-hero--contain' : ''}`} aria-labelledby="home-title"
      aria-roledescription={slides.length > 1 ? 'carousel' : undefined}>
      <div className="home-hero-art">
        {containArtwork && <img className="home-hero-backdrop" src={slide.imageSrc} alt="" aria-hidden="true" />}
        <motion.img key={slide.imageSrc} src={slide.imageSrc} alt={showText ? '' : [slide.title, slide.subtitle].filter(Boolean).join('. ') || 'Church banner'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          initial={reducedMotion ? false : { scale: showText ? 1.06 : 1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }} />
        {slide.videoSrc && !reducedMotion && (
          <video key={slide.videoSrc} ref={video} src={slide.videoSrc} poster={slide.imageSrc}
            aria-hidden="true" muted loop playsInline preload={paused ? 'none' : 'metadata'} />
        )}
      </div>
      <div className="home-hero-inner">
        <div className="home-hero-copy">
          <div className="home-hero-content" aria-live={rotating ? 'off' : 'polite'} onFocus={() => setPaused(true)}>
            {showText ? (
              <div className="home-hero-caption">
                <p className="home-eyebrow">{CHURCH_INFO.denomination}</p>
                <h1 id="home-title" className="whitespace-pre-line">{slide.title}</h1>
                {slide.subtitle && <p className="home-tagline">{slide.subtitle}</p>}
              </div>
            ) : <h1 id="home-title" className="sr-only">{CHURCH_INFO.heroHeadingLine1} {CHURCH_INFO.heroHeadingLine2}</h1>}
            <div className="home-actions">
              {[slide.primaryButton, slide.secondaryButton].map(({ label, url }, position) => {
                const className = position ? 'home-button home-button-outline' : 'home-button';
                const icon = url === '/watch' ? <CirclePlay aria-hidden="true" /> : <ArrowRight aria-hidden="true" />;
                const content = <><span>{label}</span>{icon}</>;
                return url.startsWith('#') ? (
                  <SectionLink key={position} id={url.slice(1)} className={className}>{content}</SectionLink>
                ) : <a key={position} href={url} className={className}>{content}</a>;
              })}
            </div>
          </div>
          {(slides.length > 1 || (slide.videoSrc && !reducedMotion)) && (
            <div className="home-hero-controls" role="group" aria-label="Hero carousel controls">
              {slides.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label="Previous slide"><ChevronLeft aria-hidden="true" /></button>
                  <span className="home-hero-count" aria-label={`Slide ${index + 1} of ${slides.length}`}>{index + 1} / {slides.length}</span>
                  <button type="button" onClick={() => step(1)} aria-label="Next slide"><ChevronRight aria-hidden="true" /></button>
                </>
              )}
              {!reducedMotion && (
                <button type="button" onClick={() => setPaused(value => !value)}
                  aria-label={paused ? 'Play hero carousel' : 'Pause hero carousel'}>
                  {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <svg className="home-wave" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="home-wave-gold">
            <stop stopColor="#dfad57" />
            <stop offset=".47" stopColor="#ffebad" />
            <stop offset="1" stopColor="#dba448" />
          </linearGradient>
        </defs>
        <path d="M0 36C117 11 258 74 457 62C685 48 837 -12 1000 9V80H0Z" fill="url(#home-wave-gold)" />
        <path d="M0 50C126 27 260 78 457 66C685 56 837 2 1000 23V80H0Z" fill="#05291f" />
      </svg>
    </section>
  );
}
