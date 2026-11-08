export function youtubeVideoId(value?: string) {
  if (!value) return null;
  const valid = /^[A-Za-z0-9_-]{11}$/;
  if (valid.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    const parts = url.pathname.split('/').filter(Boolean);
    let candidate: string | null = null;
    if (url.hostname === 'youtu.be' && parts.length === 1) candidate = parts[0];
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      if (url.pathname === '/watch') candidate = url.searchParams.get('v');
      if (parts.length === 2 && ['embed', 'live', 'shorts'].includes(parts[0])) candidate = parts[1];
    }
    return candidate && valid.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrl(value?: string) {
  const id = youtubeVideoId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

export function youtubeWatchUrl(value?: string) {
  const id = youtubeVideoId(value);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}
