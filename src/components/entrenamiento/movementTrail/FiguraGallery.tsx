import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Language } from '../../../lib/translations';
import type { MovementFigure } from './types';
import { figuraStore } from './storage/figuraStore';
import FiguraThumbnail from './FiguraThumbnail';
import FiguraEditor from './FiguraEditor';

export interface FiguraGalleryProps {
  language: Language;
}

export default function FiguraGallery({ language }: FiguraGalleryProps) {
  const isEs = language === 'es';
  const [figures, setFigures] = useState<MovementFigure[]>([]);
  const [editing, setEditing] = useState<MovementFigure | null>(null);

  const reload = () => setFigures(figuraStore.list().sort((a, b) => b.updatedAt - a.updatedAt));

  useEffect(() => {
    reload();
  }, []);

  const handleDelete = (id: string) => {
    figuraStore.remove(id);
    reload();
  };

  const handleSaveEdit = (figure: MovementFigure) => {
    figuraStore.save(figure);
    setEditing(null);
    reload();
  };

  if (editing) {
    return (
      <FiguraEditor
        figure={editing}
        language={language}
        title={isEs ? 'Editar figura' : 'Edit figure'}
        onSave={handleSaveEdit}
        onCancel={() => setEditing(null)}
      />
    );
  }

  if (figures.length === 0) {
    return (
      <p className="max-w-md text-sm text-[#8A8A8A]">
        {isEs
          ? 'Aún no tienes figuras guardadas. Graba un movimiento desde la pestaña Cámara.'
          : "You don't have any saved figures yet. Record a movement from the Camera tab."}
      </p>
    );
  }

  return (
    <div className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
      {figures.map((figure) => (
        <div key={figure.id} className="flex flex-col gap-2 rounded-2xl border border-[#262626] bg-[#121212] p-3">
          <div className="aspect-[4/3] overflow-hidden rounded-xl">
            <FiguraThumbnail figure={figure} />
          </div>
          <span className="truncate text-sm text-white/80">{figure.name}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(figure)}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/10 py-1.5 text-xs text-white/80 hover:bg-white/20"
            >
              <Pencil className="h-3.5 w-3.5" /> {isEs ? 'Editar' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(figure.id)}
              className="flex items-center justify-center rounded-lg bg-rose-500/20 px-2 py-1.5 text-rose-300 hover:bg-rose-500/30"
              aria-label={isEs ? `Eliminar ${figure.name}` : `Delete ${figure.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
