import React from 'react';
import { Music, ExternalLink } from 'lucide-react';

interface SoundCloudPlayerProps {
  // Puedes pasar la URL de tu perfil, de una playlist específica o de tus "Likes"
  playlistUrl?: string; 
  title?: string;
}

export default function SoundCloudPlayer({
  playlistUrl = "https://soundcloud.com/user-615971162", // Perfil oficial de SoundCloud
  title = "Perfil de SoundCloud"
}: SoundCloudPlayerProps) {

  // Codificamos la URL para el iframe de SoundCloud
  const encodedUrl = encodeURIComponent(playlistUrl);
  
  // Parámetros de personalización visual para perfiles/playlists (Color borgoña #C23E9E, modo oscuro)
  const widgetSrc = `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%239a2b3c&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;

  return (
    <div className="bg-[#121212] border border-[#262626] p-5 rounded-3xl shadow-2xl space-y-4 text-white">
      {/* Cabecera del reproductor */}
      <div className="flex items-center justify-between border-b border-[#262626] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FF5500]/20 border border-[#FF5500] rounded-xl flex items-center justify-center text-[#FF5500]">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-white tracking-wider">{title}</h3>
            <p className="text-[10px] font-mono text-[#8A8A8A]">SoundCloud Sync Activo</p>
          </div>
        </div>

        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-[#8A8A8A] hover:text-[#D9A9FF] flex items-center gap-1 transition-colors"
        >
          <span>Ver en SoundCloud</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Widget oficial embebido */}
      <div className="w-full rounded-2xl overflow-hidden border border-[#262626] bg-[#0A0A0A]">
        <iframe
          width="100%"
          height="300"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={widgetSrc}
          title="SoundCloud Player"
          className="w-full rounded-2xl"
        />
      </div>
    </div>
  );
}
