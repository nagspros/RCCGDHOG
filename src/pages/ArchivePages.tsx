import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ArchiveContent, ArchivePagination } from '../components/ArchiveContent';
import { GalleryPhoto } from '../components/GalleryPhoto';
import { PageIntro } from '../components/PageIntro';
import type { PublicSite } from '../data/adminStore';
import { usePublicData } from '../data/api';
import { MINISTRIES_CATALOG, programmeSlug, WEEKLY_PROGRAMS } from '../data/churchData';
import { GALLERY_ITEMS } from '../data/galleryData';
import { archiveDate, LEGACY_EVENTS } from '../data/legacyArchive';

const pageSize = 10;
const card = 'group block h-full overflow-hidden rounded-2xl border border-stone-200 bg-white hover:border-[#b48227]';
const link = 'inline-flex items-center gap-2 text-sm font-bold text-[#174b35] group-hover:underline';
const contentWidth = 'mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-8 sm:py-12';

export function EventsPage({ eventId }: { eventId?: string }) {
  const events = usePublicData<Partial<PublicSite>>('/public/site', {}).archiveEvents ?? LEGACY_EVENTS;
  const [query, setQuery] = useState('');
  const [currentPage, setPage] = useState(1);

  if (eventId) {
    const event = events.find(item => item.id === eventId);
    if (!event) return <Unavailable label="Events" route="/events" />;
    return (
      <>
        <PageIntro title={event.title} label={`Event archive · ${event.category}`} description={[event.dateLabel || archiveDate(event.date), event.time].filter(Boolean).join(' · ') || 'Past church event'}
          parent={{ title: 'Events', route: '/events' }} />
        <article className={contentWidth}>
          {event.imageSrc && <GalleryPhoto src={event.imageSrc} alt={event.title} className="max-h-[640px] w-full rounded-2xl bg-[#f6efdf] object-contain" />}
          {event.content.length > 0 && <section className="space-y-4">
            <h2 className="font-serif-heading text-2xl text-[#08281d]">Event details</h2>
            <ArchiveContent blocks={event.content} />
          </section>}
          <a className="home-button" href={event.sourceUrl} target="_blank" rel="noreferrer">View original event page <ArrowRight aria-hidden="true" /></a>
        </article>
      </>
    );
  }

  const filtered = events.filter(event => `${event.title} ${event.category} ${event.summary}`.toLowerCase().includes(query.trim().toLowerCase()));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const page = Math.min(currentPage, Math.max(totalPages, 1));
  return (
    <>
      <PageIntro title="Church Event Archive" label="Past events" description="Explore past retreats, conferences, and gatherings from Dominion Hope of Glory.">
        <div className="page-intro-actions"><a href="/programmes" className="home-button">See current programmes</a></div>
      </PageIntro>
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-8 sm:py-12" aria-labelledby="event-archive-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="event-archive-title" tabIndex={-1} className="font-serif-heading text-2xl">Browse past events</h2>
            <p className="text-sm text-stone-600" role="status">{filtered.length} events</p>
          </div>
          <label className="space-y-1 text-sm font-semibold">Search events
            <input className="block rounded-xl border border-stone-300 bg-white px-3 py-2" type="search" value={query}
              onChange={event => { setQuery(event.target.value); setPage(1); }} />
          </label>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice((page - 1) * pageSize, page * pageSize).map(event => (
            <li key={event.id}>
              <a href={`/events/${encodeURIComponent(event.id)}`} className={card}>
                <GalleryPhoto src={event.imageSrc || '/assets/extracted/church_building.jpg'} alt="" className="aspect-video w-full object-cover" />
                <div className="space-y-2 p-5">
                  <p className="text-xs font-semibold text-[#765618]">{[event.category, event.dateLabel || archiveDate(event.date)].filter(Boolean).join(' · ')}</p>
                  <h3 className="font-serif-heading text-xl text-[#08281d]">{event.title}</h3>
                  {event.summary && <p className="line-clamp-2 text-sm text-stone-700">{event.summary}</p>}
                  <span className={link}>Event details <ArrowRight size={16} aria-hidden="true" /></span>
                </div>
              </a>
            </li>
          ))}
        </ul>
        {!filtered.length && <p>No events match your search.</p>}
        <ArchivePagination page={page} totalPages={totalPages} onPage={next => {
          setPage(next);
          document.getElementById('event-archive-title')?.focus();
        }} />
      </section>
    </>
  );
}

export function ProgrammeDetailPage({ programmeId }: { programmeId: string }) {
  const site = usePublicData<Partial<PublicSite>>('/public/site', {});
  const service = site.services?.find(item => item.id === programmeId);
  const recurring = (site.recurringPrograms ?? WEEKLY_PROGRAMS).find(item => programmeSlug(item.title) === programmeId);
  if (!service && !recurring) return <Unavailable label="Programmes" route="/programmes" />;

  const details = service ? [
    ['Date', archiveDate(service.date)], ['Time', [service.startTime, service.endTime].filter(Boolean).join(' – ')],
    ['Location', service.location], ['Scripture', service.scriptureAnchor],
  ] : [['When', recurring!.day], ['Time', recurring!.time], ['Location', recurring!.location]];
  return (
    <>
      <PageIntro title={service?.title || recurring!.title} label={service?.serviceType || recurring!.frequency}
        description={service?.theme || recurring?.description || ''} parent={{ title: 'Programmes', route: '/programmes' }} />
      <section className={contentWidth} aria-labelledby="programme-detail-heading">
        <h2 id="programme-detail-heading" className="font-serif-heading text-2xl">Service details</h2>
        <dl className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-6 sm:grid-cols-2">
          {details.filter(([, value]) => value).map(([label, value]) => (
            <div key={label}><dt className="font-semibold text-[#08281d]">{label}</dt><dd className="text-stone-700">{value}</dd></div>
          ))}
        </dl>
        <a href="/visit" className="home-button">Plan a visit <ArrowRight aria-hidden="true" /></a>
      </section>
    </>
  );
}

export function MinistryDetailPage({ ministryId }: { ministryId: string }) {
  const { ministries = MINISTRIES_CATALOG } = usePublicData<Partial<PublicSite>>('/public/site', {});
  const ministry = ministries.find(item => item.id === ministryId);
  if (!ministry) return <Unavailable label="Ministries" route="/ministries" />;
  return (
    <>
      <PageIntro title={ministry.name} label={ministry.category} description={ministry.description} parent={{ title: 'Ministries', route: '/ministries' }} />
      <section className={contentWidth} aria-labelledby="ministry-detail-heading">
        <h2 id="ministry-detail-heading" className="font-serif-heading text-2xl">Get involved</h2>
        {ministry.leaderOrTeam && <p className="text-stone-700">Ministry coordinator or team · {ministry.leaderOrTeam}</p>}
        <a href={`/ministries?ministry=${encodeURIComponent(ministry.id)}#involvement-form`} className="home-button">Contact this ministry <ArrowRight aria-hidden="true" /></a>
      </section>
    </>
  );
}

export function GalleryDetailPage({ photoId }: { photoId: string }) {
  const gallery = usePublicData<Partial<PublicSite>>('/public/site', {}).gallery ?? GALLERY_ITEMS;
  const photo = gallery.find(item => item.id === photoId);
  if (!photo) return <Unavailable label="Gallery" route="/gallery" />;
  return (
    <>
      <PageIntro title={photo.title} label={photo.categoryLabel} description={photo.date || ''} parent={{ title: 'Gallery', route: '/gallery' }} />
      <article className={contentWidth}>
        <GalleryPhoto src={photo.imageSrc} alt={photo.title} className="max-h-[720px] w-full rounded-2xl bg-[#f6efdf] object-contain" />
        <p className="leading-relaxed text-stone-800">{photo.description}</p>
        {photo.scripture && <p className="font-semibold text-[#765618]">{photo.scripture}</p>}
        <a href="/gallery" className="home-button">Back to gallery <ArrowRight aria-hidden="true" /></a>
      </article>
    </>
  );
}

function Unavailable({ label, route }: { label: string; route: string }) {
  return <PageIntro title="Entry unavailable" label={label} description="Browse the archive for other entries." parent={{ title: label, route }} />;
}
