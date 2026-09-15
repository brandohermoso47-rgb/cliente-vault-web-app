import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function ViewSkeleton({ title }: { title?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-[#0A0A0A]">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#121212] border border-[#262626] flex items-center justify-center text-[#C23E9E] shadow-lg">
          <Sparkles className="w-8 h-8 text-[#D9A9FF] animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#C23E9E] border-2 border-[#0A0A0A] flex items-center justify-center">
          <Loader2 className="w-3 h-3 text-white animate-spin" />
        </div>
      </div>
      <h3 className="text-sm font-bold text-[#EDEFF4] uppercase tracking-widest font-mono mb-2">
        {title ? `CARGANDO ${title}...` : 'CARGANDO MÓDULO ACADÉMICO...'}
      </h3>
      <p className="text-xs text-[#8A8A8A] font-sans max-w-sm">
        Optimizando recursos y compilando somática de Waacking On Portal.
      </p>
      
      {/* Animated loading bar */}
      <div className="w-48 h-1 bg-[#1A1A1A] rounded-full overflow-hidden mt-6 border border-[#262626]">
        <div className="w-1/2 h-full bg-gradient-to-r from-[#C23E9E] via-[#D9A9FF] to-[#C23E9E] rounded-full animate-pulse" />
      </div>
    </div>
  );
}
