import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import type { HeroSlide, SiteLink } from '../data/heroSlides';
import { ABOUT_CHURCH_IMAGE, LIFE_SECTION_ID } from '../data/heroSlides';

const input = 'block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal';
const button = 'inline-flex min-h-10 items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 font-semibold disabled:opacity-40';

export function HeroSlidesEditor({ slides, saving, onSave }: {
  slides: HeroSlide[];
  saving: boolean;
  onSave: (slides: HeroSlide[]) => void;
}) {
  const [draft, setDraft] = useState(slides);
  const [selected, setSelected] = useState(slides[0]?.id);
  const index = draft.findIndex(slide => slide.id === selected);
  const slide = draft[index];
  const showText = slide?.showText ?? Boolean(slide?.videoSrc);

  function update(changes: Partial<HeroSlide>) {
    setDraft(items => items.map(item => item.id === selected ? { ...item, ...changes } : item));
  }

  function move(direction: number) {
    const ordered = [...draft];
    [ordered[index], ordered[index + direction]] = [ordered[index + direction], ordered[index]];
    setDraft(ordered);
  }

  function addSlide() {
    const added: HeroSlide = {
      id: crypto.randomUUID(), title: 'New slide', subtitle: '', imageSrc: ABOUT_CHURCH_IMAGE,
      videoSrc: '', published: false,
      primaryButton: { label: 'Plan a Visit', url: '/visit' },
      secondaryButton: { label: 'Life at DHOG', url: `#${LIFE_SECTION_ID}` },
    };
    setDraft(items => [...items, added]);
    setSelected(added.id);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 text-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif-heading text-2xl text-[#08281d]">Home hero slides</h2>
          <p className="mt-1 text-stone-600">Published slides appear in this order. If none are published, the homepage uses its default slides.</p>
        </div>
        <button type="button" onClick={addSlide} className={button}><Plus size={16} aria-hidden="true" /> Add slide</button>
      </div>
      <form className="space-y-4" onSubmit={event => {
        event.preventDefault();
        onSave(draft);
      }}>
        {slide && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-2">
              <label className="min-w-40 flex-1 space-y-1 font-semibold">Slide
                <select className={input} value={selected} onChange={event => setSelected(event.target.value)}>
                  {draft.map((item, position) => (
                    <option key={item.id} value={item.id}>{position + 1}. {item.title.replaceAll('\n', ' ') || 'Image slide'}{item.published ? '' : ' (Draft)'}</option>
                  ))}
                </select>
              </label>
              <button type="button" className={button} disabled={index === 0} onClick={() => move(-1)} aria-label="Move slide earlier"><ArrowUp size={16} /></button>
              <button type="button" className={button} disabled={index === draft.length - 1} onClick={() => move(1)} aria-label="Move slide later"><ArrowDown size={16} /></button>
              <button type="button" className={button} onClick={() => {
                const remaining = draft.filter(item => item.id !== selected);
                setDraft(remaining);
                setSelected(remaining[Math.min(index, remaining.length - 1)]?.id);
              }}>Remove slide</button>
            </div>
            <label className="flex items-center gap-2 font-semibold">
              <input type="checkbox" checked={showText} onChange={event => update({ showText: event.target.checked })} />
              Show overlay text
            </label>
            <label className="block space-y-1 font-semibold">Slide title
              <textarea className={input} rows={2} value={slide.title} maxLength={100} required={showText} onChange={event => update({ title: event.target.value })} />
            </label>
            {!showText && <p className="text-stone-600">Use the optional title and subtitle to describe the image for screen readers.</p>}
            <label className="block space-y-1 font-semibold">Subtitle
              <textarea className={input} rows={2} value={slide.subtitle} maxLength={250} onChange={event => update({ subtitle: event.target.value })} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 font-semibold">Image URL or site path
                <input className={input} value={slide.imageSrc} maxLength={2048} required onChange={event => update({ imageSrc: event.target.value })} />
              </label>
              <label className="space-y-1 font-semibold">Video URL or site path
                <input className={input} value={slide.videoSrc} maxLength={2048} onChange={event => update({ videoSrc: event.target.value })} />
              </label>
            </div>
            {!showText && (
              <label className="block space-y-1 font-semibold">Banner fit
                <select className={input} value={slide.imageFit ?? 'contain'} onChange={event => update({ imageFit: event.target.value === 'cover' ? 'cover' : 'contain' })}>
                  <option value="contain">Show the whole image (best for flyers)</option>
                  <option value="cover">Fill the banner (may crop the edges)</option>
                </select>
              </label>
            )}
            <p className="text-stone-600">For video, use a direct MP4 or WebM address. The image acts as its cover.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <SlideButton title="Primary button" link={slide.primaryButton} onChange={primaryButton => update({ primaryButton })} />
              <SlideButton title="Secondary button" link={slide.secondaryButton} onChange={secondaryButton => update({ secondaryButton })} />
            </div>
            <label className="flex items-center gap-2 font-semibold">
              <input type="checkbox" checked={slide.published} onChange={event => update({ published: event.target.checked })} />
              Publish this slide
            </label>
          </div>
        )}
        <button type="submit" disabled={saving} className="rounded-lg bg-[#08281d] px-4 py-2 font-semibold text-[#fae19c] disabled:opacity-50">
          {saving ? 'Saving…' : 'Save slides'}
        </button>
      </form>
    </section>
  );
}

function SlideButton({ title, link, onChange }: { title: string; link: SiteLink; onChange: (link: SiteLink) => void }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-stone-200 p-3">
      <legend className="px-1 font-semibold">{title}</legend>
      <label className="block space-y-1">Button text<input className={input} required maxLength={50} value={link.label} onChange={event => onChange({ ...link, label: event.target.value })} /></label>
      <label className="block space-y-1">Button link<input className={input} required maxLength={2048} value={link.url} onChange={event => onChange({ ...link, url: event.target.value })} /></label>
    </fieldset>
  );
}
