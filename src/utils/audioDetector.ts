// src/utils/audioDetector.ts

export type MusicProvider = 'soundcloud' | 'youtube' | 'spotify' | 'unknown';

export interface ParsedAudioSource {
  provider: MusicProvider;
  embedUrl: string;
  originalUrl: string;
}

export function parseMusicUrl(url: string): ParsedAudioSource {
  const cleanUrl = url.trim();

  if (!cleanUrl) {
    return {
      provider: 'unknown',
      embedUrl: '',
      originalUrl: ''
    };
  }

  // 1. YouTube (Videos o Playlists)
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    let videoId = '';
    if (cleanUrl.includes('youtu.be/')) {
      videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (cleanUrl.includes('v=')) {
      videoId = cleanUrl.split('v=')[1]?.split('&')[0] || '';
    } else if (cleanUrl.includes('embed/')) {
      videoId = cleanUrl.split('embed/')[1]?.split('?')[0] || '';
    } else if (cleanUrl.includes('shorts/')) {
      videoId = cleanUrl.split('shorts/')[1]?.split('?')[0] || '';
    }

    const embedUrl = videoId 
      ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1` 
      : cleanUrl;

    return {
      provider: 'youtube',
      embedUrl,
      originalUrl: cleanUrl
    };
  }

  // 2. Spotify (Tracks, Playlists o Álbumes)
  if (cleanUrl.includes('spotify.com')) {
    let embedUrl = cleanUrl;
    if (!cleanUrl.includes('/embed/')) {
      embedUrl = cleanUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
    }
    return {
      provider: 'spotify',
      embedUrl: `${embedUrl}?utm_source=generator&theme=0`,
      originalUrl: cleanUrl
    };
  }

  // 3. SoundCloud (Tracks o Playlists)
  if (cleanUrl.includes('soundcloud.com')) {
    const encodedUrl = encodeURIComponent(cleanUrl);
    return {
      provider: 'soundcloud',
      embedUrl: `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%239a2b3c&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
      originalUrl: cleanUrl
    };
  }

  return {
    provider: 'unknown',
    embedUrl: '',
    originalUrl: cleanUrl
  };
}
