import { youtubeEmbedUrl } from '../data/youtube';
import { StaffGate } from '../components/StaffGate';
import { AccountSettings } from '../components/AccountSettings';
import { ArchivePagination } from '../components/ArchiveContent';
import { GalleryPhoto } from '../components/GalleryPhoto';
import { AnnouncementEditor, GivingLedger, MembersMail, SubmissionInbox } from '../components/StaffOperations';
import { FormError } from '../components/ServerForm';
import { api, errorMessage } from '../data/api';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Heart,
  Shield,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  Download,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  LogOut,
  Bell,
  DollarSign,
  Tv,
  FileText,
  RotateCcw,
  Play,
  Check,
  X,
  Layers,
  Sparkles,
  Award,
  Droplets,
  Gift,
  Send,
  MessageSquare,
  Camera,
  Radio,
  Video,
  Phone,
  Mail,
  MapPin,
  Eye,
  Sliders,
  Share2
} from 'lucide-react';
import { RccgLogo } from '../components/RccgLogo';
import { CHURCH_INFO, Sermon, CHURCH_LEADERSHIP } from '../data/churchData';
import { GalleryItem, GALLERY_CATEGORIES } from '../data/galleryData';
import {
  ChurchService,
  OrderItem,
  PrayerInquiryItem,
  DiscipleshipRecord,
  GivingRecord,
  ParishAnnouncement,
  LiveStreamConfig,
  ContactMessage,
  ChurchContactConfig,
  AdminStoreData,
  StaffSite
} from '../data/adminStore';

interface AdminDashboardPageProps {
  onNavigate: (route: string) => void;
}
const sermonsPerPage = 10;


type TabType =
  | 'overview'
  | 'liveStream'
  | 'services'
  | 'orderOfService'
  | 'sermons'
  | 'gallery'
  | 'contact'
  | 'prayers'
  | 'discipleship'
  | 'giving'
  | 'announcements'
  | 'members'
  | 'visitorInbox'
  | 'accountSettings';

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  return <StaffGate>{(site, account, signOut, returnToSignIn) => (
    <Dashboard initial={site} onNavigate={onNavigate} signOut={signOut} role={account.role}
      email={account.email} returnToSignIn={returnToSignIn} />
  )}</StaffGate>;
}

function Dashboard({ initial, onNavigate, signOut, role, email, returnToSignIn }: AdminDashboardPageProps & {
  initial: StaffSite;
  signOut: () => Promise<void>;
  role: string;
  email: string;
  returnToSignIn: (updatedEmail?: string) => void;
}) {
  const [store, setStore] = useState(initial.data);
  const [streamSource, setStreamSource] = useState(initial.data.liveStream.videoIdOrUrl);
  const saved = useRef(initial);
  const draft = useRef(initial.data);
  const writes = useRef(Promise.resolve());
  const generation = useRef(0);
  const outstanding = useRef(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected service for Order of Worship
  const [selectedServiceId, setSelectedServiceId] = useState(initial.data.services[0]?.id || '');

  // Category filter for gallery
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('all');

  // Category filter for sermons
  const [sermonTypeFilter, setSermonTypeFilter] = useState('All');
  const [requestedSermonPage, setSermonPage] = useState(1);

  // Preview video player inside admin
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Modals
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ChurchService | null>(null);

  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);

  const [isLiveRundownOpen, setIsLiveRundownOpen] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);


  const updateStore = (updater: (previous: AdminStoreData) => AdminStoreData) => {
    const next = updater(draft.current);
    draft.current = next;
    setStore(next);
    setSaveError('');
    setSaving(true);
    outstanding.current += 1;
    const attempt = generation.current;

    writes.current = writes.current.then(async () => {
      try {
        if (attempt !== generation.current) return;
        saved.current = await api<StaffSite>('/admin/site', 'PUT', { version: saved.current.version, data: next });
      } catch (cause) {
        generation.current += 1;
        const latest = await api<StaffSite>('/admin/site').catch(() => saved.current);
        saved.current = latest;
        draft.current = latest.data;
        setStore(latest.data);
        setSaveError(errorMessage(cause));
      } finally {
        outstanding.current -= 1;
        if (outstanding.current === 0) setSaving(false);
      }
    });
  };

  const refreshStore = async () => {
    if (outstanding.current) return;
    setSaveError('');
    try {
      const latest = await api<StaffSite>('/admin/site');
      if (outstanding.current) return;
      saved.current = latest;
      draft.current = latest.data;
      setStore(latest.data);
      setStreamSource(latest.data.liveStream.videoIdOrUrl);
    } catch (cause) {
      setSaveError(errorMessage(cause));
    }
  };

  const selectedService = useMemo(() => {
    return store.services.find((s) => s.id === selectedServiceId) || store.services[0];
  }, [store.services, selectedServiceId]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalServices = store.services.length;
    const upcomingServices = store.services.filter((s) => s.status === 'Scheduled').length;
    const pendingPrayers = store.prayers.filter((p) => p.status === 'Unread' || p.status === 'In Prayer Altar').length;
    const unreadMessages = store.contactMessages.filter((m) => m.status === 'Unread').length;
    const totalPhotos = store.gallery.length;
    const totalSermons = store.sermons.length;
    const isLive = store.liveStream.status === 'LIVE NOW';
    return { totalServices, upcomingServices, pendingPrayers, unreadMessages, totalPhotos, totalSermons, isLive };
  }, [store]);

  // Service CRUD handlers
  const handleSaveService = (serviceData: Partial<ChurchService>) => {
    if (editingService) {
      updateStore((prev) => ({
        ...prev,
        services: prev.services.map((s) =>
          s.id === editingService.id ? ({ ...s, ...serviceData } as ChurchService) : s
        )
      }));

    } else {
      const newService: ChurchService = {
        id: `srv-${Date.now()}`,
        title: serviceData.title || 'Special Church Service',
        serviceType: serviceData.serviceType || 'Sunday Worship',
        date: serviceData.date || new Date().toISOString().split('T')[0],
        startTime: serviceData.startTime || '10:00 AM',
        endTime: serviceData.endTime || '12:00 PM',
        location: serviceData.location || 'Main Sanctuary (337 Avon Ave)',
        status: serviceData.status || 'Draft',
        theme: serviceData.theme || 'Faith & Dominion',
        scriptureAnchor: serviceData.scriptureAnchor || 'Romans 8:37',
        targetAttendance: serviceData.targetAttendance || 200,
        roster: serviceData.roster || {
          presidingMinister: 'Pastor Taiwo Olulana',
          preacher: 'Pastor Remi Afolabi',
          worshipLeader: 'Deaconess Olubimpe Oyesanya',
          openingPrayerLeader: 'Minister Julia Egbuna',
          scriptureReader: 'Minister Olawumi Oguntola',
          usherLead: 'Sanctuary Protocol',
          mediaLead: 'Minister Kolawole Afolabi',
          childrenChurchLead: 'Deaconess Ebunoluwa Olulana'
        },
        orderOfService: serviceData.orderOfService || [
          { id: 'item-1', order: 1, title: 'Opening Prayer', durationMinutes: 5, assignedTo: 'Presiding Minister' },
          { id: 'item-2', order: 2, title: 'Praise & Worship', durationMinutes: 20, assignedTo: 'Choir' },
          { id: 'item-3', order: 3, title: 'The Word (Sermon)', durationMinutes: 35, assignedTo: 'Pastor Remi Afolabi' },
          { id: 'item-4', order: 4, title: 'Tithes & Offerings', durationMinutes: 10, assignedTo: 'Finance Team' },
          { id: 'item-5', order: 5, title: 'Closing & Benediction', durationMinutes: 5, assignedTo: 'Pastor Remi Afolabi' }
        ]
      };
      updateStore((prev) => ({
        ...prev,
        services: [newService, ...prev.services]
      }));
      setSelectedServiceId(newService.id);

    }
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    if (store.services.length <= 1) {
      alert('You must keep at least one service on the roster.');
      return;
    }
    if (confirm('Are you sure you want to delete this church service?')) {
      updateStore((prev) => ({
        ...prev,
        services: prev.services.filter((s) => s.id !== id)
      }));

    }
  };

  // Live Stream Config updater
  const handleUpdateLiveStream = (updates: Partial<LiveStreamConfig>) => {
    updateStore((prev) => ({
      ...prev,
      liveStream: {
        ...prev.liveStream,
        ...updates
      }
    }));

  };

  const handleToggleGoLive = () => {
    const nextStatus = store.liveStream.status === 'LIVE NOW' ? 'Offline' : 'LIVE NOW';
    handleUpdateLiveStream({ status: nextStatus });

  };

  // Gallery CRUD
  const handleSaveGalleryItem = (itemData: Partial<GalleryItem>) => {
    if (editingGalleryItem) {
      updateStore((prev) => ({
        ...prev,
        gallery: prev.gallery.map((g) =>
          g.id === editingGalleryItem.id ? ({ ...g, ...itemData } as GalleryItem) : g
        )
      }));

    } else {
      const newItem: GalleryItem = {
        id: `g-${Date.now()}`,
        title: itemData.title || 'Parish Moment',
        category: (itemData.category as any) || 'worship',
        categoryLabel: itemData.categoryLabel || 'Sunday Worship',
        imageSrc: itemData.imageSrc || '/assets/gallery/SUNDAY-SERVICE.jpg',
        date: itemData.date || 'Dominion Service',
        description: itemData.description || 'Congregation worshipping at RCCG Dominion Hope of Glory.',
        scripture: itemData.scripture || 'Psalm 100:4',
        featured: itemData.featured || false
      };
      updateStore((prev) => ({
        ...prev,
        gallery: [newItem, ...prev.gallery]
      }));

    }
    setIsGalleryModalOpen(false);
    setEditingGalleryItem(null);
  };

  const handleDeleteGalleryItem = (id: string) => {
    if (confirm('Delete this photo from the gallery?')) {
      updateStore((prev) => ({
        ...prev,
        gallery: prev.gallery.filter((g) => g.id !== id)
      }));

    }
  };

  // Sermon CRUD
  const handleSaveSermon = (sermonData: Partial<Sermon>) => {
    if (editingSermon) {
      updateStore((prev) => ({
        ...prev,
        sermons: prev.sermons.map((s) =>
          s.id === editingSermon.id ? ({ ...s, ...sermonData } as Sermon) : s
        )
      }));

    } else {
      const newSermon: Sermon = {
        id: `sermon-${Date.now()}`,
        title: sermonData.title || 'Untitled Message',
        preacher: sermonData.preacher || 'Pastor Remi Afolabi',
        date: sermonData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        scripture: sermonData.scripture || 'Colossians 1:27',
        type: sermonData.type || 'Sunday Service',
        summary: sermonData.summary || 'Summary outline of this message.',
        videoUrl: sermonData.videoUrl || CHURCH_INFO.youtubeUrl,
        imageSrc: sermonData.imageSrc
      };
      updateStore((prev) => ({
        ...prev,
        sermons: [newSermon, ...prev.sermons]
      }));
      setSermonPage(1);

    }
    setIsSermonModalOpen(false);
    setEditingSermon(null);
  };

  const handleDeleteSermon = (id: string) => {
    if (confirm('Delete this message from the public library?')) {
      updateStore((prev) => ({
        ...prev,
        sermons: prev.sermons.filter((s) => s.id !== id)
      }));

    }
  };

  // Contact Messages Handlers
  const handleUpdateContactMessageStatus = (id: string, status: ContactMessage['status']) => {
    updateStore((prev) => ({
      ...prev,
      contactMessages: prev.contactMessages.map((m) => (m.id === id ? { ...m, status } : m))
    }));

  };

  const handleDeleteContactMessage = (id: string) => {
    if (confirm('Delete this inquiry message?')) {
      updateStore((prev) => ({
        ...prev,
        contactMessages: prev.contactMessages.filter((m) => m.id !== id)
      }));

    }
  };

  const handleUpdateChurchContact = (updates: Partial<ChurchContactConfig>) => {
    updateStore((prev) => ({
      ...prev,
      churchContactConfig: {
        ...prev.churchContactConfig,
        ...updates
      }
    }));

  };

  // Order of service item additions & changes
  const handleAddOrderItem = () => {
    if (!selectedService) return;
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      order: selectedService.orderOfService.length + 1,
      title: 'New Service Agenda Segment',
      durationMinutes: 10,
      assignedTo: 'Minister on Duty',
      notes: ''
    };
    updateStore((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === selectedService.id
          ? { ...s, orderOfService: [...s.orderOfService, newItem] }
          : s
      )
    }));

  };

  const handleUpdateOrderItem = (itemId: string, field: keyof OrderItem, value: any) => {
    if (!selectedService) return;
    updateStore((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === selectedService.id
          ? {
              ...s,
              orderOfService: s.orderOfService.map((it) =>
                it.id === itemId ? { ...it, [field]: value } : it
              )
            }
          : s
      )
    }));
  };

  const handleDeleteOrderItem = (itemId: string) => {
    if (!selectedService) return;
    updateStore((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === selectedService.id
          ? {
              ...s,
              orderOfService: s.orderOfService.filter((it) => it.id !== itemId)
            }
          : s
      )
    }));

  };

  // Filtered queries
  const filteredServices = useMemo(() => {
    if (!searchQuery) return store.services;
    const q = searchQuery.toLowerCase();
    return store.services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.theme.toLowerCase().includes(q) ||
        s.serviceType.toLowerCase().includes(q)
    );
  }, [store.services, searchQuery]);

  const filteredGallery = useMemo(() => {
    return store.gallery.filter((g) => {
      const matchCat = galleryCategoryFilter === 'all' || g.category === galleryCategoryFilter;
      const matchSearch =
        !searchQuery ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [store.gallery, galleryCategoryFilter, searchQuery]);

  const filteredSermons = useMemo(() => {
    return store.sermons.filter((s) => {
      const matchType = sermonTypeFilter === 'All' || s.type === sermonTypeFilter;
      const matchSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.preacher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.scripture?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [store.sermons, sermonTypeFilter, searchQuery]);
  const sermonPages = Math.ceil(filteredSermons.length / sermonsPerPage);
  const sermonPage = Math.min(requestedSermonPage, Math.max(sermonPages, 1));
  const sermonStart = (sermonPage - 1) * sermonsPerPage;
  const visibleSermons = filteredSermons.slice(sermonStart, sermonStart + sermonsPerPage);

  const totalCalculatedDuration = useMemo(() => {
    if (!selectedService) return 0;
    return selectedService.orderOfService.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  }, [selectedService]);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-900 flex flex-col font-sans">
      
      {/* Top Console Bar */}
      <header className="sticky top-0 z-40 bg-[#04241c] text-white border-b border-[#d8b267]/35 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          
          {/* Brand & Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
              title="Return to Public Church Website"
            >
              <RccgLogo size={32} />
              <div className="leading-none">
                <span className="font-serif-heading font-bold text-sm tracking-tight text-[#fae19c] block">
                  RCCG DHOG Staff Console
                </span>
                <span className="text-[11px] text-[#b3d4c6] font-sans">
                  Parish management
                </span>
              </div>
            </button>

            <span className="hidden sm:inline-block text-[#326752]">/</span>
            
            <span className="hidden sm:inline-block text-xs font-medium text-stone-300 capitalize">
              {activeTab === 'overview' && 'Executive Overview'}
              {activeTab === 'liveStream' && 'Live Stream & Broadcast Manager'}
              {activeTab === 'services' && 'Church Services & Schedules'}
              {activeTab === 'orderOfService' && 'Order of Worship Builder'}
              {activeTab === 'sermons' && 'Sermons & Bible Teachings'}
              {activeTab === 'gallery' && 'Parish Photo Gallery Manager'}
              {activeTab === 'contact' && 'Contact Inquiries & Parish Info'}
              {activeTab === 'prayers' && 'Pastoral Care & Prayer Desk'}
              {activeTab === 'discipleship' && 'Connect & Discipleship Registry'}
              {activeTab === 'giving' && 'Stewardship & Giving Records'}
              {activeTab === 'announcements' && 'Parish Bulletin & Notices'}
              {activeTab === 'members' && 'Members & Mailing'}
              {activeTab === 'visitorInbox' && 'Visitor & Ministry Inbox'}
              {activeTab === 'accountSettings' && 'Account Settings'}
            </span>
          </div>

          {/* Action Center */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Indicator / Quick Button */}
            <button
              onClick={handleToggleGoLive}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                store.liveStream.status === 'LIVE NOW'
                  ? 'bg-red-600 text-white animate-pulse shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:text-white border border-stone-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{store.liveStream.status === 'LIVE NOW' ? 'Live now' : 'Offline'}</span>
            </button>

            <button
              onClick={() => setIsLiveRundownOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#144837] hover:bg-[#1a5b46] text-[#fae19c] text-xs font-semibold border border-[#fae19c]/20 transition-colors cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Pulpit Teleprompter</span>
            </button>

            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Public website</span>
            </button>
            <button type="button" className="rounded-lg border border-white/30 px-3 py-1.5 text-xs" disabled={saving}
              onClick={() => void signOut().catch(cause => setSaveError(errorMessage(cause)))}>Sign out</button>
          </div>

        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col md:flex-row gap-8 w-full">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          
          {/* Quick Parish Profile Card */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>Sanctuary Station</span>
              <span className="text-emerald-700 font-semibold font-mono tabular-nums">337 Avon Ave</span>
            </div>
            <h2 className="font-serif-heading font-bold text-stone-900 text-base leading-tight">
              Dominion Hope of Glory
            </h2>
            <p className="text-xs text-stone-600">
              Senior Pastor: <strong className="text-stone-900">Pastor Remi Afolabi</strong>
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="bg-white rounded-2xl p-2 border border-stone-200 shadow-xs space-y-1">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#08281d] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#b48227]" />
                <span>Executive Overview</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeTab === 'overview' ? 'text-white' : ''}`} />
            </button>

            {/* LIVE STREAM MANAGER TAB */}
            <button
              onClick={() => setActiveTab('liveStream')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'liveStream'
                  ? 'bg-[#08281d] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Radio className={`w-4 h-4 ${store.liveStream.status === 'LIVE NOW' ? 'text-red-500 animate-pulse' : 'text-[#b48227]'}`} />
                <span>Live Stream Manager</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                store.liveStream.status === 'LIVE NOW' ? 'bg-red-600 text-white' : 'bg-stone-100 text-stone-600'
              }`}>
                {store.liveStream.status === 'LIVE NOW' ? 'LIVE' : 'IDLE'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-[#08281d] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#b48227]" />
                <span>Services & Schedules</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                {store.services.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orderOfService')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'orderOfService'
                  ? 'bg-[#08281d] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#b48227]" />
                <span>Order of Worship</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-emerald-700 font-semibold">
                {selectedService ? `${totalCalculatedDuration}m` : ''}
              </span>
            </button>

            {/* SERMONS & BIBLE TEACHINGS TAB */}
            <button
              onClick={() => setActiveTab('sermons')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'sermons'
                  ? 'bg-[#08281d] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#b48227]" />
                <span>Sermons & Teachings</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                {store.sermons.length}
              </span>
            </button>

            {/* GALLERY MANAGER TAB */}
            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-[#08281d] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-[#b48227]" />
                <span>Parish Photo Gallery</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                {store.gallery.length}
              </span>
            </button>

            {/* CONTACT & INQUIRIES TAB */}
            <button
              onClick={() => setActiveTab('contact')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-[#08281d] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#b48227]" />
                <span>Contact & Inquiries</span>
              </div>
              {stats.unreadMessages > 0 && (
                <span className="text-[10px] font-mono tabular-nums bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                  {stats.unreadMessages}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('prayers')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'prayers'
                  ? 'bg-[#08281d] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#b48227]" />
                <span>Prayer & Pastoral Desk</span>
              </div>
              {stats.pendingPrayers > 0 && (
                <span className="text-[10px] font-mono tabular-nums bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                  {stats.pendingPrayers}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('discipleship')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'discipleship'
                  ? 'bg-[#08281d] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#b48227]" />
                <span>Connect & Discipleship</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                {store.discipleship.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('giving')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'giving'
                  ? 'bg-[#08281d] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-[#b48227]" />
                <span>Stewardship & Giving</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-[#08281d] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#b48227]" />
                <span>Parish Announcements</span>
              </div>
            </button>

            {([['members', 'Members & Mailing'], ['visitorInbox', 'Visitor & Ministry Inbox'], ['accountSettings', 'Account Settings']] as const).map(([tab, label]) => (
              <button type="button" key={tab} onClick={() => setActiveTab(tab)} aria-pressed={activeTab === tab}
                className={`w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium ${activeTab === tab ? 'bg-[#08281d] text-white' : 'hover:bg-stone-100'}`}>
                {label}
              </button>
            ))}
          </nav>

          {/* Quick Links to Public Website Sections */}
          <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200 text-xs space-y-2">
            <span className="font-semibold text-stone-800 block">Preview Public Pages</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onNavigate('/watch')}
                className="py-1.5 px-2 bg-white rounded-lg text-stone-700 hover:text-[#08281d] hover:border-[#fae19c] border border-stone-200 font-medium text-center truncate cursor-pointer"
              >
                Watch Page →
              </button>
              <button
                onClick={() => onNavigate('/gallery')}
                className="py-1.5 px-2 bg-white rounded-lg text-stone-700 hover:text-[#08281d] hover:border-[#fae19c] border border-stone-200 font-medium text-center truncate cursor-pointer"
              >
                Gallery Page →
              </button>
              <button
                onClick={() => onNavigate('/sermons')}
                className="py-1.5 px-2 bg-white rounded-lg text-stone-700 hover:text-[#08281d] hover:border-[#fae19c] border border-stone-200 font-medium text-center truncate cursor-pointer"
              >
                Sermons Page →
              </button>
              <button
                onClick={() => onNavigate('/contact')}
                className="py-1.5 px-2 bg-white rounded-lg text-stone-700 hover:text-[#08281d] hover:border-[#fae19c] border border-stone-200 font-medium text-center truncate cursor-pointer"
              >
                Contact Page →
              </button>
            </div>
          </div>

        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p role="status" className="text-stone-600">{saving ? 'Saving changes…' : role === 'pastor' ? 'Pastor access' : 'Staff access'}</p>
            <button className="rounded-lg border border-stone-300 px-3 py-1.5" disabled={saving} onClick={() => void refreshStore()}>Refresh console</button>
          </div>
          <FormError error={saveError} />
          {activeTab === 'members' && <MembersMail services={store.services} />}
          {activeTab === 'visitorInbox' && <SubmissionInbox />}
          {activeTab === 'accountSettings' && <AccountSettings email={email} saving={saving} returnToSignIn={returnToSignIn} />}
          
          {/* TAB: LIVE STREAM MANAGER */}
          {activeTab === 'liveStream' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#b48227] uppercase tracking-wider">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Broadcast Sanctuary Operations</span>
                  </div>
                  <h2 className="font-serif-heading text-2xl font-bold text-stone-900 mt-1">
                    Live Stream & Video Sanctuary Manager
                  </h2>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    Choose which YouTube video appears on the website. Start and stop broadcasts in YouTube Studio.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleGoLive}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                      store.liveStream.status === 'LIVE NOW'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[#08281d] hover:bg-[#0c392a] text-[#fae19c]'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>{store.liveStream.status === 'LIVE NOW' ? 'Mark website offline' : 'Mark website live'}</span>
                  </button>
                </div>
              </div>

              {/* Main Live Stream Player / Monitor Box */}
              <div className="bg-stone-900 text-white rounded-3xl overflow-hidden border border-stone-800 shadow-2xl space-y-4">
                
                {/* Video Monitor / Player View */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src={store.liveStream.thumbnailUrl || '/assets/extracted/hero_worship.jpg'}
                    alt="Sanctuary Stream Feed"
                    className="w-full h-full object-cover filter brightness-75 scale-105"
                  />

                  {/* Top Status Overlays */}
                  <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow flex items-center gap-1.5 ${
                      store.liveStream.status === 'LIVE NOW' ? 'bg-red-600 text-white animate-pulse' : 'bg-stone-800 text-stone-300'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      {store.liveStream.status}
                    </span>

                  </div>

                  {/* Play Action linking to official channel */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
                    <a
                      href={CHURCH_INFO.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-20 h-20 rounded-full bg-[#fae19c] hover:bg-white text-[#08281d] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 mb-3 group"
                    >
                      <Play className="w-10 h-10 fill-current ml-1" />
                    </a>
                    <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold text-white drop-shadow-md max-w-xl">
                      {store.liveStream.streamTitle}
                    </h3>
                    <p className="text-[#d1e2db] text-xs sm:text-sm mt-1 max-w-md">
                      {store.liveStream.preacher} · {store.liveStream.scripture}
                    </p>
                  </div>

                  {/* Bottom Right Direct Link */}
                  <div className="absolute bottom-5 right-5 z-20">
                    <a
                      href={CHURCH_INFO.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Live Stream on YouTube</span>
                    </a>
                  </div>
                </div>

                {/* Stream Settings Form */}
                <div className="p-6 bg-stone-900 border-t border-stone-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-[#fae19c] tracking-wider">
                      Broadcast Configuration
                    </span>
                    <span className="text-stone-400 text-xs">
                      The Watch page refreshes these settings automatically.
                    </span>
                  </div>

                  <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
                    event.preventDefault();
                    handleUpdateLiveStream({ videoIdOrUrl: streamSource.trim() });
                  }}>
                    <label className="min-w-0 flex-1 text-sm">YouTube video link or ID
                      <input value={streamSource} onChange={event => setStreamSource(event.target.value)}
                        className="mt-1 w-full rounded-xl border border-stone-600 bg-stone-800 px-3 py-2"
                        placeholder="https://www.youtube.com/watch?v=…" />
                    </label>
                    <button className="rounded-xl bg-[#fae19c] px-4 py-2 text-xs font-bold text-[#08281d]" disabled={saving}>Save video</button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-stone-400 mb-1">Broadcast Status</label>
                      <select
                        value={store.liveStream.status}
                        onChange={(e) => handleUpdateLiveStream({ status: e.target.value as any })}
                        className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
                      >
                        <option value="LIVE NOW">LIVE NOW (Active Stream)</option>
                        <option value="Pre-Service Countdown">Pre-Service Countdown</option>
                        <option value="Offline">Offline</option>
                        <option value="Replay Archive">Replay Archive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">Service Classification</label>
                      <select
                        value={store.liveStream.activeServiceType}
                        onChange={(e) => handleUpdateLiveStream({ activeServiceType: e.target.value as any })}
                        className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
                      >
                        <option value="Sunday Worship Celebration">Sunday Worship Celebration</option>
                        <option value="Wednesday Digging Deep (Bible Study)">Wednesday Bible Study</option>
                        <option value="Night of Glory Vigil">Night of Glory Vigil</option>
                        <option value="Special Meeting">Special Conference</option>
                      </select>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-stone-400 mb-1">Stream Headline / Title</label>
                      <input
                        type="text"
                        value={store.liveStream.streamTitle}
                        onChange={(e) => handleUpdateLiveStream({ streamTitle: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1">Preacher & Scripture</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={store.liveStream.preacher}
                          placeholder="Preacher"
                          onChange={(e) => handleUpdateLiveStream({ preacher: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
                        />
                        <input
                          type="text"
                          value={store.liveStream.scripture}
                          placeholder="Scripture"
                          onChange={(e) => handleUpdateLiveStream({ scripture: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-stone-400 mb-1">Pinned Sanctuary Notice / Prompt</label>
                    <input
                      type="text"
                      value={store.liveStream.pinnedNotice || ''}
                      onChange={(e) => handleUpdateLiveStream({ pinnedNotice: e.target.value })}
                      placeholder="e.g. Welcome to worship! Send your prayer requests in the box below."
                      className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: GALLERY MANAGER */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#b48227] uppercase tracking-wider">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Visual Archives</span>
                  </div>
                  <h2 className="font-serif-heading text-2xl font-bold text-stone-900 mt-1">
                    Parish Photo Gallery Manager
                  </h2>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    Manage life at DHOG photos, albums, captions, scriptures, and featured event snapshots.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingGalleryItem(null);
                      setIsGalleryModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#08281d] text-[#fae19c] font-bold text-xs flex items-center gap-1.5 hover:bg-[#0c392a] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload / Add Photo</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-stone-200">
                <div className="flex flex-wrap items-center gap-1.5">
                  {GALLERY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setGalleryCategoryFilter(cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        galleryCategoryFilter === cat.id
                          ? 'bg-[#08281d] text-[#fae19c]'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search photos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGallery.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col justify-between group">
                    <div className="aspect-4/3 relative bg-stone-100 overflow-hidden">
                      <img
                        src={item.imageSrc}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // fallback image if path fails
                          (e.currentTarget as HTMLImageElement).src = '/assets/gallery/SUNDAY-SERVICE.jpg';
                        }}
                      />
                      {item.featured && (
                        <div className="absolute top-2.5 left-2.5 bg-[#08281d]/90 text-[#fae19c] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <Sparkles className="w-3 h-3" />
                          <span>Featured</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-[#b48227] font-semibold">
                          <span>{item.categoryLabel}</span>
                          <span className="font-mono text-stone-400">{item.scripture}</span>
                        </div>
                        <h4 className="font-serif-heading font-bold text-stone-900 text-base leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setEditingGalleryItem(item);
                            setIsGalleryModalOpen(true);
                          }}
                          className="text-xs text-stone-700 hover:text-[#08281d] font-semibold flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteGalleryItem(item.id)}
                          className="text-xs text-stone-400 hover:text-red-700 p-1"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB: SERMONS & BIBLE TEACHINGS */}
          {activeTab === 'sermons' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#b48227] uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Pulpit & Teaching Ministry</span>
                  </div>
                  <h2 id="admin-sermon-library" tabIndex={-1} className="font-serif-heading text-2xl font-bold text-stone-900 mt-1">
                    Sermons & Bible Teachings Library
                  </h2>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    Manage Sunday morning sermons, Wednesday Digging Deep Bible studies, and conference archives.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingSermon(null);
                      setIsSermonModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#08281d] text-[#fae19c] font-bold text-xs flex items-center gap-1.5 hover:bg-[#0c392a] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publish Message</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-stone-200">
                <div className="flex flex-wrap items-center gap-1.5">
                  {['All', 'Sunday Service', 'Bible Study', 'Conference', 'Special Meeting'].map((type) => (
                    <button
                      key={type}
                      onClick={() => { setSermonTypeFilter(type); setSermonPage(1); }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        sermonTypeFilter === type
                          ? 'bg-[#08281d] text-[#fae19c]'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {type === 'Bible Study' ? 'Wednesday Bible Study' : type}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search sermon title, preacher..."
                    aria-label="Search the admin sermon library"
                    value={searchQuery}
                    onChange={event => { setSearchQuery(event.target.value); setSermonPage(1); }}
                    className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Embedded Player Preview if Active */}
              {previewVideoUrl && (
                <div className="p-6 bg-stone-900 text-white rounded-3xl space-y-3 border border-stone-800 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-[#fae19c]">Video Preview Monitor</span>
                    <button onClick={() => setPreviewVideoUrl(null)} className="text-xs text-stone-400 hover:text-white">
                      Close Preview
                    </button>
                  </div>
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                    <iframe
                      src={previewVideoUrl}
                      title="Sermon Player"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Sermons List */}
              <p className="text-sm text-stone-600" role="status">{visibleSermons.length
                ? `Showing ${sermonStart + 1}–${sermonStart + visibleSermons.length} of ${filteredSermons.length} sermons`
                : 'No sermons match your filters.'}</p>
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs divide-y divide-stone-100">
                {visibleSermons.map((sermon) => (
                  <div key={sermon.id} className="p-5 hover:bg-stone-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start">
                      <GalleryPhoto src={sermon.imageSrc || '/assets/extracted/open_bible.jpg'} alt=""
                        className="aspect-video w-full shrink-0 rounded-xl bg-stone-100 object-cover sm:w-32" />
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`font-semibold ${sermon.type === 'Bible Study' ? 'text-blue-700' : 'text-[#b48227]'}`}>
                            {sermon.type === 'Bible Study' ? 'Wednesday Bible Study (Digging Deep)' : sermon.type}
                          </span>
                          <span className="text-stone-300">·</span>
                          <span className="font-mono tabular-nums text-stone-500">{sermon.date}</span>
                          <span className="text-stone-300">·</span>
                          <span className="font-semibold text-stone-800">{sermon.scripture}</span>
                        </div>
                        <h3 className="font-serif-heading font-bold text-lg text-stone-900">
                          {sermon.title}
                        </h3>
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {sermon.summary}
                        </p>
                        <div className="pt-1 text-xs text-stone-700">
                          Preacher: <strong className="text-stone-900">{sermon.preacher}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const embed = youtubeEmbedUrl(sermon.videoUrl);
                          if (embed) setPreviewVideoUrl(embed);
                          else setSaveError('Add a YouTube video link to preview this sermon.');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Preview Video</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingSermon(sermon);
                          setIsSermonModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteSermon(sermon.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Delete sermon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <ArchivePagination label="Admin sermon library pages" page={sermonPage} totalPages={sermonPages} onPage={next => {
                setSermonPage(next);
                document.getElementById('admin-sermon-library')?.focus();
              }} />
            </div>
          )}

          {/* TAB: CONTACT & INQUIRIES DESK */}
          {activeTab === 'contact' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#b48227] uppercase tracking-wider">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Church Office Communications</span>
                  </div>
                  <h2 className="font-serif-heading text-2xl font-bold text-stone-900 mt-1">
                    Contact Inquiries & Parish Directory
                  </h2>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    Review messages submitted through the website and update official office contact details.
                  </p>
                </div>
              </div>

              {/* Church Office Contact Config Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-serif-heading font-bold text-lg text-stone-900">
                    Official Parish Contact Info (Synchronized Across Website)
                  </h3>
                  <span className="text-xs text-stone-400">Click any field to update public display</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Main Phone</label>
                    <input
                      type="text"
                      value={store.churchContactConfig.phone}
                      onChange={(e) => handleUpdateChurchContact({ phone: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Directory / Alternate Phone</label>
                    <input
                      type="text"
                      value={store.churchContactConfig.directoryPhone}
                      onChange={(e) => handleUpdateChurchContact({ directoryPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Office Email</label>
                    <input
                      type="email"
                      value={store.churchContactConfig.email}
                      onChange={(e) => handleUpdateChurchContact({ email: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Official Published Address</label>
                    <input
                      type="text"
                      value={store.churchContactConfig.sanctuaryAddress}
                      onChange={(e) => handleUpdateChurchContact({ sanctuaryAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Office Hours</label>
                    <input
                      type="text"
                      value={store.churchContactConfig.officeHours}
                      onChange={(e) => handleUpdateChurchContact({ officeHours: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Inquiries List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-heading font-bold text-xl text-stone-900">
                    Incoming Messages from Contact Form ({store.contactMessages.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {store.contactMessages.map((msg) => (
                    <div key={msg.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-stone-900">{msg.name}</span>
                            <span className="text-stone-300">·</span>
                            <span className="text-stone-500">{msg.email}</span>
                            <span className="text-stone-300">·</span>
                            <span className="text-stone-500">{msg.phone}</span>
                            <span className="text-stone-300">·</span>
                            <span className="font-mono text-stone-400">{msg.submittedAt}</span>
                          </div>
                          <h4 className="font-serif-heading font-bold text-base text-stone-900 mt-1">
                            {msg.subject}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={msg.status}
                            onChange={(e) => handleUpdateContactMessageStatus(msg.id, e.target.value as any)}
                            className="text-xs font-semibold px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-800"
                          >
                            <option value="Unread">Unread</option>
                            <option value="Replied">Replied</option>
                            <option value="Archived">Archived</option>
                          </select>
                          <button
                            onClick={() => handleDeleteContactMessage(msg.id)}
                            className="p-1 text-stone-400 hover:text-red-700"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/70 p-3.5 rounded-xl border border-stone-100">
                        "{msg.message}"
                      </p>

                      {msg.internalNotes && (
                        <div className="text-xs text-stone-500 italic">
                          Office note: {msg.internalNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-[#08281d] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
                <div className="relative z-10 space-y-3 max-w-2xl">
                  <div className="text-xs uppercase tracking-[0.2em] font-semibold text-[#fae19c]">
                    Pulpit Operations & Pastoral Oversight
                  </div>
                  <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#faecd0]">
                    Parish Command Center
                  </h1>
                  <p className="text-[#d1e2db] text-xs sm:text-sm leading-relaxed">
                    Full control over worship service agendas, live streaming broadcasts, media library, photo albums, and congregation contact inquiries.
                  </p>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Live Broadcast</span>
                    <Radio className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="font-mono tabular-nums text-xl sm:text-2xl font-bold text-stone-900">
                    {store.liveStream.status}
                  </div>
                  <p className="text-[11px] text-stone-500">{store.liveStream.viewerCount} live worshippers</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Sermons & Bible Studies</span>
                    <BookOpen className="w-4 h-4 text-[#b48227]" />
                  </div>
                  <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-stone-900">
                    {store.sermons.length}
                  </div>
                  <p className="text-[11px] text-stone-500">Video & audio teachings</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Parish Photos</span>
                    <Camera className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-stone-900">
                    {store.gallery.length}
                  </div>
                  <p className="text-[11px] text-stone-500">Across 5 active albums</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Contact Inquiries</span>
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-stone-900">
                    {store.contactMessages.length}
                  </div>
                  <p className="text-[11px] text-stone-500">{stats.unreadMessages} unread messages</p>
                </div>
              </div>

              {/* Quick Jump Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('liveStream')}
                  className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#b48227] text-left transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Broadcast Operations</span>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-serif-heading font-bold text-base text-stone-900">
                    Manage Live Stream & Player
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Control broadcast state, active YouTube stream ID, and online viewer alerts.
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('gallery')}
                  className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#b48227] text-left transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Photo Archives</span>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-serif-heading font-bold text-base text-stone-900">
                    Update Church Photo Gallery
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Add fellowship, worship, retreat, and youth ministry photos.
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('sermons')}
                  className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#b48227] text-left transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#b48227] uppercase tracking-wider">Word Repository</span>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-serif-heading font-bold text-base text-stone-900">
                    Sermons & Bible Teachings
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Publish Sunday sermons and Wednesday Digging Deep expository lessons.
                  </p>
                </button>
              </div>

            </div>
          )}

          {/* TAB: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-heading text-2xl font-bold text-stone-900">
                    Church Services & Liturgical Calendar
                  </h2>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    Manage service timings, themes, targets, and ministerial duty assignments.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingService(null);
                    setIsServiceModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#08281d] text-[#fae19c] font-bold text-xs flex items-center gap-1.5 hover:bg-[#0c392a] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredServices.map((service) => (
                  <div key={service.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span className="font-bold text-[#b48227]">{service.serviceType}</span>
                          <span>·</span>
                          <span className="font-mono">{service.date}</span>
                          <span>·</span>
                          <span>{service.startTime} – {service.endTime}</span>
                        </div>
                        <h3 className="font-serif-heading font-bold text-lg text-stone-900 mt-0.5">
                          {service.title}
                        </h3>
                        <p className="text-xs text-stone-600">
                          Theme: "{service.theme}" ({service.scriptureAnchor})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedServiceId(service.id);
                            setActiveTab('orderOfService');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors"
                        >
                          Order of Worship ({service.orderOfService.length})
                        </button>
                        <button
                          onClick={() => {
                            setEditingService(service);
                            setIsServiceModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ORDER OF SERVICE */}
          {activeTab === 'orderOfService' && selectedService && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-[#b48227]">
                    Active Worship Rundown
                  </div>
                  <h2 className="font-serif-heading text-xl font-bold text-stone-900">
                    {selectedService.title}
                  </h2>
                  <p className="text-xs text-stone-500 font-mono tabular-nums mt-0.5">
                    {selectedService.date} · {selectedService.startTime} · Total Duration: {totalCalculatedDuration} minutes
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddOrderItem}
                    className="px-3 py-1.5 rounded-xl bg-[#08281d] text-[#fae19c] font-bold text-xs flex items-center gap-1.5 hover:bg-[#0c392a] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Segment</span>
                  </button>

                  <button
                    onClick={() => setIsLiveRundownOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Live Teleprompter</span>
                  </button>
                </div>
              </div>

              {/* Order of Service Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4 min-w-[180px]">Agenda Segment</th>
                      <th className="py-3 px-4 w-28 text-center">Duration</th>
                      <th className="py-3 px-4 min-w-[160px]">Minister In Charge</th>
                      <th className="py-3 px-4 min-w-[200px]">Notes</th>
                      <th className="py-3 px-4 w-14 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {selectedService.orderOfService.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4 text-center font-mono font-bold text-stone-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateOrderItem(item.id, 'title', e.target.value)}
                            className="w-full font-semibold text-stone-900 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-[#08281d] focus:outline-none py-0.5"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              max={180}
                              value={item.durationMinutes}
                              onChange={(e) => handleUpdateOrderItem(item.id, 'durationMinutes', parseInt(e.target.value) || 0)}
                              className="w-12 text-center font-mono tabular-nums font-bold border border-stone-200 rounded px-1 py-0.5 text-xs"
                            />
                            <span className="text-stone-400 text-[11px]">min</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={item.assignedTo}
                            onChange={(e) => handleUpdateOrderItem(item.id, 'assignedTo', e.target.value)}
                            className="w-full text-stone-700 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-[#08281d] focus:outline-none py-0.5"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={item.notes || ''}
                            placeholder="Add liturgical cues or hymn title..."
                            onChange={(e) => handleUpdateOrderItem(item.id, 'notes', e.target.value)}
                            className="w-full text-stone-500 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-[#08281d] focus:outline-none py-0.5"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteOrderItem(item.id)}
                            className="text-stone-400 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PRAYERS */}
          {activeTab === 'prayers' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif-heading text-2xl font-bold text-stone-900">
                    Pastoral Care & Prayer Petitions ({store.prayers.length})
                  </h2>
                  <p className="text-xs text-stone-600">
                    Direct petitions submitted through the church website prayer desk for Pastor Remi Afolabi and the intercessory altar.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    {store.prayers.filter(p => p.status === 'In Prayer Altar' || p.status === 'Unread').length} Active in Altar
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {store.prayers.map((prayer) => {
                  const updatePrayerStatus = (newStatus: 'In Prayer Altar' | 'Pastor Replied' | 'Resolved') => {
                    updateStore(previous => ({
                      ...previous,
                      prayers: previous.prayers.map(p => p.id === prayer.id ? { ...p, status: newStatus } : p),
                    }));
                  };

                  return (
                    <div key={prayer.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3 hover:border-emerald-200 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#b48227] px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/60">
                            {prayer.category}
                          </span>
                          <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                            Lead: {prayer.assignedMinister || 'Pastor Remi Afolabi'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            prayer.status === 'In Prayer Altar' ? 'bg-amber-100 text-amber-900' :
                            prayer.status === 'Pastor Replied' ? 'bg-blue-100 text-blue-900' :
                            prayer.status === 'Resolved' ? 'bg-emerald-100 text-emerald-900' :
                            'bg-stone-100 text-stone-800'
                          }`}>
                            {prayer.status}
                          </span>
                          <span className="font-mono text-stone-400 text-[11px]">{prayer.submittedAt}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-serif-heading font-bold text-base text-stone-900">
                          {prayer.subjectOrTopic}
                        </h3>
                        {prayer.pastoralNotes && (
                          <div className="mt-1 text-[11px] text-emerald-800 font-medium bg-emerald-50/70 px-2.5 py-1 rounded-lg border border-emerald-200/50 inline-block">
                            {prayer.pastoralNotes}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200/70 font-sans">
                        "{prayer.message}"
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-stone-100">
                        <div className="text-stone-600">
                          From: <strong className="text-stone-900">{prayer.name}</strong> 
                          {prayer.phone && <span> · <a href={`tel:${prayer.phone}`} className="text-emerald-700 hover:underline">{prayer.phone}</a></span>}
                          {prayer.email && <span> · <a href={`mailto:${prayer.email}`} className="text-emerald-700 hover:underline">{prayer.email}</a></span>}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {prayer.status !== 'In Prayer Altar' && (
                            <button
                              type="button"
                              onClick={() => updatePrayerStatus('In Prayer Altar')}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold transition-colors cursor-pointer border border-amber-200"
                            >
                              Move to Prayer Altar
                            </button>
                          )}
                          {prayer.status !== 'Pastor Replied' && (
                            <button
                              type="button"
                              onClick={() => updatePrayerStatus('Pastor Replied')}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-semibold transition-colors cursor-pointer border border-blue-200"
                            >
                              Mark Pastor Replied
                            </button>
                          )}
                          {prayer.status !== 'Resolved' && (
                            <button
                              type="button"
                              onClick={() => updatePrayerStatus('Resolved')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-semibold transition-colors cursor-pointer border border-emerald-200"
                            >
                              Mark Answered / Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: DISCIPLESHIP */}
          {activeTab === 'discipleship' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-serif-heading text-2xl font-bold text-stone-900">
                Connect & Discipleship Registry ({store.discipleship.length})
              </h2>
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Pathway Form</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Phone / Email</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {store.discipleship.map((disc) => (
                      <tr key={disc.id} className="hover:bg-stone-50">
                        <td className="py-3 px-4 font-semibold text-[#b48227]">{disc.formType}</td>
                        <td className="py-3 px-4 font-bold text-stone-900">{disc.fullName}</td>
                        <td className="py-3 px-4 text-stone-600">{disc.phone} · {disc.email}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-800">
                          <select aria-label={`Follow-up status for ${disc.fullName}`} value={disc.status} onChange={event => {
                            const status = event.target.value as DiscipleshipRecord['status'];
                            updateStore(previous => ({ ...previous, discipleship: previous.discipleship.map(item => item.id === disc.id ? { ...item, status } : item) }));
                          }}>
                            {['Pending Contact', 'Contacted', 'Orientation Scheduled', 'Graduated / Active'].map(status => <option key={status}>{status}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: GIVING */}
          {activeTab === 'giving' && (
            <GivingLedger records={store.giving} onAdd={record => updateStore(previous => ({
              ...previous, giving: [record, ...previous.giving],
            }))} />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementEditor announcements={store.announcements} onChange={entry => updateStore(previous => ({
              ...previous,
              announcements: previous.announcements.some(item => item.id === entry.id)
                ? previous.announcements.map(item => item.id === entry.id ? entry : item)
                : [entry, ...previous.announcements],
            }))} />
          )}

        </main>

      </div>

      {/* MODAL: ADD / EDIT GALLERY ITEM */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif-heading font-bold text-xl text-stone-900">
                {editingGalleryItem ? 'Edit Gallery Photo' : 'Add Photo to Church Gallery'}
              </h3>
              <button onClick={() => setIsGalleryModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                const cat = fd.get('category') as any;
                const catObj = GALLERY_CATEGORIES.find((c) => c.id === cat);
                handleSaveGalleryItem({
                  title: fd.get('title') as string,
                  category: cat,
                  categoryLabel: catObj ? catObj.label : 'Sunday Worship',
                  imageSrc: fd.get('imageSrc') as string,
                  date: (fd.get('date') as string) || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                  scripture: fd.get('scripture') as string,
                  description: fd.get('description') as string,
                  featured: fd.get('featured') === 'on'
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Photo Title *</label>
                <input
                  name="title"
                  required
                  defaultValue={editingGalleryItem?.title || ''}
                  placeholder="e.g. Anointed Praise & Worship Celebration"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category / Album</label>
                  <select
                    name="category"
                    defaultValue={editingGalleryItem?.category || 'worship'}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white"
                  >
                    <option value="worship">Sunday Worship & Choir</option>
                    <option value="fellowship">Men & Women Fellowships</option>
                    <option value="youth-teens">Teens & Young Adults</option>
                    <option value="events">Conferences & Vigils</option>
                    <option value="community">Couples & Community Care</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Occasion / Date</label>
                  <input
                    name="date"
                    defaultValue={editingGalleryItem?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    placeholder="e.g. November 8, 2026"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Scripture Citation</label>
                  <input
                    name="scripture"
                    defaultValue={editingGalleryItem?.scripture || 'Psalm 100:4'}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>


              <div>
                <label className="block font-semibold text-stone-700 mb-1">Image Source (URL or File Path) *</label>
                <input
                  name="imageSrc"
                  required
                  defaultValue={editingGalleryItem?.imageSrc || '/assets/gallery/SUNDAY-SERVICE.jpg'}
                  placeholder="/assets/gallery/... or https://..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Available presets: /assets/gallery/SUNDAY-SERVICE.jpg, /assets/gallery/Choir2.jpg, /assets/gallery/Couples-Dinner.jpg, /assets/gallery/TEENS.jpg
                </span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Caption / Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingGalleryItem?.description || ''}
                  placeholder="Description of the ministry moment..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  defaultChecked={editingGalleryItem?.featured || false}
                  className="rounded text-[#08281d]"
                />
                <label htmlFor="featured" className="text-stone-700 font-semibold cursor-pointer">
                  Feature in homepage & gallery highlights strip
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#08281d] text-[#fae19c] font-bold rounded-xl shadow hover:bg-[#0c392a]"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SERMON & BIBLE TEACHING */}
      {isSermonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif-heading font-bold text-xl text-stone-900">
                {editingSermon ? 'Edit Sermon / Bible Teaching' : 'Publish Sermon or Bible Teaching'}
              </h3>
              <button onClick={() => setIsSermonModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                handleSaveSermon({
                  title: fd.get('title') as string,
                  preacher: fd.get('preacher') as string,
                  date: fd.get('date') as string,
                  scripture: fd.get('scripture') as string,
                  type: fd.get('type') as any,
                  summary: fd.get('summary') as string,
                  videoUrl: fd.get('videoUrl') as string,
                  imageSrc: String(fd.get('imageSrc')).trim()
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Message Title *</label>
                <input
                  name="title"
                  required
                  defaultValue={editingSermon?.title || ''}
                  placeholder="e.g. Keys to Walking in Divine Dominion"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Preacher *</label>
                  <input
                    name="preacher"
                    required
                    defaultValue={editingSermon?.preacher || 'Pastor Remi Afolabi'}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Teaching Category</label>
                  <select
                    name="type"
                    defaultValue={editingSermon?.type || 'Sunday Service'}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white"
                  >
                    <option value="Sunday Service">Sunday Service Message</option>
                    <option value="Bible Study">Wednesday Bible Study (Digging Deep)</option>
                    <option value="Conference">Special Conference / Vigil</option>
                    <option value="Special Meeting">Special Meeting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Scripture Reference</label>
                  <input
                    name="scripture"
                    defaultValue={editingSermon?.scripture || 'Colossians 1:27'}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    name="date"
                    defaultValue={editingSermon?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Video Stream / YouTube Link</label>
                <input
                  name="videoUrl"
                  defaultValue={editingSermon?.videoUrl || CHURCH_INFO.youtubeUrl}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label htmlFor="sermon-image-src" className="block font-semibold text-stone-700 mb-1">Thumbnail image URL</label>
                <input id="sermon-image-src" name="imageSrc" type="text" inputMode="url"
                  defaultValue={editingSermon?.imageSrc || ''}
                  placeholder="https://example.org/sermon.jpg"
                  aria-describedby="sermon-image-help"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs" />
                <p id="sermon-image-help" className="mt-1 text-stone-600">Use an image URL or a site path such as /assets/sermon.jpg. Leave blank to use the default image.</p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Message Synopsis & Study Notes</label>
                <textarea
                  name="summary"
                  rows={3}
                  defaultValue={editingSermon?.summary || ''}
                  placeholder="Brief summary or bullet point outline..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSermonModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#08281d] text-[#fae19c] font-bold rounded-xl shadow hover:bg-[#0c392a]"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIVE TELEPROMPTER */}
      {isLiveRundownOpen && selectedService && (
        <div className="fixed inset-0 z-50 bg-[#08281d] text-white flex flex-col p-6 sm:p-10 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#144837] pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h2 className="font-serif-heading font-bold text-2xl text-[#faecd0]">
                Live Pulpit & AV Teleprompter Rundown
              </h2>
              <span className="text-xs text-stone-300 font-mono">
                {selectedService.title} ({selectedService.date})
              </span>
            </div>

            <button
              onClick={() => setIsLiveRundownOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Close Teleprompter [ESC]
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 py-8 overflow-y-auto">
            <div className="lg:col-span-2 bg-[#051c14] border border-[#144837] rounded-3xl p-8 flex flex-col justify-between">
              {selectedService.orderOfService[activeSegmentIndex] ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-xs text-[#fae19c] uppercase tracking-widest font-semibold">
                    <span>Current Agenda Segment ({activeSegmentIndex + 1} of {selectedService.orderOfService.length})</span>
                    <span className="font-mono tabular-nums text-lg font-bold">
                      {selectedService.orderOfService[activeSegmentIndex].durationMinutes} Minutes Allotted
                    </span>
                  </div>

                  <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-[#faecd0] leading-tight">
                    {selectedService.orderOfService[activeSegmentIndex].title}
                  </h1>

                  <div className="text-xl sm:text-2xl text-stone-200">
                    Minister: <strong className="text-[#fae19c]">{selectedService.orderOfService[activeSegmentIndex].assignedTo}</strong>
                  </div>

                  {selectedService.orderOfService[activeSegmentIndex].notes && (
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-sm text-[#d1e2db]">
                      Notes: {selectedService.orderOfService[activeSegmentIndex].notes}
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex items-center justify-between pt-6 border-t border-[#144837]">
                <button
                  disabled={activeSegmentIndex === 0}
                  onClick={() => setActiveSegmentIndex((i) => Math.max(0, i - 1))}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold"
                >
                  ← Previous Segment
                </button>
                <button
                  disabled={activeSegmentIndex >= selectedService.orderOfService.length - 1}
                  onClick={() => setActiveSegmentIndex((i) => Math.min(selectedService.orderOfService.length - 1, i + 1))}
                  className="px-6 py-2.5 rounded-xl bg-[#fae19c] hover:bg-[#f6d782] disabled:opacity-30 text-[#08281d] text-xs font-bold"
                >
                  Next Segment →
                </button>
              </div>
            </div>

            <div className="bg-[#051c14] border border-[#144837] rounded-3xl p-6 overflow-y-auto space-y-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#fae19c] block mb-3">
                Full Service Sequence
              </span>
              {selectedService.orderOfService.map((seg, idx) => (
                <button
                  key={seg.id}
                  onClick={() => setActiveSegmentIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                    activeSegmentIndex === idx
                      ? 'bg-[#144837] text-white border-[#fae19c]'
                      : 'bg-black/20 text-stone-300 border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#faecd0]">{idx + 1}. {seg.title}</span>
                    <span className="font-mono tabular-nums text-[11px] text-stone-400">{seg.durationMinutes}m</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5 truncate">{seg.assignedTo}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SERVICE */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif-heading font-bold text-xl text-stone-900">
                {editingService ? 'Edit Church Service' : 'Schedule New Church Service'}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                handleSaveService({
                  title: fd.get('title') as string,
                  serviceType: fd.get('serviceType') as any,
                  date: fd.get('date') as string,
                  status: fd.get('status') as ChurchService['status'],
                  location: String(fd.get('location')),
                  startTime: fd.get('startTime') as string,
                  endTime: fd.get('endTime') as string,
                  theme: fd.get('theme') as string,
                  scriptureAnchor: fd.get('scriptureAnchor') as string,
                  targetAttendance: parseInt(fd.get('targetAttendance') as string) || 200,
                  roster: {
                    presidingMinister: fd.get('presidingMinister') as string,
                    preacher: fd.get('preacher') as string,
                    worshipLeader: fd.get('worshipLeader') as string,
                    openingPrayerLeader: fd.get('openingPrayerLeader') as string,
                    scriptureReader: fd.get('scriptureReader') as string,
                    usherLead: fd.get('usherLead') as string,
                    mediaLead: fd.get('mediaLead') as string,
                    childrenChurchLead: fd.get('childrenChurchLead') as string
                  }
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Service Title *</label>
                <input
                  name="title"
                  required
                  defaultValue={editingService?.title || 'Sunday Worship Celebration'}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Service Type</label>
                  <select
                    name="serviceType"
                    defaultValue={editingService?.serviceType || 'Sunday Worship'}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white"
                  >
                    <option value="Sunday Worship">Sunday Worship</option>
                    <option value="Bible Study">Bible Study (Wednesday)</option>
                    <option value="Holy Communion">Holy Communion</option>
                    <option value="Vigil">Night of Glory Vigil</option>
                    <option value="Youth & Young Adults">Youth & Young Adults</option>
                    <option value="Special Meeting">Special Conference</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Date *</label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={editingService?.date || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target Attendance</label>
                  <input
                    type="number"
                    name="targetAttendance"
                    defaultValue={editingService?.targetAttendance || 240}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="font-semibold">Publishing status
                  <select name="status" defaultValue={editingService?.status || 'Draft'}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2">
                    <option>Draft</option><option>Scheduled</option><option>Live / In Progress</option><option>Completed</option>
                  </select>
                </label>
                <label className="font-semibold">Location
                  <input name="location" defaultValue={editingService?.location || CHURCH_INFO.displayAddress} required
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2" />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Start Time</label>
                  <input
                    name="startTime"
                    defaultValue={editingService?.startTime || '10:00 AM'}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">End Time</label>
                  <input
                    name="endTime"
                    defaultValue={editingService?.endTime || '12:15 PM'}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Theme / Focus</label>
                  <input
                    name="theme"
                    defaultValue={editingService?.theme || 'Walking in Divine Dominion'}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Scripture Anchor</label>
                  <input
                    name="scriptureAnchor"
                    defaultValue={editingService?.scriptureAnchor || 'Colossians 1:27'}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#08281d] text-[#fae19c] font-bold rounded-xl shadow hover:bg-[#0c392a]"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
