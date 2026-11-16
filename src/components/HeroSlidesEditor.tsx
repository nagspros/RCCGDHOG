import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, Eye, FileImage, Image as ImageIcon, Layout, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { HeroSlide, SiteLink } from '../data/heroSlides';
import { ABOUT_CHURCH_IMAGE, LIFE_SECTION_ID } from '../data/heroSlides';

const input = 'block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-normal text-stone-900 focus:border-[#b48227] focus:ring-1 focus:ring-[#b48227] focus:outline-none transition-colors';
const button = 'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-40 cursor-pointer transition-colors';

const PRESET_FLYERS = [
  { label: 'Night of Glory Flyer', path: '/assets/site/NIGHT-OF-GLORY-FLYER.jpg' },
  { label: 'Sunday Welcome Poster', path: '/assets/site/RCCG-DHOG-WELCOME-TO-CHURCH.jpg' },
  { label: 'Bible Study Flyer', path: '/assets/site/Bible-study-edited.jpg' },
  { label: 'Church Sanctuary', path: ABOUT_CHURCH_IMAGE },
  { label: 'Worship Atmosphere', path: '/assets/extracted/hero_worship.jpg' },
];

export function HeroSlidesEditor({ slides, saving, onSave }: {
  slides: HeroSlide[];
  saving: boolean;
  onSave: (slides: HeroSlide[]) => void;
}) {
  const [draft, setDraft] = useState(slides);
  const [selected, setSelected] = useState(slides[0]?.id);
  const index = Math.max(0, draft.findIndex(slide => slide.id === selected));
  const slide = draft[index] || draft[0];
  const showText = slide?.showText ?? Boolean(slide?.videoSrc);
  const imageFit = slide?.imageFit ?? 'cover';

  function update(changes: Partial<HeroSlide>) {
    setDraft(items => items.map(item => item.id === selected ? { ...item, ...changes } : item));
  }

  function move(direction: number) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= draft.length) return;
    const ordered = [...draft];
    [ordered[index], ordered[targetIdx]] = [ordered[targetIdx], ordered[index]];
    setDraft(ordered);
  }

  function addSlide() {
    const added: HeroSlide = {
      id: crypto.randomUUID(),
      title: 'Night of Glory',
      subtitle: 'Monthly power and miracle service',
      showText: false,
      imageFit: 'cover',
      imageSrc: '/assets/site/NIGHT-OF-GLORY-FLYER.jpg',
      videoSrc: '',
      published: true,
      primaryButton: { label: 'Plan a Visit', url: '/visit' },
      secondaryButton: { label: 'Watch Online', url: '/watch' },
    };
    setDraft(items => [...items, added]);
    setSelected(added.id);
  }

  return (
    <section className="space-y-6 rounded-3xl border border-stone-200 bg-white p-5 sm:p-8 text-sm shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[#05291f] text-[#fae19c]">
              <Layout size={18} />
            </span>
            <h2 className="font-serif-heading text-2xl font-bold text-[#08281d]">Home hero carousel</h2>
          </div>
          <p className="mt-1.5 text-stone-600 max-w-2xl leading-relaxed">
            Manage the banners that rotate on your church homepage. Choose whether each slide is a <strong>Full Flyer / Event Poster</strong> (no text overlay) or a <strong>Headline Banner</strong> (with church text). Every banner fits consistently without jumping sizes.
          </p>
        </div>
        <button type="button" onClick={addSlide} className={`${button} bg-[#05291f] text-white hover:bg-[#144837] border-transparent`}>
          <Plus size={16} aria-hidden="true" /> Add new slide
        </button>
      </div>

      <form className="space-y-6" onSubmit={event => {
        event.preventDefault();
        onSave(draft);
      }}>
        {slide && (
          <div className="space-y-6">
            {/* Slide Selector & Ordering Toolbar */}
            <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-stone-50 p-3.5 border border-stone-200/80">
              <label className="min-w-64 flex-1 space-y-1.5 font-semibold text-stone-800">
                Active slide
                <select className={input} value={selected} onChange={event => setSelected(event.target.value)}>
                  {draft.map((item, position) => {
                    const isFlyer = !(item.showText ?? Boolean(item.videoSrc));
                    const badge = isFlyer ? '[Flyer]' : '[Text Banner]';
                    return (
                      <option key={item.id} value={item.id}>
                        {position + 1}. {badge} {item.title?.replaceAll('\n', ' ') || 'Untitled banner'}
                        {item.published ? '' : ' (Draft)'}
                      </option>
                    );
                  })}
                </select>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={button}
                  disabled={index === 0}
                  onClick={() => move(-1)}
                  title="Move slide earlier"
                  aria-label="Move slide earlier"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  className={button}
                  disabled={index === draft.length - 1}
                  onClick={() => move(1)}
                  title="Move slide later"
                  aria-label="Move slide later"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  className={`${button} text-red-600 hover:bg-red-50 hover:border-red-200`}
                  disabled={draft.length <= 1}
                  onClick={() => {
                    if (draft.length <= 1) return;
                    const remaining = draft.filter(item => item.id !== selected);
                    setDraft(remaining);
                    setSelected(remaining[Math.min(index, remaining.length - 1)]?.id);
                  }}
                  title="Remove this slide"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>

            {/* Banner Type Segmented Cards (Crucial User Requirement!) */}
            <div className="space-y-2">
              <label className="block font-bold text-stone-900">
                Banner presentation style
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Option 1: Full Flyer / Poster */}
                <button
                  type="button"
                  onClick={() => update({ showText: false, imageFit: 'cover' })}
                  className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    !showText
                      ? 'border-[#b48227] bg-[#fbf8f0] shadow-sm ring-1 ring-[#b48227]'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2 font-bold text-[#05291f]">
                      <FileImage size={18} className="text-[#b48227]" />
                      Full Flyer / Poster (No text overlay)
                    </span>
                    {!showText && (
                      <span className="grid size-5 place-items-center rounded-full bg-[#b48227] text-white">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    <strong>Best for flyers & graphic posters</strong> that already contain their own text, dates, and artwork. Displays the entire flyer uncropped inside a fitted frame with ambient backdrop.
                  </p>
                </button>

                {/* Option 2: Headline Banner */}
                <button
                  type="button"
                  onClick={() => update({ showText: true, imageFit: 'cover' })}
                  className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    showText
                      ? 'border-[#b48227] bg-[#fbf8f0] shadow-sm ring-1 ring-[#b48227]'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2 font-bold text-[#05291f]">
                      <Sparkles size={18} className="text-[#b48227]" />
                      Headline Banner (With text overlay)
                    </span>
                    {showText && (
                      <span className="grid size-5 place-items-center rounded-full bg-[#b48227] text-white">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    Overlays the church denomination, large serif heading, tagline, and call-to-action buttons on top of a photo or background video.
                  </p>
                </button>
              </div>
            </div>

            {/* Live Visual Preview of Active Slide */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye size={14} /> Live banner preview ({showText ? 'Text Overlay' : 'Full Flyer'})
                </span>
                <span className="text-xs text-stone-500 font-medium">Uniform frame fit</span>
              </div>
              <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl bg-[#05291f] text-[#fff2d4] shadow-md border border-stone-800">
                {showText ? (
                  <>
                    <img src={slide.imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#05271ff5] via-[#05271fe0] to-transparent" />
                    <div className="relative z-10 flex h-full flex-col justify-center p-5 sm:p-8 max-w-md">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#fae19c]">
                        The Redeemed Christian Church of God
                      </span>
                      <p className="font-serif-heading text-lg sm:text-2xl font-bold text-white mt-1 leading-tight line-clamp-2">
                        {slide.title || 'Church Heading Line'}
                      </p>
                      {slide.subtitle && (
                        <p className="text-xs text-[#f6ebd5] mt-1.5 line-clamp-2">{slide.subtitle}</p>
                      )}
                      <div className="mt-3 flex gap-2">
                        {slide.primaryButton?.label && (
                          <span className="rounded-lg bg-[#fae19c] px-2.5 py-1 text-[11px] font-bold text-[#05291f]">
                            {slide.primaryButton.label}
                          </span>
                        )}
                        {slide.secondaryButton?.label && (
                          <span className="rounded-lg border border-[#fae19c] px-2.5 py-1 text-[11px] font-semibold text-[#fae19c]">
                            {slide.secondaryButton.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="relative h-full w-full overflow-hidden flex items-center justify-center p-3">
                    {/* Ambient backdrop */}
                    <img src={slide.imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover filter blur-xl brightness-50 scale-110" />
                    <div className="absolute inset-0 bg-radial from-[#05291f]/40 to-[#05291f]/90" />
                    {/* Centered flyer */}
                    <img
                      src={slide.imageSrc}
                      alt={slide.title || 'Flyer'}
                      className={`relative z-10 max-h-full max-w-full rounded-lg shadow-xl ${
                        imageFit === 'cover' ? 'h-full w-full object-cover' : 'object-contain'
                      }`}
                    />
                    <div className="absolute top-2 left-2 z-20 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-[#fae19c]">
                      {imageFit === 'cover' ? 'FULL BLEED COVER' : 'FULL FLYER FIT (CONTAIN)'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Media Source & Flyer Presets */}
            <div className="space-y-3 rounded-2xl bg-stone-50/70 p-4 border border-stone-200/80">
              <label className="block space-y-1.5 font-semibold text-stone-900">
                Image URL or file path
                <input
                  className={input}
                  value={slide.imageSrc}
                  maxLength={2048}
                  required
                  placeholder="/assets/site/NIGHT-OF-GLORY-FLYER.jpg"
                  onChange={event => update({ imageSrc: event.target.value })}
                />
              </label>

              {/* Quick Select Buttons for Church Assets */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone-600">Quick select church graphics:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_FLYERS.map(preset => (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() => update({
                        imageSrc: preset.path,
                        title: slide.title || preset.label,
                      })}
                      className={`inline-flex items-center gap-1 text-xs rounded-lg px-2.5 py-1.5 border transition-colors ${
                        slide.imageSrc === preset.path
                          ? 'border-[#b48227] bg-[#b48227] text-white font-semibold'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <ImageIcon size={12} /> {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flyer Fit selector (when showText is false) */}
              {!showText && (
                <div className="pt-2 border-t border-stone-200">
                  <label className="block space-y-1.5 font-semibold text-stone-900">
                    Flyer framing fit
                    <select
                      className={input}
                      value={imageFit}
                      onChange={event => update({ imageFit: event.target.value === 'cover' ? 'cover' : 'contain' })}
                    >
                      <option value="cover">Full image (Recommended — fills the entire banner edge-to-edge)</option>
                      <option value="contain">Framed fit (shows full flyer uncropped with ambient backdrop)</option>
                    </select>
                  </label>
                  <p className="mt-1 text-xs text-stone-500">
                    With "Show full flyer", the whole flyer artwork stays 100% visible with an ambient blurred glow in the background.
                  </p>
                </div>
              )}

              {/* Video URL (optional, mainly for text banners) */}
              {showText && (
                <div className="pt-2 border-t border-stone-200">
                  <label className="block space-y-1.5 font-semibold text-stone-900">
                    Background video URL (optional MP4 or WebM)
                    <input
                      className={input}
                      value={slide.videoSrc}
                      maxLength={2048}
                      placeholder="/assets/hero/worship.mp4"
                      onChange={event => update({ videoSrc: event.target.value })}
                    />
                  </label>
                  <p className="mt-1 text-xs text-stone-500">
                    When provided, the video plays smoothly on loop behind the text overlay. The image acts as its poster.
                  </p>
                </div>
              )}
            </div>

            {/* Text Fields (Conditional based on showText) */}
            <div className="space-y-4">
              <label className="block space-y-1.5 font-semibold text-stone-900">
                {showText ? 'Slide heading title *' : 'Flyer title / Alt text (for screen readers)'}
                <textarea
                  className={input}
                  rows={2}
                  value={slide.title}
                  maxLength={100}
                  required={showText}
                  placeholder={showText ? 'Experience God\'s Dominion, Hope & Glory' : 'Night of Glory Service Flyer'}
                  onChange={event => update({ title: event.target.value })}
                />
              </label>

              <label className="block space-y-1.5 font-semibold text-stone-900">
                {showText ? 'Tagline / Subtitle' : 'Flyer description / Summary'}
                <textarea
                  className={input}
                  rows={2}
                  value={slide.subtitle}
                  maxLength={250}
                  placeholder={showText ? 'A vibrant multicultural family of faith in Newark, New Jersey.' : 'Monthly power and miracle service at RCCG DHOG.'}
                  onChange={event => update({ subtitle: event.target.value })}
                />
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-stone-900">Call-to-action buttons</h3>
                <p className="text-xs text-stone-500">
                  {showText
                    ? 'Buttons appear prominently below the heading.'
                    : 'Optional: buttons can appear below or near the flyer. Leave button text blank to display only the flyer without buttons.'}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <SlideButton
                  title="Primary button"
                  link={slide.primaryButton}
                  onChange={primaryButton => update({ primaryButton })}
                />
                <SlideButton
                  title="Secondary button"
                  link={slide.secondaryButton}
                  onChange={secondaryButton => update({ secondaryButton })}
                />
              </div>
            </div>

            {/* Published Switch */}
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2.5 font-semibold text-stone-900 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded text-[#b48227] focus:ring-[#b48227]"
                  checked={slide.published}
                  onChange={event => update({ published: event.target.checked })}
                />
                Publish this slide on homepage
              </label>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            Changes take effect immediately upon saving.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#08281d] px-6 py-2.5 font-semibold text-[#fae19c] hover:bg-[#144837] disabled:opacity-50 cursor-pointer shadow-md transition-colors"
          >
            {saving ? 'Saving slides…' : 'Save all slides'}
          </button>
        </div>
      </form>
    </section>
  );
}

function SlideButton({ title, link, onChange }: { title: string; link: SiteLink; onChange: (link: SiteLink) => void }) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-stone-200/90 bg-stone-50/50 p-4">
      <legend className="px-1 text-xs font-bold uppercase tracking-wider text-stone-700">{title}</legend>
      <label className="block space-y-1 text-xs font-semibold text-stone-700">
        Button label (leave blank to hide)
        <input
          className={input}
          maxLength={50}
          value={link?.label || ''}
          placeholder="e.g. Plan a Visit"
          onChange={event => onChange({ ...link, label: event.target.value })}
        />
      </label>
      <label className="block space-y-1 text-xs font-semibold text-stone-700">
        Button URL or path
        <input
          className={input}
          maxLength={2048}
          value={link?.url || ''}
          placeholder="/visit or https://..."
          onChange={event => onChange({ ...link, url: event.target.value })}
        />
      </label>
    </fieldset>
  );
}
