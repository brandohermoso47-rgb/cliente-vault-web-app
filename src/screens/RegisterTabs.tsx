import { S } from './authStyles';

export type RegView = 'register' | 'registerInstructor' | 'registerStudio';

const TABS: { view: RegView; label: string }[] = [
  { view: 'register', label: 'Usuario' },
  { view: 'registerInstructor', label: 'Instructor/a' },
  { view: 'registerStudio', label: 'Estudio o academia' },
];

// Selector de tipo de cuenta, visible en los tres formularios de registro.
// Quien ya tiene sesión solo puede solicitar instructor o estudio (no vuelve a crear un usuario).
export default function RegisterTabs({ active, go, signedIn = false }: { active: RegView; go: (view: string) => void; signedIn?: boolean }) {
  return (
    <div style={S.seg} role="tablist">
      {TABS.filter((t) => !(signedIn && t.view === 'register')).map((t) => (
        <div key={t.view} role="tab" aria-selected={t.view === active} style={S.segBtn(t.view === active)} onClick={() => t.view !== active && go(t.view)}>{t.label}</div>
      ))}
    </div>
  );
}
