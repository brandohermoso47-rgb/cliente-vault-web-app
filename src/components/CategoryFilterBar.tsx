import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Zap, 
  Layers, 
  Compass, 
  Music, 
  ShieldCheck, 
  Target, 
  RotateCw, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Search, 
  X, 
  Filter, 
  SlidersHorizontal,
  Gauge,
  Activity,
  Grid,
  LayoutList
} from 'lucide-react';
import { Lesson } from '../types';

export type WaackingStyleFilter = 'all' | 'classic' | 'punking' | 'fast_waack' | 'posing' | 'soul_freestyle';
export type WaackingTechniqueFilter = 'all' | 'rolls' | 'poses_lines' | 'musicality' | 'posture' | 'drama' | 'speed' | 'footwork' | 'fundamentals';
export type WaackingDifficultyFilter = 'all' | 'principiante' | 'intermedio' | 'avanzado';
export type WaackingCompletionFilter = 'all' | 'pending' | 'completed';
export type FilterDimensionTab = 'all' | 'style' | 'technique' | 'difficulty';

export interface FilterState {
  style: WaackingStyleFilter;
  technique: WaackingTechniqueFilter;
  difficulty: WaackingDifficultyFilter;
  completion: WaackingCompletionFilter;
  searchQuery: string;
}

interface CategoryFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalLessonsCount: number;
  filteredLessonsCount: number;
  activeDimensionTab: FilterDimensionTab;
  setActiveDimensionTab: (tab: FilterDimensionTab) => void;
  viewMode: 'catedras' | 'catalog';
  setViewMode: (mode: 'catedras' | 'catalog') => void;
}

export const STYLE_OPTIONS: { id: WaackingStyleFilter; label: string; shortLabel: string; icon: any; color: string; desc: string }[] = [
  { id: 'all', label: 'Todos los Estilos', shortLabel: 'Todos', icon: Sparkles, color: 'border-white/20 text-white', desc: 'Explora el repertorio completo de Waacking' },
  { id: 'classic', label: 'Classic LA 70s', shortLabel: 'Classic', icon: Music, color: 'border-amber-500/40 text-amber-300 bg-amber-500/10', desc: 'Roots Disco Underground, Club 70s y Soul Train' },
  { id: 'punking', label: 'Punking & Drama', shortLabel: 'Punking', icon: Flame, color: 'border-rose-500/40 text-rose-300 bg-rose-500/10', desc: 'Expresividad teatral, actuación dramática y cine mudo' },
  { id: 'fast_waack', label: 'Speed-Waack & Síncopas', shortLabel: 'Speed-Waack', icon: Zap, color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10', desc: 'Alta cadencia BPM, aceleración articular y doble tiempo' },
  { id: 'posing', label: 'Posing & High Fashion', shortLabel: 'Posing', icon: Layers, color: 'border-purple-500/40 text-purple-300 bg-purple-500/10', desc: 'Líneas geométricas, port de bras y congelados fotográficos' },
  { id: 'soul_freestyle', label: 'Soul & Freestyle', shortLabel: 'Freestyle', icon: Compass, color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10', desc: 'Improvisación orgánica, uso del espacio y cambios de nivel' },
];

export const TECHNIQUE_OPTIONS: { id: WaackingTechniqueFilter; label: string; shortLabel: string; icon: any; color: string; desc: string }[] = [
  { id: 'all', label: 'Todas las Técnicas', shortLabel: 'Todas', icon: SlidersHorizontal, color: 'border-white/20 text-white', desc: 'Todos los pilares biomecánicos y técnicos' },
  { id: 'rolls', label: 'Rolls & Overhead Loops', shortLabel: 'Rolls', icon: RotateCw, color: 'border-yellow-500/40 text-yellow-300 bg-yellow-500/10', desc: 'Rotación interna/externa de codo y círculos tras la nuca' },
  { id: 'poses_lines', label: 'Poses & Simetría Espacial', shortLabel: 'Poses', icon: Target, color: 'border-purple-500/40 text-purple-300 bg-purple-500/10', desc: 'Líneas limpias, proyección y congelados en el 7 u 8' },
  { id: 'musicality', label: 'Musicalidad & Conteo en 8s', shortLabel: 'Musicalidad', icon: Music, color: 'border-blue-500/40 text-blue-300 bg-blue-500/10', desc: 'Acentos en caja 2 y 4, contratiempos y síncopas disco' },
  { id: 'posture', label: 'Postura & Biomecánica Core', shortLabel: 'Postura', icon: ShieldCheck, color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10', desc: 'Alineación de columna, escápulas y protección articular' },
  { id: 'drama', label: 'Carácter & Intención Escénica', shortLabel: 'Carácter', icon: Flame, color: 'border-pink-500/40 text-pink-300 bg-pink-500/10', desc: 'Mirada expresiva, storytelling y personificación musical' },
  { id: 'speed', label: 'Velocidad & Resistencia', shortLabel: 'Velocidad', icon: Zap, color: 'border-red-500/40 text-red-300 bg-red-500/10', desc: 'Drills de alta intensidad y cadencia sobre +125 BPM' },
  { id: 'footwork', label: 'Footwork & Niveles', shortLabel: 'Footwork', icon: Activity, color: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10', desc: 'Desplazamientos tridimensionales y transiciones de nivel' },
  { id: 'fundamentals', label: 'Fundamentos & 5 Pilares', shortLabel: 'Fundamentos', icon: BookOpen, color: 'border-slate-400/40 text-slate-200 bg-slate-500/10', desc: 'Cimientos históricos, raíces y estructura básica del baile' },
];

export const DIFFICULTY_OPTIONS: { id: WaackingDifficultyFilter; label: string; shortLabel: string; levelNum: string; color: string; desc: string }[] = [
  { id: 'all', label: 'Todos los Niveles', shortLabel: 'Todos', levelNum: '1-3', color: 'border-white/20 text-white', desc: 'Desde iniciación hasta masterclass avanzada' },
  { id: 'principiante', label: 'Nivel 1 • Fundamentos & Base', shortLabel: 'Nivel 1 (Base)', levelNum: 'N1', color: 'border-amber-500/40 text-amber-300 bg-amber-500/10', desc: 'Iniciación postural, biomecánica segura y conteos rítmicos' },
  { id: 'intermedio', label: 'Nivel 2 • Intermedio & Dinámica', shortLabel: 'Nivel 2 (Intermedio)', levelNum: 'N2', color: 'border-purple-500/40 text-purple-300 bg-purple-500/10', desc: 'Freestyle, transiciones espaciales y carácter escénico' },
  { id: 'avanzado', label: 'Nivel 3 • Speed & Masterclass', shortLabel: 'Nivel 3 (Avanzado)', levelNum: 'N3', color: 'border-rose-500/40 text-rose-300 bg-rose-500/10', desc: 'Sprints de velocidad, cambios de tempo y musicalidad avanzada' },
];

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalLessonsCount,
  filteredLessonsCount,
  activeDimensionTab,
  setActiveDimensionTab,
  viewMode,
  setViewMode
}) => {
  const hasActiveFilters = 
    filters.style !== 'all' || 
    filters.technique !== 'all' || 
    filters.difficulty !== 'all' || 
    filters.completion !== 'all' || 
    filters.searchQuery.trim() !== '';

  const activeStyle = STYLE_OPTIONS.find(s => s.id === filters.style);
  const activeTechnique = TECHNIQUE_OPTIONS.find(t => t.id === filters.technique);
  const activeDifficulty = DIFFICULTY_OPTIONS.find(d => d.id === filters.difficulty);

  return (
    <div className="bg-[#120f1e] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-5 transition-all">
      {/* TOP ROW: CATEGORY SELECTOR HEADER, SEARCH BAR & VIEW SWITCHER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Title & Dimension Selector Tabs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E9C349]/20 border border-[#E9C349]/40 flex items-center justify-center text-[#E9C349] shrink-0">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                Selector de Categorías de Waacking
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-[#E9C349] border border-white/10">
                  {filteredLessonsCount} de {totalLessonsCount} lecciones
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Filtra el contenido formativo por estilo, técnica biomecánica o nivel de dificultad.
              </p>
            </div>
          </div>

          {/* Dimension Selector Tabs (Pills) */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => setActiveDimensionTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                activeDimensionTab === 'all'
                  ? 'bg-white text-black border-white shadow-lg'
                  : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Panel Completo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDimensionTab('style')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                activeDimensionTab === 'style'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                  : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Por Estilo</span>
              {filters.style !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveDimensionTab('technique')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                activeDimensionTab === 'technique'
                  ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20 font-black'
                  : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-purple-300" />
              <span>Por Técnica</span>
              {filters.technique !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveDimensionTab('difficulty')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                activeDimensionTab === 'difficulty'
                  ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20 font-black'
                  : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-rose-300" />
              <span>Por Nivel</span>
              {filters.difficulty !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-rose-300 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          
          {/* Live Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar clase, drill, BPM..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-8 py-2 bg-black/60 border border-white/10 focus:border-[#E9C349] rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle: Cátedras vs Catálogo Unificado */}
          <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('catedras')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'catedras'
                  ? 'bg-[#E9C349] text-black shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ver agrupado por Cátedras de Profesores"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Por Cátedra</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'catalog'
                  ? 'bg-[#E9C349] text-black shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ver Catálogo Unificado de Lecciones"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Catálogo Directo</span>
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC CATEGORY PILLS SECTION BASED ON SELECTED DIMENSION TAB */}
      
      {/* 1. ESTILOS DE WAACKING PILLS */}
      {(activeDimensionTab === 'all' || activeDimensionTab === 'style') && (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              Estilo de Waacking:
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {activeStyle?.desc}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
            {STYLE_OPTIONS.map((style) => {
              const isSelected = filters.style === style.id;
              const IconComponent = style.icon;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onFilterChange({ style: style.id })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/20 font-black scale-[1.02]'
                      : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-amber-400'}`} />
                  <span>{style.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TÉCNICAS & PILARES BIOMECÁNICOS PILLS */}
      {(activeDimensionTab === 'all' || activeDimensionTab === 'technique') && (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Técnica / Pilar Biomecánico:
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {activeTechnique?.desc}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
            {TECHNIQUE_OPTIONS.map((tech) => {
              const isSelected = filters.technique === tech.id;
              const IconComponent = tech.icon;
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => onFilterChange({ technique: tech.id })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-purple-500 text-white border-purple-300 shadow-lg shadow-purple-500/20 font-black scale-[1.02]'
                      : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-purple-400'}`} />
                  <span>{tech.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. NIVEL DE DIFICULTAD PILLS & COMPLETION STATUS */}
      {(activeDimensionTab === 'all' || activeDimensionTab === 'difficulty') && (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                Nivel de Dificultad:
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {activeDifficulty?.desc}
              </span>
            </div>

            {/* Completion Filter Quick Toggle */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[10px] font-mono text-slate-400">Estado:</span>
              <button
                type="button"
                onClick={() => onFilterChange({ completion: 'all' })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                  filters.completion === 'all'
                    ? 'bg-white/20 text-white border-white/40 font-black'
                    : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ completion: 'pending' })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                  filters.completion === 'pending'
                    ? 'bg-amber-500/30 text-amber-300 border-amber-500/50 font-black'
                    : 'bg-black/40 text-slate-400 border-white/10 hover:text-amber-300'
                }`}
              >
                <Circle className="w-2.5 h-2.5" /> Pendientes
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ completion: 'completed' })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                  filters.completion === 'completed'
                    ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50 font-black'
                    : 'bg-black/40 text-slate-400 border-white/10 hover:text-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-2.5 h-2.5" /> Completadas
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
            {DIFFICULTY_OPTIONS.map((diff) => {
              const isSelected = filters.difficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => onFilterChange({ difficulty: diff.id })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-300 shadow-lg shadow-rose-500/20 font-black scale-[1.02]'
                      : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-current font-black">
                    {diff.levelNum}
                  </span>
                  <span>{diff.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVE FILTERS SUMMARY CHIPS & CLEAR BUTTON */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 flex-wrap bg-black/30 p-3 rounded-2xl">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Filtros Activos:</span>

            {filters.style !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                <Flame className="w-3 h-3" />
                Estilo: {activeStyle?.shortLabel}
                <button 
                  type="button" 
                  onClick={() => onFilterChange({ style: 'all' })}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.technique !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-bold">
                <Target className="w-3 h-3" />
                Técnica: {activeTechnique?.shortLabel}
                <button 
                  type="button" 
                  onClick={() => onFilterChange({ technique: 'all' })}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.difficulty !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold">
                <Gauge className="w-3 h-3" />
                Nivel: {activeDifficulty?.shortLabel}
                <button 
                  type="button" 
                  onClick={() => onFilterChange({ difficulty: 'all' })}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.completion !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                {filters.completion === 'completed' ? 'Completadas' : 'Pendientes'}
                <button 
                  type="button" 
                  onClick={() => onFilterChange({ completion: 'all' })}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-slate-200 text-[11px] font-bold">
                <Search className="w-3 h-3 text-slate-400" />
                "{filters.searchQuery}"
                <button 
                  type="button" 
                  onClick={() => onFilterChange({ searchQuery: '' })}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all flex items-center gap-1 shrink-0"
          >
            <X className="w-3 h-3" /> Restablecer Filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryFilterBar;
