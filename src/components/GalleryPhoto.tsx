import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export function GalleryPhoto({ src, alt, className, loading = 'lazy' }: {
  src: string;
  alt: string;
  className: string;
  loading?: 'eager' | 'lazy';
}) {
  const [failedSrc, setFailedSrc] = useState<string>();

  if (src === failedSrc) {
    return (
      <span className={`gallery-photo-fallback ${className}`}>
        <ImageOff aria-hidden="true" /> Photo unavailable
      </span>
    );
  }

  return <img src={src} alt={alt} className={className} loading={loading} onError={() => setFailedSrc(src)} />;
}
