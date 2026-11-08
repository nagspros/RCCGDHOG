import type { ArchiveEvent } from './legacyArchive';
import type { Ministry, Program, Sermon } from './churchData';
import { GalleryItem } from './galleryData';

export interface OrderItem {
  id: string;
  order: number;
  title: string;
  durationMinutes: number;
  assignedTo: string;
  notes?: string;
  isCompleted?: boolean;
}

export interface ChurchService {
  id: string;
  title: string;
  serviceType: 'Sunday Worship' | 'Bible Study' | 'Holy Communion' | 'Vigil' | 'Youth & Young Adults' | 'Special Meeting';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'Scheduled' | 'Live / In Progress' | 'Completed' | 'Draft';
  theme: string;
  scriptureAnchor: string;
  targetAttendance: number;
  actualAttendance?: number;
  roster: {
    presidingMinister: string;
    preacher: string;
    worshipLeader: string;
    openingPrayerLeader: string;
    scriptureReader: string;
    usherLead: string;
    mediaLead: string;
    childrenChurchLead: string;
  };
  orderOfService: OrderItem[];
  bulletinNotes?: string;
  liveStreamUrl?: string;
}

export interface LiveStreamConfig {
  status: 'LIVE NOW' | 'Pre-Service Countdown' | 'Offline' | 'Replay Archive';
  streamTitle: string;
  streamSubtitle: string;
  videoIdOrUrl: string; // YouTube embed ID, full video URL or stream key
  thumbnailUrl: string;
  activeServiceType: 'Sunday Worship Celebration' | 'Wednesday Digging Deep (Bible Study)' | 'Night of Glory Vigil' | 'Special Meeting';
  scheduledTime: string;
  preacher: string;
  theme: string;
  scripture: string;
  viewerCount: number;
  pinnedNotice?: string;
  enableLiveChatNotice: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'Unread' | 'Replied' | 'Archived';
  internalNotes?: string;
}

export interface ChurchContactConfig {
  phone: string;
  directoryPhone: string;
  email: string;
  sanctuaryAddress: string;
  mailingAddress: string;
  youtubeUrl: string;
  facebookUrl: string;
  zelleEmail: string;
  smsGivingNumber: string;
  officeHours: string;
}

export interface PrayerInquiryItem {
  id: string;
  type: 'Prayer Request' | 'Ask the Pastor';
  name: string;
  email: string;
  phone: string;
  category: 'Healing & Health' | 'Family & Marriage' | 'Spiritual Growth' | 'Financial Breakthrough' | 'Theological / Doctrine' | 'Thanksgiving';
  subjectOrTopic: string;
  message: string;
  submittedAt: string;
  status: 'Unread' | 'In Prayer Altar' | 'Pastor Replied' | 'Resolved';
  pastoralNotes?: string;
  assignedMinister?: string;
}

export interface DiscipleshipRecord {
  id: string;
  formType: 'Newcomer' | 'Membership' | 'Water Baptism' | 'Workers in Training (WIT)';
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  submittedAt: string;
  status: 'Pending Contact' | 'Contacted' | 'Orientation Scheduled' | 'Graduated / Active';
  notes?: string;
  assignedFollowUp?: string;
}

export interface GivingRecord {
  id: string;
  donorName: string;
  amount: number;
  fund: 'Tithe' | 'Sunday Offering' | 'Building Project' | 'Benevolence / Welfare' | 'Missions & Outreach';
  channel: 'Zelle' | 'SMS Text-to-Give' | 'Online Portal' | 'In-Person Cash/Check';
  date: string;
  referenceId: string;
  status: 'Verified' | 'Pending Review' | 'Flagged';
}

export interface ParishAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'Weekly Bulletin' | 'Parish Alert' | 'Special Programme' | 'Ministry Notice';
  priority: 'High' | 'Normal' | 'Urgent';
  isActive: boolean;
  publishedDate: string;
  expiryDate?: string;
}

// Seed initial orders of service
const defaultSundayOrder: OrderItem[] = [
  { id: 'item-1', order: 1, title: 'Opening Prayer & Thanksgiving', durationMinutes: 5, assignedTo: 'Pastor Taiwo Olulana', notes: 'Psalm 100:4 thanksgiving entry' },
  { id: 'item-2', order: 2, title: 'Opening Hymn & Adoration', durationMinutes: 7, assignedTo: 'Choir (Praise Team)', notes: 'Great is Thy Faithfulness' },
  { id: 'item-3', order: 3, title: 'High Praise & Reverent Worship', durationMinutes: 20, assignedTo: 'Deaconess Olubimpe Oyesanya', notes: 'Cultural & contemporary gospel' },
  { id: 'item-4', order: 4, title: 'First-Time Visitors Warm Welcome', durationMinutes: 5, assignedTo: 'Sanctuary Protocol / Victor Igbinovia', notes: 'Distribute welcome gift packets' },
  { id: 'item-5', order: 5, title: 'Scripture Reading & Altar Focus', durationMinutes: 5, assignedTo: 'Minister Olawumi Oguntola', notes: 'Colossians 1:24–29' },
  { id: 'item-6', order: 6, title: 'Parish Announcements & Pastoral Grace', durationMinutes: 5, assignedTo: 'Pastor Taiwo Olulana', notes: 'Upcoming events & retreat reminders' },
  { id: 'item-7', order: 7, title: 'Special Choir Ministration', durationMinutes: 6, assignedTo: 'Dominion Choral Voices', notes: 'Anthem of Hope' },
  { id: 'item-8', order: 8, title: 'The Living Word (Sermon)', durationMinutes: 35, assignedTo: 'Pastor Remi Afolabi', notes: 'Theme: Experiencing His Glory' },
  { id: 'item-9', order: 9, title: 'Altar Call & Impartation Prayer', durationMinutes: 10, assignedTo: 'Pastor Remi Afolabi', notes: 'Salvation and renewal' },
  { id: 'item-10', order: 10, title: 'Tithes, Offerings & Building Seed', durationMinutes: 10, assignedTo: 'Minister Julia Egbuna', notes: 'Zelle & SMS giving prompts on screen' },
  { id: 'item-11', order: 11, title: 'Benediction & Pastoral Blessing', durationMinutes: 4, assignedTo: 'Pastor Remi Afolabi', notes: 'Numbers 6:24–26' }
];

const defaultWednesdayOrder: OrderItem[] = [
  { id: 'w-1', order: 1, title: 'Opening Prayer & Consecration', durationMinutes: 5, assignedTo: 'Minister Kolawole Afolabi' },
  { id: 'w-2', order: 2, title: 'Worship & Choral Intimacy', durationMinutes: 12, assignedTo: 'Choir Team' },
  { id: 'w-3', order: 3, title: 'Expository Bible Study Teaching', durationMinutes: 40, assignedTo: 'Pastor Remi Afolabi', notes: 'Epistle to the Romans Series' },
  { id: 'w-4', order: 4, title: 'Interactive Q&A and Practical Applications', durationMinutes: 15, assignedTo: 'Pastor Remi Afolabi' },
  { id: 'w-5', order: 5, title: 'Targeted Intercession & Closing Blessing', durationMinutes: 10, assignedTo: 'Victor Igbinovia' }
];

export const INITIAL_SERVICES: ChurchService[] = [
  {
    id: 'srv-next-sunday',
    title: 'Sunday Worship Celebration — The Glory of His Presence',
    serviceType: 'Sunday Worship',
    date: '2026-11-15',
    startTime: '10:00 AM',
    endTime: '12:15 PM',
    location: 'Main Sanctuary (337 Avon Ave) & Live Stream',
    status: 'Scheduled',
    theme: 'Walking in the Fulness of Kingdom Dominion',
    scriptureAnchor: 'Colossians 1:27 — Christ in you, the hope of glory',
    targetAttendance: 240,
    roster: {
      presidingMinister: 'Pastor Taiwo Olulana',
      preacher: 'Pastor Remi Afolabi',
      worshipLeader: 'Deaconess Olubimpe Oyesanya',
      openingPrayerLeader: 'Minister Julia Egbuna',
      scriptureReader: 'Minister Olawumi Oguntola',
      usherLead: 'Sanctuary Protocol Lead',
      mediaLead: 'Minister Kolawole Afolabi',
      childrenChurchLead: 'Deaconess Ebunoluwa Olulana'
    },
    orderOfService: defaultSundayOrder,
    bulletinNotes: 'Communion wine and elements will be consecrated. Welcome packet distribution for all first-time visitors.',
    liveStreamUrl: 'https://www.youtube.com/channel/UCbaf7qittz4vReSJfeJUiZA'
  },
  {
    id: 'srv-wed-study',
    title: 'Wednesday Digging Deep — Systematic Biblical Exposition',
    serviceType: 'Bible Study',
    date: '2026-11-18',
    startTime: '07:00 PM',
    endTime: '08:30 PM',
    location: 'Main Sanctuary & Zoom / YouTube',
    status: 'Scheduled',
    theme: 'Grounded in Grace: The Mystery of Godliness',
    scriptureAnchor: '1 Timothy 3:16',
    targetAttendance: 110,
    roster: {
      presidingMinister: 'Minister Kolawole Afolabi',
      preacher: 'Pastor Remi Afolabi',
      worshipLeader: 'Min. Ayooluwa Ige',
      openingPrayerLeader: 'Dcn. Adeyinka Fadehan',
      scriptureReader: 'Elder Oluwaseun',
      usherLead: 'Weekly Protocol Duty',
      mediaLead: 'AV Team',
      childrenChurchLead: 'Youth Care Volunteer'
    },
    orderOfService: defaultWednesdayOrder,
    bulletinNotes: 'Study guides distributed electronically. Bring notebooks and physical Bibles.'
  },
  {
    id: 'srv-holy-ghost-vigil',
    title: 'Night of Glory — Apostolic Prayer & Holy Ghost Vigil',
    serviceType: 'Vigil',
    date: '2026-11-27',
    startTime: '09:00 PM',
    endTime: '01:00 AM',
    location: 'Church Sanctuary',
    status: 'Scheduled',
    theme: 'Breaking Every Ancient Gate and Yoke',
    scriptureAnchor: 'Psalm 24:7–10',
    targetAttendance: 180,
    roster: {
      presidingMinister: 'Victor Igbinovia',
      preacher: 'Pastor Remi Afolabi',
      worshipLeader: 'Choir & Praise Band',
      openingPrayerLeader: 'Pastor Taiwo Olulana',
      scriptureReader: 'Sister Grace',
      usherLead: 'Night Vigil Ushers',
      mediaLead: 'Minister Kolawole Afolabi',
      childrenChurchLead: 'N/A'
    },
    orderOfService: [
      { id: 'v-1', order: 1, title: 'Opening Warfare Hymns & Confession', durationMinutes: 20, assignedTo: 'Prayer Team' },
      { id: 'v-2', order: 2, title: 'Deep Midnight Worship & High Praise', durationMinutes: 45, assignedTo: 'Choir Praise Band' },
      { id: 'v-3', order: 3, title: 'First Prayer Watch: Family & Newark', durationMinutes: 30, assignedTo: 'Victor Igbinovia' },
      { id: 'v-4', order: 4, title: 'Prophetic Word Exhortation', durationMinutes: 35, assignedTo: 'Pastor Remi Afolabi' },
      { id: 'v-5', order: 5, title: 'Midnight Deliverance & Anointing Prayers', durationMinutes: 50, assignedTo: 'Pastoral Team' },
      { id: 'v-6', order: 6, title: 'Thanksgiving & Prophetic Decrees', durationMinutes: 20, assignedTo: 'Pastor Taiwo Olulana' }
    ]
  }
];

export const INITIAL_LIVE_STREAM: LiveStreamConfig = {
  status: 'Offline',
  streamTitle: 'Sunday Worship Celebration — Experiencing Divine Dominion',
  streamSubtitle: 'Live from the Sanctuary at 337 Avon Avenue, Newark, NJ',
  videoIdOrUrl: '',
  thumbnailUrl: '/assets/extracted/hero_worship.jpg',
  activeServiceType: 'Sunday Worship Celebration',
  scheduledTime: 'Sundays 10:00 AM EST (Doors open 8:30 AM)',
  preacher: 'Pastor Remi Afolabi',
  theme: 'Christ in You, The Hope of Glory',
  scripture: 'Colossians 1:27 & Psalm 84:7',
  viewerCount: 0,
  pinnedNotice: 'Welcome to worship! Submit your prayer requests online in the chat box below.',
  enableLiveChatNotice: true
};

export const INITIAL_CHURCH_CONTACT: ChurchContactConfig = {
  phone: '(973) 609-5858',
  directoryPhone: '(609) 744-7424',
  email: 'admin@rccgdhog.org',
  sanctuaryAddress: '337 Avon Avenue, Newark, NJ 07108, United States',
  mailingAddress: '337 Avon Avenue, Newark, NJ 07108',
  youtubeUrl: 'https://www.youtube.com/channel/UCbaf7qittz4vReSJfeJUiZA',
  facebookUrl: 'https://www.facebook.com/DominionHopeOfGlory',
  zelleEmail: 'dhopeofglory@gmail.com',
  smsGivingNumber: '973-609-5858',
  officeHours: 'Monday – Friday: 9:00 AM – 5:00 PM EST'
};

export interface AdminStoreData {
  services: ChurchService[];
  sermons: Sermon[];
  archiveEvents?: ArchiveEvent[];
  recurringPrograms?: Program[];
  ministries?: Ministry[];
  gallery: GalleryItem[];
  liveStream: LiveStreamConfig;
  contactMessages: ContactMessage[];
  churchContactConfig: ChurchContactConfig;
  prayers: PrayerInquiryItem[];
  discipleship: DiscipleshipRecord[];
  giving: GivingRecord[];
  announcements: ParishAnnouncement[];
  lastBackupDate: string;
}

export type PublicSite = Pick<AdminStoreData, 'sermons' | 'gallery' | 'churchContactConfig' | 'announcements' | 'archiveEvents' | 'recurringPrograms' | 'ministries'> & {
  services: Pick<ChurchService, 'id' | 'title' | 'serviceType' | 'date' | 'startTime' | 'endTime' | 'location' | 'status' | 'theme' | 'scriptureAnchor'>[];
};

export type PublicLive = LiveStreamConfig & { embedUrl: string | null; channelUrl: string };
export type StaffSite = { version: number; data: AdminStoreData };
