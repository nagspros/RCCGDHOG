import type { SiteLink } from './heroSlides';

export const galleryFieldTypes = {
  text: 'Short text',
  textarea: 'Long text',
  email: 'Email',
  tel: 'Phone',
  number: 'Number',
  date: 'Date',
  select: 'Dropdown',
  radio: 'Single choice',
  checkbox: 'Checkbox',
} as const;

export type GalleryField = {
  id: string;
  label: string;
  kind: keyof typeof galleryFieldTypes;
  required: boolean;
  options: string[];
};

export type GalleryForm = {
  title: string;
  description: string;
  submitLabel: string;
  fields: GalleryField[];
  revision?: string;
};

export type GalleryEngagement = {
  published: boolean;
  links: SiteLink[];
  form: GalleryForm | null;
};
