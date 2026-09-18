import { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Play, Plus, Trash2, X } from 'lucide-react';
import type { Language } from '../../../lib/translations';
import type { MovementCombo, MovementFigure } from './types';
import { comboStore } from './storage/comboStore';
import { figuraStore } from './storage/figuraStore';
import FiguraThumbnail from './FiguraThumbnail';

export interface ComboBuilderProps {
  language: Language;
  onPractice: (comboId: string) => void;
}

export default function ComboBuilder({ language, onPractice }: ComboBuilderProps) {
  const isEs = language === 'es';
  const [combos, setCombos] = useState<MovementCombo[]>([]);
  const [figures, setFigures] = useState<MovementFigure[]>([]);
  const [draft, setDraft] = useState<MovementCombo | null>(null);

  const emptyCombo = (): MovementCombo => ({
    id: crypto.randomUUID(),
    name: `${isEs ? 'Combo' : 'Combo'} ${new Date().toLocaleDateString(isEs ? 'es-ES' : 'en-US')}`,
    figureIds: [],
    bpm: 90,
    beatsPerFigure: 4,
    loop: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const reload = () => {
    setCombos(comboStore.list().sort((a, b) => b.updatedAt - a.updatedAt));
    setFigures(figuraStore.list());
  };

  useEffect(() => {
    reload();
  }, []);

  const figureById = (id: string) => figures.find((f) => f.id === id);

  const addFigure = (figureId: string) => {
    if (!draft) return;
    setDraft({ ...draft, figureIds: [...draft.figureIds, figureId] });
  };

  const removeAt = (index: number) => {
    if (!draft) return;
    const next = [...draft.figureIds];
    next.splice(index, 1);
    setDraft({ ...draft, figureIds: next });
  };

  const moveAt = (index: number, dir: -1 | 1) => {
    if (!draft) return;
    const next = [...draft.figureIds];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setDraft({ ...draft, figureIds: next });
  };

  const saveDraft = () => {
    if (!draft) return;
    comboStore.save({ ...draft, updatedAt: Date.now() });
    setDraft(null);
    reload();
  };

  const deleteCombo = (id: string) => {
    comboStore.remove(id);
    reload();
  };

  if (draft) {
    return (
      <div className="flex w-full max-w-2xl flex-col gap-4">
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="rounded-xl border border-[#262626] bg-[#121212] px-4 py-2 text-white outline-none focus:border-[#D9A9FF]"
          placeholder={isEs ? 'Nombre del combo' : 'Combo name'}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-[#8A8A8A]">BPM</label>
            <input
              type="number"
              min={40}
              max={220}
              value={draft.bpm}
              onChange={(e) => setDraft({ ...draft, bpm: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-[#262626] bg-[#121212] px-3 py-2 font-mono text-white"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#8A8A8A]">
              {isEs ? 'Beats por figura' : 'Beats per figure'}
            </label>
            <input
              type="number"
              min={1}
              max={32}
              value={draft.beatsPerFigure}
              onChange={(e) => setDraft({ ...draft, beatsPerFigure: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-[#262626] bg-[#121212] px-3 py-2 font-mono text-white"
            />
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs uppercase tracking-wider text-[#8A8A8A]">{isEs ? 'Secuencia' : 'Sequence'}</h3>
          {draft.figureIds.length === 0 && (
            <p className="text-sm text-white/40">
              {isEs ? 'Añade figuras desde la lista de abajo.' : 'Add figures from the list below.'}
            </p>
          )}
          <div className="flex flex-col gap-2">
            {draft.figureIds.map((id, index) => {
              const fig = figureById(id);
              return (
                <div key={`${id}-${index}`} className="flex items-center gap-3 rounded-xl border border-[#262626] bg-[#121212] p-2">
                  <div className="h-12 w-16 overflow-hidden rounded-lg">
                    {fig ? (
                      <FiguraThumbnail figure={fig} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-rose-300">
                        {isEs ? 'eliminada' : 'deleted'}
                      </div>
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm text-white/80">
                    {fig?.name ?? (isEs ? 'Figura eliminada' : 'Deleted figure')}
                  </span>
                  <button type="button" onClick={() => moveAt(index, -1)} className="rounded p-1 hover:bg-white/10" aria-label="up">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => moveAt(index, 1)} className="rounded p-1 hover:bg-white/10" aria-label="down">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    className="rounded p-1 text-rose-300 hover:bg-rose-500/20"
                    aria-label="remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs uppercase tracking-wider text-[#8A8A8A]">
            {isEs ? 'Figuras guardadas' : 'Saved figures'}
          </h3>
          {figures.length === 0 && (
            <p className="text-sm text-white/40">
              {isEs ? 'Graba figuras primero desde la pestaña Cámara.' : 'Record figures first from the Camera tab.'}
            </p>
          )}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {figures.map((figure) => (
              <button
                key={figure.id}
                type="button"
                onClick={() => addFigure(figure.id)}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-[#262626]"
              >
                <FiguraThumbnail figure={figure} />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
                  <Plus className="h-5 w-5 text-white" />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#262626] bg-[#121212] px-4 py-3 font-mono text-xs uppercase tracking-wider text-[#8A8A8A] hover:text-white"
          >
            <X className="h-4 w-4" /> {isEs ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={saveDraft}
            disabled={draft.figureIds.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#C23E9E] px-4 py-3 font-mono text-xs uppercase tracking-wider text-white hover:bg-[#C23E9E]/80 disabled:opacity-40"
          >
            <Check className="h-4 w-4" /> {isEs ? 'Guardar combo' : 'Save combo'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <button
        type="button"
        onClick={() => setDraft(emptyCombo())}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#C23E9E] px-4 py-3 font-mono text-xs uppercase tracking-wider text-white hover:bg-[#C23E9E]/80"
      >
        <Plus className="h-4 w-4" /> {isEs ? 'Nuevo combo' : 'New combo'}
      </button>

      {combos.length === 0 && (
        <p className="text-center text-sm text-white/40">
          {isEs ? 'Aún no tienes combos guardados.' : "You don't have any saved combos yet."}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {combos.map((combo) => (
          <div key={combo.id} className="flex items-center gap-3 rounded-2xl border border-[#262626] bg-[#121212] p-3">
            <div className="flex-1">
              <p className="text-sm text-white/90">{combo.name}</p>
              <p className="font-mono text-xs text-white/40">
                {combo.figureIds.length} {isEs ? 'figuras' : 'figures'} · {combo.bpm} BPM
              </p>
            </div>
            <button
              type="button"
              onClick={() => onPractice(combo.id)}
              className="rounded-lg bg-emerald-500/20 p-2 text-emerald-300 hover:bg-emerald-500/30"
              aria-label={isEs ? 'Practicar' : 'Practice'}
            >
              <Play className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDraft(combo)}
              className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/20"
            >
              {isEs ? 'Editar' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={() => deleteCombo(combo.id)}
              className="rounded-lg bg-rose-500/20 p-2 text-rose-300 hover:bg-rose-500/30"
              aria-label={isEs ? 'Eliminar combo' : 'Delete combo'}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
