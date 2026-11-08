import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Play, Search } from 'lucide-react';
import { ArchiveContent, ArchivePagination } from '../components/ArchiveContent';
import { GalleryPhoto } from '../components/GalleryPhoto';
import { PageIntro } from '../components/PageIntro';
import type { PublicSite } from '../data/adminStore';
import { usePublicData } from '../data/api';
import { CHURCH_INFO, type Sermon } from '../data/churchData';
import { archiveDate, LEGACY_SERMONS } from '../data/legacyArchive';
import { youtubeEmbedUrl } from '../data/youtube';

const PAGE_SIZE = 10;
const archiveLink = '/sermons';
const field = 'w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm';

function SermonDetail({ sermon }: { sermon: Sermon }) {
  const video = youtubeEmbedUrl(sermon.videoUrl);
  const audio = sermon.audioUrl;
  const content = sermon.content?.length ? sermon.content : sermon.summary ? [{ kind: 'paragraph', text: sermon.summary }] : [];
  return (
    <div className="bg-[#fcfaf7]">
      <PageIntro title={sermon.title} label={sermon.type || 'Sermon'} description={[archiveDate(sermon.date), sermon.preacher].filter(Boolean).join(' · ')} parent={{ title: 'Sermons', route: archiveLink }} />
      <article className="mx-auto max-w-4xl space-y-7 px-4 py-8 sm:px-8 sm:py-12">
        {video ? (
          <iframe title={sermon.title} src={video} className="aspect-video w-full rounded-2xl bg-black"
            allow="encrypted-media; picture-in-picture; web-share" allowFullScreen />
        ) : sermon.imageSrc && (
          <GalleryPhoto src={sermon.imageSrc} alt={sermon.title} className="aspect-video w-full rounded-2xl bg-[#08281d] object-contain" />
        )}
        {audio && <audio controls preload="none" src={audio} className="w-full">Your browser does not support audio playback.</audio>}
        {sermon.scripture && (
          <section className="rounded-xl border border-amber-100 bg-amber-50 p-5">
            <h2 className="flex items-center gap-2 font-semibold text-[#08281d]"><BookOpen size={18} aria-hidden="true" /> Scripture passage</h2>
            <p className="mt-2 leading-relaxed text-stone-800">{sermon.scripture}</p>
          </section>
        )}
        {content.length > 0 && <section className="space-y-3">
          <h2 className="font-serif-heading text-2xl text-[#08281d]">{sermon.content?.length ? 'Sermon notes' : 'Message overview'}</h2>
          <ArchiveContent blocks={content} />
        </section>}
        {sermon.series && <p className="text-sm text-stone-700">Series · {sermon.series}</p>}
        <nav className="flex flex-wrap gap-3" aria-label="Sermon links">
          <a className="home-button" href={archiveLink}><ArrowLeft aria-hidden="true" /> Back to sermons</a>
          {sermon.sourceUrl && <a className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold" href={sermon.sourceUrl} target="_blank" rel="noreferrer">Original sermon page</a>}
        </nav>
      </article>
    </div>
  );
}

export function SermonsPage({ sermonId, initialPage = 1 }: { sermonId?: string; initialPage?: number }) {
  const loaded = usePublicData<Partial<PublicSite>>('/public/site', {});
  const sermons = loaded.sermons ?? LEGACY_SERMONS;
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [preacher, setPreacher] = useState('');
  const [requestedPage, setPage] = useState(() => {
    const page = Number(new URLSearchParams(window.location.search).get('page'));
    return Number.isSafeInteger(page) && page > 0 ? page : initialPage;
  });

  function changePage(page: number) {
    setPage(page);
    const url = new URL(window.location.href);
    url.pathname = archiveLink;
    if (page > 1) url.searchParams.set('page', String(page));
    else url.searchParams.delete('page');
    window.history.replaceState(null, '', url);
  }

  if (sermonId) {
    const sermon = sermons.find(item => item.id === sermonId)
      ?? (!loaded.sermons ? LEGACY_SERMONS.find(item => item.id === sermonId) : undefined);
    return sermon ? <SermonDetail sermon={sermon} /> : (
      <PageIntro title="Sermon unavailable" label="Sermons" description="Browse the archive for another message." parent={{ title: 'Sermons', route: archiveLink }} />
    );
  }

  const term = search.trim().toLowerCase();
  const filtered = sermons.filter(sermon =>
    (!preacher || sermon.preacher === preacher) && (!type || sermon.type === type) &&
    [sermon.title, sermon.preacher, sermon.scripture, sermon.summary, sermon.series].some(value => value?.toLowerCase().includes(term)));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const page = Math.min(requestedPage, Math.max(totalPages, 1));
  const types = [...new Set(sermons.map(sermon => sermon.type).filter(Boolean))].sort();
  const preachers = [...new Set(sermons.map(sermon => sermon.preacher).filter(Boolean))].sort();

  return (
    <div className="bg-[#fcfaf7]">
      <PageIntro title="Sermons & Bible Teachings" label="Media & teaching library"
        description="Explore Sunday sermons, Bible studies, conferences, and retreat recordings from the church archive.">
        <div className="page-intro-actions">
          <a className="home-button" href="/watch"><Play aria-hidden="true" /> Watch live</a>
          <a className="home-button home-button-outline" href={CHURCH_INFO.youtubeUrl} target="_blank" rel="noreferrer">YouTube channel</a>
        </div>
      </PageIntro>
      <section id="sermon-archive" aria-labelledby="sermon-archive-title" className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-8 sm:py-12">
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="sermon-archive-title" tabIndex={-1} className="font-serif-heading text-2xl text-[#08281d]">Browse the archive</h2>
            <p className="text-sm text-stone-600" role="status">{filtered.length} messages{totalPages > 1 && ` · Page ${page} of ${totalPages}`}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
            <label className="relative">
              <span className="sr-only">Search sermons</span>
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 text-stone-500" />
              <input className={`${field} pl-9`} type="search" placeholder="Search by title, preacher, or scripture" value={search} onChange={event => { setSearch(event.target.value); changePage(1); }} />
            </label>
            <select aria-label="Service type" className={field} value={type} onChange={event => { setType(event.target.value); changePage(1); }}>
              <option value="">All service types</option>{types.map(item => <option key={item}>{item}</option>)}
            </select>
            <select aria-label="Preacher" className={field} value={preacher} onChange={event => { setPreacher(event.target.value); changePage(1); }}>
              <option value="">All preachers</option>{preachers.map(item => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>
        {!filtered.length && <p className="rounded-xl border border-stone-200 bg-white p-5">No messages match your filters.</p>}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(sermon => (
            <li key={sermon.id}>
              <a href={`${archiveLink}/${encodeURIComponent(sermon.id)}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white hover:border-[#b48227]">
                <GalleryPhoto src={sermon.imageSrc || '/assets/extracted/open_bible.jpg'} alt="" className="aspect-video w-full bg-[#08281d] object-cover" />
                <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold text-[#765618]"><CalendarDays size={15} aria-hidden="true" /> {archiveDate(sermon.date)}</p>
                  <h3 className="font-serif-heading text-xl text-[#08281d]">{sermon.title}</h3>
                  <p className="text-sm text-stone-600">{[sermon.preacher, sermon.type].filter(Boolean).join(' · ')}</p>
                  {sermon.summary && <p className="line-clamp-2 text-sm text-stone-700">{sermon.summary}</p>}
                  <span className="mt-auto flex items-center gap-2 pt-2 text-sm font-bold text-[#174b35] group-hover:underline">Open sermon <ArrowRight size={16} aria-hidden="true" /></span>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <ArchivePagination page={page} totalPages={totalPages} onPage={next => {
          changePage(next);
          document.getElementById('sermon-archive-title')?.focus();
        }} />
      </section>
    </div>
  );
}
