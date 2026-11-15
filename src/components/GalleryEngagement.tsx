import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { usePublicData } from '../data/api';
import type { GalleryEngagement as Engagement, GalleryField as Field, GalleryForm } from '../data/galleryEngagement';
import { FormError, useServerForm } from './ServerForm';

const input = 'block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal';

export function GalleryEngagement({ photoId }: { photoId: string }) {
  const entryPath = encodeURIComponent(photoId);
  const { form, links } = usePublicData<Partial<Engagement>>(`/public/gallery/${entryPath}/engagement`, {});
  return (
    <>
      {links && links.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {links.map(({ label, url }, index) => (
            <a className="home-button" href={url} key={index}>{label} <ArrowRight aria-hidden="true" /></a>
          ))}
        </div>
      )}
      {form?.revision && <EntryForm key={form.revision} form={form} path={`/forms/gallery/${entryPath}`} />}
    </>
  );
}

function EntryForm({ form, path }: { form: GalleryForm; path: string }) {
  const submission = useServerForm();
  const [sent, setSent] = useState(false);
  return (
    <section id="gallery-form" aria-labelledby="gallery-form-title" className="scroll-mt-24 space-y-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
      <h2 id="gallery-form-title" className="font-serif-heading text-2xl text-[#08281d]">{form.title}</h2>
      {sent ? <p role="status" className="rounded-lg bg-green-50 p-3 text-[#174b35]">Thank you. Your response was submitted.</p> : (
        <form className="space-y-4" onSubmit={async event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const answers = Object.fromEntries(form.fields.map(field => [
            field.id, field.kind === 'checkbox' ? data.has(field.id) : String(data.get(field.id) ?? ''),
          ]));
          if (await submission.submit(path, { revision: form.revision, answers })) setSent(true);
        }}>
          {form.description && <p className="whitespace-pre-line text-stone-700">{form.description}</p>}
          <FormError error={submission.error} />
          {form.fields.map(field => <FormField key={field.id} field={field} />)}
          <button type="submit" className="home-button disabled:opacity-50" disabled={submission.busy}>
            {submission.busy ? 'Sending…' : form.submitLabel}
          </button>
        </form>
      )}
    </section>
  );
}

function FormField({ field }: { field: Field }) {
  const { kind, id, required, options } = field;
  const label = <>{field.label}{required && <span aria-hidden="true"> *</span>}</>;
  if (kind === 'checkbox') {
    return <label className="flex items-center gap-2 font-semibold"><input type="checkbox" name={id} required={required} />{label}</label>;
  }
  if (kind === 'radio') {
    return (
      <fieldset className="space-y-2">
        <legend className="font-semibold">{label}</legend>
        {options.map(option => (
          <label key={option} className="flex items-center gap-2"><input type="radio" name={id} value={option} required={required} />{option}</label>
        ))}
      </fieldset>
    );
  }
  return (
    <label className="block space-y-1 font-semibold">
      {label}
      {kind === 'textarea' ? <textarea name={id} className={input} rows={4} maxLength={4000} required={required} /> :
        kind === 'select' ? <select name={id} className={input} defaultValue="" required={required}>
          <option value="">Choose an option</option>
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select> :
        <input type={kind} name={id} className={input} maxLength={4000} step={kind === 'number' ? 'any' : undefined}
          autoComplete={kind === 'email' || kind === 'tel' ? kind : undefined} required={required} />}
    </label>
  );
}
