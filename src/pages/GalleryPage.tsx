import { usePublicData } from '../data/api';
import type { PublicSite } from '../data/adminStore';
import { GALLERY_ITEMS } from '../data/galleryData';
import { GalleryPhoto } from '../components/GalleryPhoto';
import { ArchivePagination } from '../components/ArchiveContent';
import { SectionLink } from '../components/SectionLink';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GALLERY_CATEGORIES, 
  GalleryItem 
} from '../data/galleryData';
import { 
  Camera, 
  Filter, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  BookOpen, 
  Sparkles,
  Download,
  Share2,
  Heart,
  Users
} from 'lucide-react';
import { SectionReveal } from '../components/SectionReveal';

interface GalleryPageProps {
  onNavigate: (route: string) => void;
}

const photosPerPage = 9;

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate }) => {
  const galleryItems = usePublicData<Partial<PublicSite>>('/public/site', {}).gallery ?? GALLERY_ITEMS;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [requestedPage, setPage] = useState(1);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);


  // Filter items by category and search term
  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.scripture && item.scripture.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [galleryItems, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / photosPerPage);
  const page = Math.min(requestedPage, Math.max(totalPages, 1));
  const start = (page - 1) * photosPerPage;
  const visiblePhotos = filteredItems.slice(start, start + photosPerPage);

  const filterPhotos = (category: string, query: string) => {
    setSelectedCategory(category);
    setSearchQuery(query);
    setPage(1);
  };

  const activeLightboxIndex = filteredItems.findIndex(item => item.id === activePhotoId);
  const activePhoto: GalleryItem | undefined = filteredItems[activeLightboxIndex];

  const handleNextPhoto = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (activePhoto) setActivePhotoId(filteredItems[(activeLightboxIndex + 1) % filteredItems.length].id);
  };

  const handlePreviousPhoto = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (activePhoto) setActivePhotoId(filteredItems[(activeLightboxIndex - 1 + filteredItems.length) % filteredItems.length].id);
  };

  const featuredPhoto = galleryItems[0];

  const openFeaturedPhoto = () => {
    if (!featuredPhoto) return;
    filterPhotos('all', '');
    setActivePhotoId(featuredPhoto.id);
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen">
      {/* Main Hero Banner: Features the Featured photo with Date, Content & Artwork */}
      <section className="page-intro">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Latest Upload Headline, Date, Category & Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              
              {/* Category & Date Kickers */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#fae19c]">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#124231]/90 border border-[#fae19c]/30 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#fae19c]" />
                  <span>Featured photo</span>
                </span>
                
                {featuredPhoto?.categoryLabel && (
                  <>
                    <span className="text-[#a4ccbd]">·</span>
                    <span className="text-[#d6e5de] font-medium">{featuredPhoto.categoryLabel}</span>
                  </>
                )}

                {featuredPhoto?.date && (
                  <>
                    <span className="text-[#a4ccbd]">·</span>
                    <span className="text-[#fae19c] font-mono tabular-nums flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{featuredPhoto.date}</span>
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="font-serif-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#faecd0] leading-[1.08]">
                Photo Gallery
              </h1>

              {featuredPhoto && <h2 className="text-lg sm:text-xl font-semibold text-white">{featuredPhoto.title}</h2>}

              {/* Description / Content */}
              <p className="text-[#d6e5de] text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                {featuredPhoto?.description || 'Witness the beauty of worship, fellowship, prayer, and community impact at RCCG Dominion Hope of Glory in Newark, New Jersey.'}
              </p>

              {/* Scripture Inscription */}
              {featuredPhoto?.scripture && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0b3325]/90 border border-[#fae19c]/30 text-xs font-serif italic text-[#faecd0]">
                  <BookOpen className="w-3.5 h-3.5 text-[#fae19c] shrink-0" />
                  <span>"{featuredPhoto.scripture}"</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3.5">
                {featuredPhoto && (
                  <button
                    onClick={openFeaturedPhoto}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#fae19c] hover:bg-[#f6d782] active:bg-[#ebd074] text-[#08281d] font-bold text-xs sm:text-sm shadow-md transition-all transform active:scale-[0.98] cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>View featured photo</span>
                  </button>
                )}

                <SectionLink
                  id="gallery-archive"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Browse the archive ↓
                </SectionLink>
              </div>

            </div>

            {/* Right Column: High-Res Framed Preview Card of the Latest Upload */}
            {featuredPhoto && (
              <div className="lg:col-span-5 relative">
                <button
                  type="button"
                  aria-label="Open featured photo"
                  onClick={openFeaturedPhoto}
                  className="group block w-full cursor-pointer relative rounded-2xl overflow-hidden border-2 border-[#fae19c]/40 hover:border-[#fae19c] shadow-2xl transition-all transform hover:-translate-y-1 bg-[#051c14]"
                >
                  <div className="aspect-4/3 relative overflow-hidden">
                    <GalleryPhoto
                      src={featuredPhoto.imageSrc}
                      alt={featuredPhoto.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="eager"
                    />
                    
                    {/* Hover Inspect Overlay */}
                    <div className="absolute inset-0 bg-[#08281d]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 rounded-xl bg-[#fae19c] text-[#08281d] font-bold text-xs shadow-lg flex items-center gap-1.5">
                        <Camera className="w-4 h-4" />
                        <span>View full photo</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/75 backdrop-blur-sm text-left border border-white/10 text-xs">
                      <div className="font-semibold text-white truncate">{featuredPhoto.title}</div>
                      <div className="text-[11px] text-[#fae19c] font-mono tabular-nums">{featuredPhoto.date || 'Recent Parish Capture'}</div>
                    </div>
                  </div>
                </button>
              </div>
            )}

          </div>

          {/* Quick Breadcrumbs at bottom of banner */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#a4ccbd]">
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate('/')} className="hover:text-[#fae19c] transition-colors cursor-pointer">Home</button>
              <span>/</span>
              <span className="text-[#fae19c] font-medium">Parish Photo Gallery</span>
            </div>
            <span className="font-mono tabular-nums text-stone-400">
              {galleryItems.length} gallery entries
            </span>
          </div>
        </div>
      </section>


      {/* Featured Albums Highlight Strip */}
      <SectionReveal delay={0.05} yOffset={14}>
        <section className="py-8 bg-[#0a3124] text-white border-b border-[#134937]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-[#fae19c] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Life at DHOG
                </span>
                <h2 className="text-xl font-serif text-white">Explore by album</h2>
              </div>
              <p className="text-xs text-[#d6e5de] max-w-md">
                Browse moments from worship, fellowship, and community gatherings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Couples Dinner & Fellowship', category: 'community', label: 'Community Care', file: 'Couples-Dinner.jpg' },
                { title: 'Voices of Dominion Choir', category: 'worship', label: 'Worship', file: 'Choir2.jpg' },
                { title: 'House Fellowship Network', category: 'fellowship', label: 'Fellowships', file: 'HOUSE-FELLOWSHIP-New-Now.jpg' },
                { title: 'Holy Convocation & Praise Festival', category: 'events', label: 'Church Events', file: 'Event2.jpg' },
              ].map(album => (
                <SectionLink
                  key={album.file}
                  id="gallery-archive"
                  onJump={() => filterPhotos(album.category, '')}
                  className="group block rounded-xl overflow-hidden bg-[#08281d] border border-[#1b5640] hover:border-[#fae19c] transition-colors"
                >
                  <span className="block h-36 overflow-hidden">
                    <GalleryPhoto src={`/assets/gallery/${album.file}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </span>
                  <span className="block p-3">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-[#fae19c]">{album.label}</span>
                    <span className="block text-sm font-semibold text-white">{album.title}</span>
                  </span>
                </SectionLink>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Main Filter & Gallery Content Section */}
      <section id="gallery-archive" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <h2 className="font-serif-heading text-3xl text-stone-900 mb-5">Browse church photos</h2>

        {/* Controls: Category Filter Chips & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-stone-200">
          
          {/* Category Pills */}
          <div className="flex items-center gap-2 flex-wrap pb-2 md:pb-0">
            <span className="text-stone-400 text-xs flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
            </span>
            {GALLERY_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  aria-pressed={isSelected}
                  onClick={() => filterPhotos(cat.id, searchQuery)}
                  className={`text-xs px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer font-medium ${
                    isSelected
                      ? 'bg-[#08281d] text-[#fae19c] font-semibold shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Search photos"
              placeholder="Search photos or scripture..."
              value={searchQuery}
              onChange={event => filterPhotos(selectedCategory, event.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#fae19c] focus:border-transparent transition-all shadow-2xs"
            />
            {searchQuery && (
              <button 
                onClick={() => filterPhotos(selectedCategory, '')}
                aria-label="Clear photo search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Gallery Results Count */}
        <div className="py-4 flex items-center justify-between text-xs text-stone-500">
          <span role="status">{visiblePhotos.length
            ? `Showing ${start + 1}–${start + visiblePhotos.length} of ${filteredItems.length} photos`
            : '0 photos'}</span>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => filterPhotos('all', searchQuery)}
              className="text-[#c58b2b] hover:underline cursor-pointer"
            >
              Reset to all
            </button>
          )}
        </div>

        {/* Responsive Photo Masonry / Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
            <Camera className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-serif text-stone-800">No photos found</h3>
            <p className="text-stone-500 text-xs max-w-sm mx-auto mt-1">
              No gallery images matched "{searchQuery}". Try selecting another category or clearing your search term.
            </p>
            <button
              onClick={() => filterPhotos('all', '')}
              className="mt-4 px-4 py-2 bg-[#08281d] text-[#fae19c] rounded-full text-xs font-semibold"
            >
              View All Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePhotos.map(item => (
              <div
                key={item.id}
                onClick={() => setActivePhotoId(item.id)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-[#cfb682] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <GalleryPhoto
                    src={item.imageSrc}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-xs font-medium flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                      <Camera className="w-3 h-3 text-[#fae19c]" />
                      Click to view full image
                    </span>
                  </div>

                  {/* Badge */}
                  <span className="absolute top-3 left-3 bg-[#08281d]/90 text-[#fae19c] text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
                    {item.categoryLabel}
                  </span>

                  {item.featured && (
                    <span className="absolute top-3 right-3 bg-[#c58b2b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                      Featured
                    </span>
                  )}
                </div>

                {/* Content details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-stone-900 group-hover:text-[#08281d] transition-colors leading-snug">
                      <a href={`/gallery/${encodeURIComponent(item.id)}`} onClick={event => event.stopPropagation()} className="hover:underline">{item.title}</a>
                    </h3>
                    <p className="text-stone-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    {item.date && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {item.date}
                      </span>
                    )}
                    {item.scripture && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#08281d] bg-[#faecd0] px-2 py-0.5 rounded">
                        <BookOpen className="w-3 h-3 text-[#c58b2b]" />
                        {item.scripture}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-6">
            <ArchivePagination label="Gallery pages" page={page} totalPages={totalPages} onPage={next => {
              setPage(next);
              document.getElementById('gallery-archive')?.focus();
            }} />
          </div>
        )}
      </section>

      {/* Community Invite Banner */}
      <SectionReveal delay={0.06} yOffset={16}>
        <section className="bg-stone-100 border-t border-stone-200 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-[#08281d] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="relative z-10 max-w-lg">
              <span className="text-[#fae19c] text-xs font-bold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5 mb-2">
                <Users className="w-4 h-4" /> Be Part of Our Church Family
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-white">
                Experience God’s Presence In Person
              </h3>
              <p className="text-[#d6e5de] text-sm mt-2">
                Join us this Sunday at 10:00 AM at 337 Avon Avenue, Newark, NJ. Free transportation and a loving welcome await you.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('/visit')}
                className="bg-[#fae19c] hover:bg-[#f6d782] text-[#08281d] font-semibold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md text-center cursor-pointer whitespace-nowrap"
              >
                Plan Your Visit
              </button>
              <button
                onClick={() => onNavigate('/contact')}
                className="border border-[#fae19c]/40 hover:border-[#fae19c] text-white hover:text-[#fae19c] font-medium text-xs sm:text-sm px-5 py-3 rounded-full text-center cursor-pointer whitespace-nowrap"
              >
                Contact Office
              </button>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Lightbox Modal for High-Def Photo Inspection */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhotoId(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-[#08281d] rounded-2xl overflow-hidden border border-[#1b5640] shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#134937] text-white">
              <div className="flex items-center gap-2">
                <span className="text-[#fae19c] font-serif text-base font-semibold">
                  {activePhoto.title}
                </span>
                <span className="text-stone-400 text-xs hidden sm:inline">
                  • {activeLightboxIndex + 1} of {filteredItems.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activePhoto.imageSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-[#a4ccbd] hover:text-white hover:bg-[#124231] rounded-lg transition-colors"
                  title="Open original resolution image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setActivePhotoId(null)}
                  className="p-1.5 text-[#a4ccbd] hover:text-white hover:bg-[#124231] rounded-lg transition-colors cursor-pointer"
                  aria-label="Close photo preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photo Center Display with navigation arrows */}
            <div className="relative flex-1 bg-black/50 min-h-[300px] sm:min-h-[480px] flex items-center justify-center p-4 overflow-hidden">
              <GalleryPhoto
                src={activePhoto.imageSrc}
                alt={activePhoto.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg select-none"
              />

              {/* Prev Button */}
              {filteredItems.length > 1 && (
                <button
                  onClick={handlePreviousPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer backdrop-blur-xs border border-white/10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next Button */}
              {filteredItems.length > 1 && (
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer backdrop-blur-xs border border-white/10"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Caption & Scripture Footer */}
            <div className="px-6 py-4 bg-[#0a3124] border-t border-[#134937] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="max-w-xl">
                <p className="text-[#d6e5de] leading-relaxed">
                  {activePhoto.description}
                </p>
                {activePhoto.date && (
                  <span className="text-stone-400 text-[11px] block mt-1">
                    Occasion: {activePhoto.date}
                  </span>
                )}
              </div>
              {activePhoto.scripture && (
                <div className="bg-[#124231] border border-[#fae19c]/30 text-[#fae19c] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-[#fae19c]" />
                  <span>{activePhoto.scripture}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
