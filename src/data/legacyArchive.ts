import type { ArchiveBlock, Sermon } from './churchData';
import archive from './legacyArchive.json';

export type ArchiveEvent = {
  id: string;
  title: string;
  date: string;
  dateLabel?: string;
  endDate: string;
  time?: string;
  category: string;
  summary: string;
  content: ArchiveBlock[];
  imageSrc: string;
  sourceUrl: string;
};

export const LEGACY_SERMONS: Sermon[] = archive.sermons;
export const LEGACY_EVENTS: ArchiveEvent[] = archive.events;

export function archiveDate(value: string) {
  if (!value) return '';
  const date = new Date(value.slice(0, 10) + 'T12:00:00Z');
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long', timeZone: 'UTC',
  }).format(date);
}
