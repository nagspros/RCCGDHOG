import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { GalleryPhoto } from './GalleryPhoto';
import type { PublicSite } from '../data/adminStore';
import { CHURCH_INFO, programmeSlug, WEEKLY_PROGRAMS } from '../data/churchData';
import { GALLERY_ITEMS } from '../data/galleryData';
import { archiveDate, LEGACY_SERMONS } from '../data/legacyArchive';

const section = 'space-y-5 border-t border-[#e4dac8] px-5 py-8 sm:px-10 lg:px-14';
const link = 'inline-flex items-center gap-2 font-semibold text-[#174b35] hover:underline';

export function HomeExplore({ site }: { site: Partial<PublicSite> }) {
  const sermons = (site.sermons ?? LEGACY_SERMONS).slice(0, 3);
  const photos = (site.gallery ?? GALLERY_ITEMS).slice(0, 4);
  const recurring = (site.recurringPrograms ?? WEEKLY_PROGRAMS).slice(0, 3);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  const upcoming = (site.services ?? []).filter(item => item.date >= today && item.status === 'Scheduled')
    .sort((left, right) => left.date.localeCompare(right.date)).slice(0, 3);

  return (
    <>
      <section className={section} aria-labelledby="home-upcoming">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#765618]">Worship and fellowship</p>
            <h2 id="home-upcoming" className="font-serif-heading text-3xl text-[#08281d]">What’s happening at DHOG</h2>
          </div>
          <a href="/programmes" className={link}>See all programmes <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {upcoming.length ? upcoming.map(event => (
            <a key={event.id} href={`/programmes/${encodeURIComponent(event.id)}`} className="rounded-2xl border border-[#e4dac8] bg-white p-5 hover:border-[#b48227]">
              <CalendarDays size={20} className="mb-3 text-[#765618]" aria-hidden="true" />
              <h3 className="font-semibold text-[#08281d]">{event.title}</h3>
              <p className="mt-1 text-sm text-stone-700">{archiveDate(event.date)} · {event.startTime}</p>
            </a>
          )) : (
            <>
              {recurring.map(programme => (
                <a key={programme.title} href={`/programmes/${programmeSlug(programme.title)}`} className="rounded-2xl border border-[#e4dac8] bg-white p-5 hover:border-[#b48227]">
                  <CalendarDays size={20} className="mb-3 text-[#765618]" aria-hidden="true" />
                  <h3 className="font-semibold text-[#08281d]">{programme.title}</h3>
                  <p className="mt-1 text-sm text-stone-700">{programme.day} · {programme.time}</p>
                </a>
              ))}
            </>
          )}
        </div>
        <a href="/events" className={link}>Browse past church events <ArrowRight size={16} aria-hidden="true" /></a>
      </section>

      {sermons.length > 0 && <section className={`${section} bg-[#f6efdf]`} aria-labelledby="home-recent-sermons">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="home-recent-sermons" className="font-serif-heading text-3xl text-[#08281d]">From the sermon archive</h2>
          <a href="/sermons" className={link}>Browse all sermons <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {sermons.map(sermon => (
            <a key={sermon.id} href={`/sermons/${encodeURIComponent(sermon.id)}`} className="overflow-hidden rounded-2xl border border-[#e4dac8] bg-white hover:border-[#b48227]">
              <GalleryPhoto src={sermon.imageSrc || '/assets/extracted/open_bible.jpg'} alt="" className="aspect-video w-full object-cover" />
              <div className="space-y-1 p-4">
                <p className="text-xs font-semibold text-[#765618]">{archiveDate(sermon.date)}</p>
                <h3 className="font-serif-heading text-xl text-[#08281d]">{sermon.title}</h3>
                {sermon.preacher && <p className="text-sm text-stone-700">{sermon.preacher}</p>}
              </div>
            </a>
          ))}
        </div>
      </section>}

      {photos.length > 0 && <section className={section} aria-labelledby="home-church-life">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="home-church-life" className="font-serif-heading text-3xl text-[#08281d]">Life at DHOG</h2>
          <a href="/gallery" className={link}>Open the photo gallery <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {photos.map(photo => (
            <a key={photo.id} href={`/gallery/${encodeURIComponent(photo.id)}`} className="overflow-hidden rounded-xl border border-[#e4dac8] bg-white hover:border-[#b48227]">
              <GalleryPhoto src={photo.imageSrc} alt="" className="aspect-[4/3] w-full object-cover" />
              <p className="p-3 text-sm font-semibold text-[#08281d]">{photo.title}</p>
            </a>
          ))}
        </div>
      </section>}

      <section className={`${section} bg-[#f6efdf]`} aria-labelledby="home-first-visit">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="home-first-visit" className="font-serif-heading text-3xl text-[#08281d]">Coming for the first time?</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-stone-700">
              <MapPin size={17} className="shrink-0 text-[#765618]" aria-hidden="true" />
              {site.churchContactConfig?.mailingAddress || CHURCH_INFO.displayAddress}
            </p>
          </div>
          <a href="/visit" className="home-button">Plan your visit <ArrowRight aria-hidden="true" /></a>
        </div>
      </section>
    </>
  );
}
