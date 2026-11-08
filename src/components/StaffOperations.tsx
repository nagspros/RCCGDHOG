import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { ChurchService, GivingRecord, ParishAnnouncement } from '../data/adminStore';
import { api, errorMessage } from '../data/api';
import { FormError } from './ServerForm';

const input = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2';
const action = 'rounded-lg bg-[#08281d] px-4 py-2 font-semibold text-[#fae19c] disabled:opacity-50';
const secondary = 'rounded-lg border border-stone-300 px-3 py-2 font-semibold disabled:opacity-50';
const panel = 'space-y-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6';

type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive';
  subscribed: number;
  opted_out: number;
};
type Campaign = {
  id: string;
  subject: string;
  due: number;
  audience: 'all' | 'member';
  counts: Record<string, number>;
};
type Notification = { id: string; created: string; subject: string; state: string; error?: string };
type History = { configured: boolean; campaigns: Campaign[]; notifications: Notification[] };
type Delivery = { recipient: string; state: string; provider_id?: string; error?: string };
type SubmissionStatus = 'New' | 'In progress' | 'Closed';
type Submission = { id: string; kind: string; status: SubmissionStatus; data: Record<string, string> };

const emptyMember = { name: '', email: '', phone: '', status: 'active' as Member['status'], subscribed: false };
const emptyMail = { audience: 'member' as Campaign['audience'], memberId: '', subject: '', body: '', eventId: '', sendAt: '' };

const mailTemplates = [
  {
    label: 'Contact Us reply',
    subject: 'Following up on your message to RCCG DHOG',
    body: 'Hello,\n\nThank you for reaching out to our church office.\n\n[Write your reply]\n\nBlessings,\nRCCG DHOG Church Office',
  },
  {
    label: 'Prayer request follow-up',
    subject: 'A note from your RCCG DHOG prayer team',
    body: 'Hello,\n\nThank you for trusting us to pray with you. Our prayer team is thinking of you. If you would like us to follow up, please reply to this message.\n\nWith care,\nRCCG DHOG Prayer Team',
  },
  {
    label: 'Sermon broadcast',
    subject: 'Watch our next sermon broadcast',
    body: 'Hello church family,\n\nJoin us online for [Sermon title] on [Broadcast date and time].\n\nWatch here\n[YouTube or Watch page link]\n\nBlessings,\nRCCG DHOG',
  },
  {
    label: 'Event invitation',
    subject: 'You’re invited to a church event',
    body: 'Hello church family,\n\nWe’d love to see you at our upcoming event.\n\n[Add a short invitation and any RSVP instructions]\n\nBlessings,\nRCCG DHOG',
  },
  {
    label: 'Service reminder',
    subject: 'A reminder about our upcoming church service',
    body: 'Hello church family,\n\nWe look forward to worshipping with you.\n\n[Add any service updates or arrival instructions]\n\nBlessings,\nRCCG DHOG',
  },
];

export function MembersMail({ services }: { services: ChurchService[] }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [history, setHistory] = useState<History | null>(null);
  const [details, setDetails] = useState<{ id: string; deliveries: Delivery[] }>();
  const [member, setMember] = useState(emptyMember);
  const [editingId, setEditingId] = useState<string>();
  const [query, setQuery] = useState('');
  const [csv, setCsv] = useState('');
  const [mail, setMail] = useState(emptyMail);
  const [review, setReview] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const mailId = useRef<string | undefined>(undefined);

  async function refresh() {
    const [directory, campaigns] = await Promise.all([
      api<Member[]>('/admin/members'),
      api<History>('/admin/mail'),
    ]);
    setMembers(directory);
    setHistory(campaigns);
  }

  useEffect(() => {
    void refresh().catch(cause => setError(errorMessage(cause)));
  }, []);

  async function run(work: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function saveMember(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      const { email, ...changes } = member;
      if (editingId) {
        await api(`/admin/members/${editingId}`, 'PATCH', changes);
      } else {
        await api('/admin/members', 'POST', { ...changes, email });
      }
      setMember(emptyMember);
      setEditingId(undefined);
      setNotice(editingId ? 'Member updated.' : 'Member registered.');
      await refresh();
    });
  }

  function importCsv(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      const result = await api<{ added: number; duplicates: number }>('/admin/members/import', 'POST', { csv });
      setCsv('');
      setNotice(`Imported ${result.added} members. Skipped ${result.duplicates} duplicate emails.`);
      await refresh();
    });
  }

  function updateMail(patch: Partial<typeof emptyMail>) {
    setMail(previous => ({ ...previous, ...patch }));
    mailId.current = undefined;
    setReview(false);
  }

  function queueMail(event: FormEvent) {
    event.preventDefault();
    if (/\[[^\[\]\n]+\]/.test(mail.body)) {
      setError('Replace the bracketed template prompts before reviewing your email.');
      return;
    }
    if (!review) {
      setReview(true);
      return;
    }
    void run(async () => {
      mailId.current ??= crypto.randomUUID();
      const queued = await api<Campaign>('/admin/mail', 'POST', {
        ...mail,
        id: mailId.current,
        memberId: mail.audience === 'member' ? mail.memberId : null,
        eventId: mail.eventId || null,
        sendAt: mail.sendAt ? new Date(mail.sendAt).toISOString() : null,
      });
      setNotice(`Mailing queued for ${Object.values(queued.counts).reduce((sum, count) => sum + count, 0)} recipients.`);
      setMail(emptyMail);
      setReview(false);
      mailId.current = undefined;
      await refresh();
    });
  }

  const active = members.filter(item => item.status === 'active');
  const recipient = active.find(item => item.id === mail.memberId);
  const eligible = mail.audience === 'all' ? active.filter(item => item.subscribed && !item.opted_out).length : Number(!!recipient);
  const visible = members.filter(item => `${item.name} ${item.email}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <section className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif-heading text-3xl">Members &amp; Mailing</h2>
        <button className={secondary} disabled={busy} onClick={() => void run(refresh)}>Refresh</button>
      </div>
      <FormError error={error} />
      {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-emerald-900">{notice}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <form id="member-editor" tabIndex={-1} className={panel} onSubmit={saveMember}>
          <h3 className="font-serif-heading text-xl">{editingId ? 'Edit member' : 'Register a member'}</h3>
          <label className="block">Full name<input className={input} required value={member.name} onChange={e => setMember({ ...member, name: e.target.value })} /></label>
          <label className="block">Email<input className={input} type="email" required disabled={!!editingId} value={member.email} onChange={e => setMember({ ...member, email: e.target.value })} /></label>
          <label className="block">Phone<input className={input} type="tel" value={member.phone} onChange={e => setMember({ ...member, phone: e.target.value })} /></label>
          <label className="block">Membership status
            <select className={input} value={member.status} onChange={e => setMember({ ...member, status: e.target.value as Member['status'] })}>
              <option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={member.subscribed} disabled={!!members.find(item => item.id === editingId)?.opted_out} onChange={e => setMember({ ...member, subscribed: e.target.checked })} />
            Member opted in to church updates
          </label>
          <div className="flex gap-2">
            <button className={action} disabled={busy}>Save member</button>
            {editingId && <button type="button" className={secondary} onClick={() => { setMember(emptyMember); setEditingId(undefined); }}>Cancel edit</button>}
          </div>
        </form>

        <form className={panel} onSubmit={importCsv}>
          <h3 className="font-serif-heading text-xl">Import members from CSV</h3>
          <p>Use the columns <code>name,email,phone,status,subscribed</code>. Name and email are required. Set <code>subscribed</code> to <code>true</code> only for members who opted in.</p>
          <label className="block">CSV file
            <input className={input} type="file" accept=".csv,text/csv" onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 500000) { setError('Choose a CSV file smaller than 500 KB.'); return; }
              try { setCsv(await file.text()); } catch (cause) { setError(errorMessage(cause)); }
            }} />
          </label>
          <label className="block">CSV contents
            <textarea className={input} rows={4} required value={csv} onChange={e => setCsv(e.target.value)} placeholder={'name,email\nJane Doe,jane@example.com'} />
          </label>
          <button className={action} disabled={busy}>Import members</button>
        </form>
      </div>

      <div className={panel}>
        <h3 className="font-serif-heading text-xl">Member directory <span className="text-sm">({members.length})</span></h3>
        <label className="block">Search members<input className={input} type="search" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <ul className="max-h-80 divide-y divide-stone-100 overflow-auto">
          {visible.map(item => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div className="min-w-0 break-words">
                <strong>{item.name}</strong> <span>{item.email}</span>
                <p className="text-xs capitalize text-stone-600">{item.status} · {item.subscribed ? 'Subscribed' : 'No bulk mail'}</p>
              </div>
              <button className={secondary} onClick={() => {
                setEditingId(item.id);
                setMember({ name: item.name, email: item.email, phone: item.phone, status: item.status, subscribed: !!item.subscribed });
                document.getElementById('member-editor')?.focus();
              }}>Edit</button>
            </li>
          ))}
        </ul>
        {!visible.length && <p>No members match this search.</p>}
      </div>

      <form className={panel} onSubmit={queueMail}>
        <h3 className="font-serif-heading text-xl">Compose email</h3>
        {history && !history.configured && <p className="text-amber-900">Set up Resend or SMTP on the server to enable sending.</p>}
        <label className="block">Start from a template
          <select className={input} value="" onChange={event => {
            const selected = mailTemplates.find(template => template.label === event.target.value);
            if (selected) updateMail({ subject: selected.subject, body: selected.body });
          }}>
            <option value="">Choose a template</option>
            {mailTemplates.map(template => <option key={template.label}>{template.label}</option>)}
          </select>
        </label>
        <p className="text-stone-600">Edit the subject and message before sending. For events and services, choose a published event to include its date, time, and location.</p>
        <label className="block">Recipients
          <select className={input} value={mail.audience} onChange={e => updateMail({ audience: e.target.value as Campaign['audience'] })}>
            <option value="member">One active member</option>
            <option value="all">All active members who opted in</option>
          </select>
        </label>
        {mail.audience === 'member' && <label className="block">Member
          <select className={input} required value={mail.memberId} onChange={e => updateMail({ memberId: e.target.value })}>
            <option value="">Choose a member</option>
            {active.map(item => <option key={item.id} value={item.id}>{item.name} ({item.email})</option>)}
          </select>
        </label>}
        <label className="block">Subject<input className={input} required maxLength={180} value={mail.subject} onChange={e => updateMail({ subject: e.target.value })} /></label>
        <label className="block">Message<textarea className={input} rows={5} required maxLength={12000} value={mail.body} onChange={e => updateMail({ body: e.target.value })} /></label>
        <label className="block">Include an event
          <select className={input} value={mail.eventId} onChange={e => updateMail({ eventId: e.target.value })}>
            <option value="">No event</option>
            {services.filter(service => service.status !== 'Draft').map(service => <option key={service.id} value={service.id}>{service.title} ({service.date})</option>)}
          </select>
        </label>
        <label className="block">Schedule send time (optional, your local time)
          <input className={input} type="datetime-local" value={mail.sendAt} onChange={e => updateMail({ sendAt: e.target.value })} />
        </label>
        {review && <p className="rounded-lg bg-amber-50 p-3">
          Queue “{mail.subject}” for {mail.audience === 'member' ? recipient?.email : `approximately ${eligible} subscribed members`}
          {mail.sendAt ? ` on ${new Date(mail.sendAt).toLocaleString()}` : ' now'}?
        </p>}
        <button className={action} disabled={busy || !history?.configured || !eligible}>{review ? 'Confirm and queue' : 'Review mailing'}</button>
      </form>

      <div className={panel}>
        <h3 className="font-serif-heading text-xl">Church office notifications</h3>
        <p className="text-stone-600">Contact and prayer form alerts are addressed to admin@rccgdhog.org.</p>
        {!history?.notifications?.length && <p>No alerts yet.</p>}
        {history?.notifications?.map(item => (
          <div key={item.id} className="border-t border-stone-200 pt-2">
            <strong>{item.subject}</strong>
            <p>{new Date(item.created).toLocaleString()} · {item.state}{item.error && ` · ${item.error}`}</p>
          </div>
        ))}
      </div>

      <div className={panel}>
        <h3 className="font-serif-heading text-xl">Mail history</h3>
        {!history?.campaigns.length && <p>No mailings yet.</p>}
        {history?.campaigns.map(item => (
          <div key={item.id} className="space-y-2 border-t border-stone-200 pt-3">
            <strong>{item.subject}</strong>
            <p>{new Date(item.due * 1000).toLocaleString()} · {Object.entries(item.counts).map(([state, count]) => `${count} ${state}`).join(' · ')}</p>
            <div className="flex flex-wrap gap-2">
              <button className={secondary} disabled={busy} onClick={() => void run(async () => setDetails(await api(`/admin/mail/${item.id}`)))}>Delivery details</button>
              {!!item.counts.queued && <button className={secondary} disabled={busy} onClick={() => void run(async () => {
                const result = await api<{ cancelled: number }>(`/admin/mail/${item.id}/cancel`, 'POST');
                setNotice(`Cancelled ${result.cancelled} queued messages.`);
                setDetails(undefined);
                await refresh();
              })}>Cancel queued mail</button>}
            </div>
            {details?.id === item.id && <ul className="max-h-60 space-y-2 overflow-auto">
              {details.deliveries.map(delivery => <li key={delivery.recipient} className="break-words">{delivery.recipient} · {delivery.state}{delivery.error && ` · ${delivery.error}`}</li>)}
            </ul>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function SubmissionInbox() {
  const [items, setItems] = useState<Submission[]>([]);
  const [error, setError] = useState('');

  async function refresh() {
    setError('');
    try { setItems(await api('/admin/submissions')); } catch (cause) { setError(errorMessage(cause)); }
  }

  useEffect(() => { void refresh(); }, []);

  async function update(item: Submission, status: SubmissionStatus) {
    setError('');
    try {
      await api(`/admin/submissions/${item.id}`, 'PATCH', { status });
      await refresh();
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  return (
    <section className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif-heading text-3xl">Visitor &amp; Ministry Inbox</h2>
        <button className={secondary} onClick={() => void refresh()}>Refresh</button>
      </div>
      <FormError error={error} />
      {!items.length && <p className={panel}>Visit plans, ride requests, and ministry inquiries appear here.</p>}
      {items.map(item => (
        <article className={panel} key={item.id}>
          <h3 className="font-serif-heading text-xl">{item.data.name} · {({ visit: 'Visit plan', ride: 'Ride request', ministry: 'Ministry inquiry' })[item.kind]}</h3>
          <p>{new Date(item.data.submittedAt).toLocaleString()}</p>
          <dl className="grid gap-2">
            {Object.entries(item.data).filter(([key, value]) => !['name', 'id', 'submittedAt'].includes(key) && value).map(([key, value]) => (
              <div key={key} className="break-words">
                <dt className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt><dd className="whitespace-pre-wrap">{value}</dd>
              </div>
            ))}
          </dl>
          <label className="block">Status<select className={input} value={item.status} onChange={e => void update(item, e.target.value as SubmissionStatus)}>
            <option>New</option><option>In progress</option><option>Closed</option>
          </select></label>
        </article>
      ))}
    </section>
  );
}

export function AnnouncementEditor({ announcements, onChange }: {
  announcements: ParishAnnouncement[];
  onChange: (entry: ParishAnnouncement) => void;
}) {
  const [editing, setEditing] = useState<ParishAnnouncement>();
  return (
    <section className="space-y-4 text-sm">
      <h2 className="font-serif-heading text-3xl">Parish announcements</h2>
      <form key={editing?.id ?? 'new'} className={panel} onSubmit={event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        onChange({
          id: editing?.id ?? crypto.randomUUID(), title: String(data.get('title')), content: String(data.get('content')),
          category: data.get('category') as ParishAnnouncement['category'], priority: 'Normal',
          publishedDate: String(data.get('publishedDate')), expiryDate: String(data.get('expiryDate')) || undefined,
          isActive: data.has('isActive'),
        });
        setEditing(undefined);
        form.reset();
      }}>
        <h3 className="font-serif-heading text-xl">{editing ? 'Edit announcement' : 'New announcement'}</h3>
        <label className="block">Title<input name="title" className={input} defaultValue={editing?.title} maxLength={150} required /></label>
        <label className="block">Message<textarea name="content" className={input} defaultValue={editing?.content} maxLength={3000} required rows={4} /></label>
        <label className="block">Category<select name="category" className={input} defaultValue={editing?.category}>
          <option>Weekly Bulletin</option><option>Parish Alert</option><option>Special Programme</option><option>Ministry Notice</option>
        </select></label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label>Publish date<input name="publishedDate" type="date" className={input} defaultValue={editing?.publishedDate ?? new Date().toISOString().slice(0, 10)} required /></label>
          <label>End date (optional)<input name="expiryDate" type="date" className={input} defaultValue={editing?.expiryDate} /></label>
        </div>
        <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} /> Show on website</label>
        <div className="flex gap-2">
          <button className={action}>Save announcement</button>
          {editing && <button type="button" className={secondary} onClick={() => setEditing(undefined)}>Cancel edit</button>}
        </div>
      </form>
      {announcements.map(item => (
        <article className={panel} key={item.id}>
          <h3 className="font-serif-heading text-xl">{item.title}</h3>
          <p className="whitespace-pre-wrap">{item.content}</p>
          <p>{item.isActive ? 'Enabled' : 'Hidden'} · {item.publishedDate}{item.expiryDate && ` – ${item.expiryDate}`}</p>
          <div className="flex gap-2">
            <button className={secondary} onClick={() => setEditing(item)}>Edit</button>
            <button className={secondary} onClick={() => onChange({ ...item, isActive: !item.isActive })}>{item.isActive ? 'Hide' : 'Enable'}</button>
          </div>
        </article>
      ))}
    </section>
  );
}

export function GivingLedger({ records, onAdd }: { records: GivingRecord[]; onAdd: (record: GivingRecord) => void }) {
  return (
    <section className="space-y-4 text-sm">
      <h2 className="font-serif-heading text-3xl">Giving ledger</h2>
      <form className={panel} onSubmit={event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        onAdd({
          id: crypto.randomUUID(), donorName: String(data.get('donor')), amount: Number(data.get('amount')),
          fund: data.get('fund') as GivingRecord['fund'], channel: data.get('channel') as GivingRecord['channel'],
          date: String(data.get('date')), referenceId: String(data.get('reference')), status: 'Verified',
        });
        form.reset();
      }}>
        <h3 className="font-serif-heading text-xl">Record a confirmed gift</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>Donor name or ID<input className={input} name="donor" required /></label>
          <label>Amount (USD)<input className={input} name="amount" type="number" min="0.01" step="0.01" required /></label>
          <label>Fund<select className={input} name="fund">
            <option>Tithe</option><option>Sunday Offering</option><option>Building Project</option><option>Benevolence / Welfare</option><option>Missions &amp; Outreach</option>
          </select></label>
          <label>Channel<select className={input} name="channel">
            <option>Zelle</option><option>SMS Text-to-Give</option><option>Online Portal</option><option>In-Person Cash/Check</option>
          </select></label>
          <label>Date<input className={input} name="date" type="date" required /></label>
          <label>Receipt or reference<input className={input} name="reference" required /></label>
        </div>
        <button className={action}>Save gift record</button>
      </form>
      <ul className={panel}>
        {records.map(record => <li key={record.id} className="flex flex-wrap justify-between gap-2 border-b border-stone-100 pb-2">
          <span><strong>{record.donorName}</strong> · {record.fund} · {record.date}</span>
          <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(record.amount)} · {record.channel}</span>
        </li>)}
        {!records.length && <li>No gifts recorded.</li>}
      </ul>
    </section>
  );
}
