import React from 'react';
import { Music, ExternalLink, Play, Radio, Youtube, Disc } from 'lucide-react';
import { MusicSource } from '../types';

interface MultiSourcePlayerProps {
  musicSource?: MusicSource | null;
  url?: string;
  provider?: 'soundcloud' | 'youtube' | 'spotify';
  title?: string;
  bpm?: number;
  className?: string;
  compact?: boolean;
}

export function parseMusicSource(rawUrl: string, defaultTitle?: string, defaultBpm?: number): MusicSource {
  const url = rawUrl.trim();
  let provider: 'soundcloud' | 'youtube' | 'spotify' = 'soundcloud';

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    provider = 'youtube';
  } else if (url.includes('spotify.com')) {
    provider = 'spotify';
  } else {
    provider = 'soundcloud';
  }

  return {
    provider,
    url,
    title: defaultTitle || 'Pista de Entrenamiento',
    bpm: defaultBpm
  };
}

export function getEmbedUrl(source: MusicSource): string {
  const url = source.url || '';

  if (source.provider === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    } else if (url.includes('shorts/')) {
      videoId = url.split('shorts/')[1]?.split('?')[0] || '';
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : url;
  }

  if (source.provider === 'spotify' || url.includes('spotify.com')) {
    if (url.includes('/embed/')) {
      return url;
    }
    // Convert https://open.spotify.com/playlist/XXX -> https://open.spotify.com/embed/playlist/XXX
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
  }

  // SoundCloud
  const encodedUrl = encodeURIComponent(url);
  return `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
}

export default function MultiSourcePlayer({
  musicSource,
  url,
  provider,
  title,
  bpm,
  className = '',
  compact = false
}: MultiSourcePlayerProps) {
  const activeSource: MusicSource = musicSource || parseMusicSource(url || 'https://soundcloud.com/user-615971162', title, bpm);
  if (provider) activeSource.provider = provider;
  if (title) activeSource.title = title;
  if (bpm) activeSource.bpm = bpm;

  const embedUrl = getEmbedUrl(activeSource);

  const getProviderConfig = (prov: 'soundcloud' | 'youtube' | 'spotify') => {
    switch (prov) {
      case 'youtube':
        return {
          name: 'YouTube',
          color: 'text-red-500',
          bg: 'bg-red-500/10 border-red-500/30',
          badgeBg: 'bg-red-600',
          icon: Youtube,
          height: compact ? '180' : '280'
        };
      case 'spotify':
        return {
          name: 'Spotify',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          badgeBg: 'bg-emerald-600',
          icon: Disc,
          height: compact ? '152' : '232'
        };
      case 'soundcloud':
      default:
        return {
          name: 'SoundCloud',
          color: 'text-orange-500',
          bg: 'bg-orange-500/10 border-orange-500/30',
          badgeBg: 'bg-orange-600',
          icon: Music,
          height: compact ? '160' : '220'
        };
    }
  };

  const pConfig = getProviderConfig(activeSource.provider);
  const IconComponent = pConfig.icon;

  return (
    <div className={`bg-[#0D0D12] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 text-white relative overflow-hidden ${className}`}>
      {/* Background Glow */}
      <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
        activeSource.provider === 'youtube' ? 'bg-red-600/15' : activeSource.provider === 'spotify' ? 'bg-emerald-600/15' : 'bg-orange-600/15'
      }`} />

      {/* Player Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${pConfig.bg} ${pConfig.color}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full text-white ${pConfig.badgeBg} uppercase tracking-wider`}>
                {pConfig.name}
              </span>
              {activeSource.bpm && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ⚡ {activeSource.bpm} BPM
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">{activeSource.title || 'Audio de Entrenamiento'}</h4>
          </div>
        </div>

        {activeSource.url && (
          <a
            href={activeSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-center text-xs font-mono text-slate-300 hover:text-[#E9C349] flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
          >
            <span>Abrir en {pConfig.name}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Embedded iFrame */}
      <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/60 relative z-10">
        <iframe
          width="100%"
          height={pConfig.height}
          scrolling="no"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          src={embedUrl}
          title={`${pConfig.name} Player`}
          className="w-full rounded-xl"
        />
      </div>
    </div>
  );
}
