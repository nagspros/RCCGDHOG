import { CHURCH_INFO } from './churchData';
import type { GalleryItem } from './galleryData';

export type SiteLink = { label: string; url: string };

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  showText?: boolean;
  imageFit?: 'contain' | 'cover';
  imageSrc: string;
  videoSrc: string;
  primaryButton: SiteLink;
  secondaryButton: SiteLink;
  published: boolean;
};

export const ABOUT_CHURCH_IMAGE = '/assets/extracted/church_building.jpg';
export const LIFE_SECTION_ID = 'home-church-life';

export function lifePhotos(gallery: GalleryItem[]) {
  return gallery.slice(0, 4);
}

export function defaultHeroSlides(photos: GalleryItem[]): HeroSlide[] {
  const visit = { label: 'Plan a Visit', url: '/visit' };
  const life = { label: 'Life at DHOG', url: `#${LIFE_SECTION_ID}` };
  return [
    {
      id: 'worship', title: `${CHURCH_INFO.heroHeadingLine1}\n${CHURCH_INFO.heroHeadingLine2}`,
      subtitle: CHURCH_INFO.tagline, showText: true, imageSrc: '/assets/extracted/hero_worship.jpg',
      videoSrc: '/assets/hero/worship.mp4', primaryButton: visit, secondaryButton: { label: 'Watch Online', url: '/watch' },
      published: true,
    },
    {
      id: 'church', title: 'About DHOG', subtitle: 'Meet our church family in Newark, New Jersey.',
      showText: false, imageFit: 'cover', imageSrc: ABOUT_CHURCH_IMAGE, videoSrc: '',
      primaryButton: visit, secondaryButton: life, published: true,
    },
    ...photos.map<HeroSlide>(photo => ({
      id: `life-${photo.id}`, title: photo.title, subtitle: photo.description, imageSrc: photo.imageSrc,
      showText: false, imageFit: photo.id === 'g-choir-1' ? 'cover' : 'contain',
      videoSrc: '', primaryButton: visit, secondaryButton: life, published: true,
    })),
  ];
}
