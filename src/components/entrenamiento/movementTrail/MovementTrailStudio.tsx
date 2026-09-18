import { useState } from 'react';
import { Camera, Library, ListMusic, Play } from 'lucide-react';
import type { Language } from '../../../lib/translations';
import type { MovementTrailTab } from './types';
import { comboStore } from './storage/comboStore';
import LiveTrailView from './LiveTrailView';
import FiguraGallery from './FiguraGallery';
import ComboBuilder from './ComboBuilder';
import ComboPractice from './ComboPractice';

export interface MovementTrailStudioProps {
  language: Language;
  onAddBonusPoints?: (amount: number) => void;
  onLogPractice?: (
    minutes: number,
    activityType: 'drill' | 'battle' | 'combo' | 'playlist' | 'sensorial',
    description: string,
    extra?: { bpm?: number }
  ) => void;
}

const TABS: { id: MovementTrailTab; icon: typeof Camera; es: string; en: string }[] = [
  { id: 'camara', icon: Camera, es: 'Cámara', en: 'Camera' },
  { id: 'galeria', icon: Library, es: 'Galería', en: 'Gallery' },
  { id: 'combos', icon: ListMusic, es: 'Combos', en: 'Combos' },
  { id: 'practica', icon: Play, es: 'Práctica', en: 'Practice' },
];

/**
 * Reconocimiento en tiempo real de manos y pose que dibuja las trayectorias
 * del movimiento en pantalla: grabar, editar (recorte/simetría), guardar
 * como "figura" y encadenar figuras en "combos" para practicar con metrónomo.
 */
export default function MovementTrailStudio({ language, onAddBonusPoints, onLogPractice }: MovementTrailStudioProps) {
  const isEs = language === 'es';
  const [tab, setTab] = useState<MovementTrailTab>('camara');
  const [practiceComboId, setPracticeComboId] = useState<string | null>(null);

  const goPractice = (comboId: string) => {
    setPracticeComboId(comboId);
    setTab('practica');
  };

  const savedCombos = tab === 'practica' && !practiceComboId ? comboStore.list() : [];

  return (
    <div className="flex w-full flex-col gap-6 text-on-surface bg-background p-6 rounded-3xl border border-tertiary/20 relative overflow-hidden font-body-md shadow-2xl">
      <div>
        <h3 className="font-display-lg text-base uppercase tracking-wider text-white">
          {isEs ? 'Estudio de trazos de movimiento' : 'Movement Trail Studio'}
        </h3>
        <p className="mt-1 text-xs text-[#8A8A8A]">
          {isEs
            ? 'La cámara reconoce tus manos y tu cuerpo, y dibuja las trayectorias de tus movimientos en tiempo real.'
            : 'The camera recognizes your hands and body, drawing your movement trails in real time.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#262626] pb-3">
        {TABS.map(({ id, icon: Icon, es, en }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`group flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-xl border px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              tab === id
                ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg'
                : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
            }`}
          >
            <Icon className="h-4 w-4 text-[#D9A9FF]" />
            {isEs ? es : en}
          </button>
        ))}
      </div>

      <div className="flex w-full flex-col items-start">
        {tab === 'camara' && <LiveTrailView language={language} />}
        {tab === 'galeria' && <FiguraGallery language={language} />}
        {tab === 'combos' && <ComboBuilder language={language} onPractice={goPractice} />}
        {tab === 'practica' &&
          (practiceComboId ? (
            <ComboPractice
              language={language}
              comboId={practiceComboId}
              onExit={() => setPracticeComboId(null)}
              onAddBonusPoints={onAddBonusPoints}
              onLogPractice={onLogPractice}
            />
          ) : savedCombos.length === 0 ? (
            <p className="max-w-md text-sm text-[#8A8A8A]">
              {isEs
                ? 'Crea un combo primero en la pestaña Combos para poder practicarlo.'
                : 'Create a combo first in the Combos tab to practice it.'}
            </p>
          ) : (
            <div className="flex w-full max-w-md flex-col gap-2">
              <p className="mb-1 text-sm text-[#8A8A8A]">{isEs ? 'Elige un combo para practicar:' : 'Choose a combo to practice:'}</p>
              {savedCombos.map((combo) => (
                <button
                  key={combo.id}
                  type="button"
                  onClick={() => goPractice(combo.id)}
                  className="rounded-xl border border-[#262626] bg-[#121212] px-4 py-3 text-left text-white/80 hover:bg-white/10"
                >
                  {combo.name}
                </button>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
