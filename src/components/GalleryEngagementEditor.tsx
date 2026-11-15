import { galleryFieldTypes, type GalleryEngagement, type GalleryField, type GalleryForm } from '../data/galleryEngagement';

const input = 'block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal';
const button = 'rounded-lg border border-stone-300 bg-white px-3 py-2 font-semibold';
const remove = 'rounded-lg px-2 py-2 font-semibold text-red-800 hover:bg-red-50';

function newField(): GalleryField {
  return { id: crypto.randomUUID(), label: '', kind: 'text', required: false, options: [] };
}

export function GalleryEngagementEditor({ value, onChange }: { value: GalleryEngagement; onChange: (value: GalleryEngagement) => void }) {
  const { form, links } = value;

  function updateForm(changes: Partial<GalleryForm>) {
    if (form) onChange({ ...value, form: { ...form, ...changes } });
  }

  function updateField(id: string, changes: Partial<GalleryField>) {
    if (form) updateForm({ fields: form.fields.map(field => field.id === id ? { ...field, ...changes } : field) });
  }

  return (
    <fieldset className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
      <legend className="px-1 text-sm font-bold text-[#08281d]">Gallery detail page</legend>
      <label className="flex items-center gap-2 font-semibold">
        <input type="checkbox" checked={value.published} onChange={event => onChange({ ...value, published: event.target.checked })} />
        Publish the form and links on this page
      </label>
      <p className="text-stone-600">Form responses appear in the staff inbox. You can add links, a form, or both.</p>
      {links.map((link, index) => (
        <fieldset key={index} className="grid gap-2 rounded-lg border border-stone-200 p-3">
          <legend className="px-1 font-semibold">Link {index + 1}</legend>
          <label className="space-y-1">Link text
            <input className={input} maxLength={50} required value={link.label} onChange={event => {
              onChange({ ...value, links: links.map((item, i) => i === index ? { ...item, label: event.target.value } : item) });
            }} />
          </label>
          <label className="space-y-1">Link URL
            <input className={input} maxLength={2048} placeholder="https://…" required value={link.url} onChange={event => {
              onChange({ ...value, links: links.map((item, i) => i === index ? { ...item, url: event.target.value } : item) });
            }} />
          </label>
          <button className={remove + ' justify-self-start'} type="button" onClick={() => onChange({
            ...value, links: links.filter((_, i) => i !== index),
          })}>Remove link</button>
        </fieldset>
      ))}
      <div className="flex flex-wrap gap-2">
        {links.length < 8 && <button type="button" className={button}
          onClick={() => onChange({ ...value, links: [...links, { label: '', url: '' }] })}>Add link</button>}
        {!form && <button type="button" className={button} onClick={() => onChange({
          ...value, form: { title: 'Sign up', description: '', submitLabel: 'Submit', fields: [newField()] },
        })}>Add form</button>}
      </div>
      {form && (
        <fieldset className="space-y-3 rounded-lg border border-stone-200 p-3">
          <legend className="px-1 font-semibold">Form</legend>
          <label className="block space-y-1">Form title
            <input className={input} required maxLength={150} value={form.title} onChange={event => updateForm({ title: event.target.value })} />
          </label>
          <label className="block space-y-1">Instructions
            <textarea className={input} rows={2} maxLength={1000} value={form.description} onChange={event => updateForm({ description: event.target.value })} />
          </label>
          <label className="block space-y-1">Submit button text
            <input className={input} required maxLength={50} value={form.submitLabel} onChange={event => updateForm({ submitLabel: event.target.value })} />
          </label>
          {form.fields.map((field, index) => (
            <fieldset key={field.id} className="space-y-2 rounded-lg border border-stone-200 p-3">
              <legend className="px-1 font-semibold">Field {index + 1}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="space-y-1">Field label
                  <input className={input} required maxLength={150} value={field.label} onChange={event => updateField(field.id, { label: event.target.value })} />
                </label>
                <label className="space-y-1">Field type
                  <select className={input} value={field.kind} onChange={event => updateField(field.id, {
                    kind: event.target.value as GalleryField['kind'], options: [],
                  })}>
                    {Object.entries(galleryFieldTypes).map(([kind, label]) => <option value={kind} key={kind}>{label}</option>)}
                  </select>
                </label>
              </div>
              {['select', 'radio'].includes(field.kind) && (
                <label className="block space-y-1">Options, one per line
                  <textarea className={input} rows={3} required maxLength={4530} value={field.options.join('\n')}
                    onChange={event => updateField(field.id, { options: event.target.value.split('\n') })} />
                </label>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={field.required} onChange={event => updateField(field.id, { required: event.target.checked })} /> Required
                </label>
                {form.fields.length > 1 && <button className={remove} type="button"
                  onClick={() => updateForm({ fields: form.fields.filter(item => item.id !== field.id) })}>Remove field</button>}
              </div>
            </fieldset>
          ))}
          <div className="flex flex-wrap gap-2">
            {form.fields.length < 30 && <button className={button} type="button"
              onClick={() => updateForm({ fields: [...form.fields, newField()] })}>Add field</button>}
            <button className={remove} type="button" onClick={() => onChange({ ...value, form: null })}>Remove form</button>
          </div>
        </fieldset>
      )}
    </fieldset>
  );
}
