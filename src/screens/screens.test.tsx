import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Privacy from './Privacy';
import Register from './Register';
import RegisterPro from './RegisterPro';
import RegisterTabs from './RegisterTabs';
import Terms from './Terms';

afterEach(cleanup);

// Cada campo del formulario es <label>Texto</label> seguido de su control.
const field = (label: string) => {
  const l = [...document.querySelectorAll('label')].find((x) => x.textContent === label);
  const el = l?.nextElementSibling as HTMLInputElement | undefined;
  if (!el) throw new Error('Campo no encontrado: ' + label);
  return el;
};
const type = (label: string, value: string) => fireEvent.change(field(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: /crear cuenta|enviar solicitud/i }));
const error = () => document.querySelector('form div[style*="rgb(255, 154, 122)"]')?.textContent ?? '';

describe('selector de tipo de cuenta', () => {
  it('muestra las tres opciones y marca la activa', () => {
    render(<RegisterTabs active="registerStudio" go={() => {}} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['Usuario', 'Instructor/a', 'Estudio o academia']);
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true']);
  });
  it('navega a la vista elegida y no repite la activa', () => {
    const go = vi.fn();
    render(<RegisterTabs active="register" go={go} />);
    fireEvent.click(screen.getByText('Usuario'));
    expect(go).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Instructor/a'));
    expect(go).toHaveBeenCalledWith('registerInstructor');
    fireEvent.click(screen.getByText('Estudio o academia'));
    expect(go).toHaveBeenCalledWith('registerStudio');
  });
});

describe('registro de usuario', () => {
  it('valida en orden y nunca envía con datos malos', () => {
    render(<Register go={() => {}} />);
    submit();
    expect(error()).toBe('Escribe tu nombre completo.');
    type('Nombre completo', 'Sara Molina');
    submit();
    expect(error()).toMatch(/usuario debe tener 3–20/);
    type('Usuario', 'sara.waack');
    fireEvent.change(document.querySelector('select')!, { target: { value: '' } });
    submit();
    expect(error()).toBe('Selecciona tu país.');
    fireEvent.change(document.querySelector('select')!, { target: { value: 'MX' } });
    type('Correo', 'no-es-correo');
    submit();
    expect(error()).toBe('Introduce un correo válido.');
    type('Correo', 'sara@waack-on.com');
    type('Contraseña', 'debil');
    submit();
    expect(error()).toMatch(/9 caracteres/);
    type('Contraseña', 'Waack#2026x');
    type('Repite la contraseña', 'otra');
    submit();
    expect(error()).toBe('Las contraseñas no coinciden.');
    type('Repite la contraseña', 'Waack#2026x');
    submit();
    expect(error()).toBe('Debes aceptar los términos de servicio y la política de privacidad.');
    fireEvent.click(document.querySelector('input[type=checkbox]')!);
    submit();
    // Todo válido: llega hasta la comprobación de Firebase (no configurado en pruebas) y no crea nada.
    expect(error()).toMatch(/Firebase no está configurado/);
  });

  it('el selector de país lista los países y enlaza la política de privacidad', () => {
    render(<Register go={() => {}} />);
    expect(document.querySelectorAll('select option').length).toBeGreaterThan(230);
    const link = screen.getByText('Política de privacidad') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/privacidad');
    expect(link.getAttribute('rel')).toContain('noopener');
    const terms = screen.getByText('Términos de servicio') as HTMLAnchorElement;
    expect(terms.getAttribute('href')).toBe('/terminos');
    expect(terms.getAttribute('rel')).toContain('noopener');
  });

  it('las contraseñas nunca se muestran en claro', () => {
    render(<Register go={() => {}} />);
    expect(document.querySelectorAll('input[type=password]').length).toBe(2);
  });
});

describe('registro de instructor y de estudio o academia', () => {
  it('instructor: pide nombre artístico y no pide persona de contacto', () => {
    render(<RegisterPro kind="instructor" go={() => {}} />);
    expect(screen.getByRole('heading').textContent).toBe('Registro de instructor/a');
    expect(screen.getByText('Nombre artístico')).toBeTruthy();
    expect(screen.queryByText('Persona de contacto')).toBeNull();
  });
  it('estudio o academia: pide nombre del estudio y persona de contacto', () => {
    render(<RegisterPro kind="estudio" go={() => {}} />);
    expect(screen.getByRole('heading').textContent).toBe('Registro de estudio o academia');
    expect(screen.getByText('Nombre del estudio o academia')).toBeTruthy();
    expect(screen.getByText('Persona de contacto')).toBeTruthy();
  });
  it('valida antes de enviar (nombre, país/ciudad, estilos, descripción mínima, política)', () => {
    render(<RegisterPro kind="estudio" go={() => {}} />);
    submit();
    expect(error()).toBe('Escribe el nombre del estudio o academia.');
    type('Nombre del estudio o academia', 'Waack Academy');
    submit();
    expect(error()).toBe('Escribe el nombre de la persona de contacto.');
    type('Persona de contacto', 'Ana Ruiz');
    type('Correo', 'ana@academy.com');
    type('Contraseña', 'Waack#2026x');
    type('Repite la contraseña', 'Waack#2026x');
    fireEvent.change(document.querySelector('select')!, { target: { value: '' } });
    submit();
    expect(error()).toBe('Indica tu país y ciudad.');
    fireEvent.change(document.querySelector('select')!, { target: { value: 'MX' } });
    type('Ciudad', 'CDMX');
    submit();
    expect(error()).toBe('Indica tus especialidades o estilos.');
    type('Especialidades / estilos', 'Waacking');
    type('Sobre el estudio o academia', 'corta');
    submit();
    expect(error()).toMatch(/mínimo 20 caracteres/);
    type('Sobre el estudio o academia', 'Academia de baile con diez años de experiencia.');
    submit();
    expect(error()).toBe('Debes aceptar los términos de servicio y la política de privacidad.');
  });
});

describe('política de privacidad', () => {
  it('se muestra completa en español, sin marcas de formato sin resolver', () => {
    window.history.replaceState(null, '', '/privacidad?lang=es'); // jsdom trae inglés por defecto
    render(<Privacy />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Política de privacidad');
    expect(document.querySelectorAll('section').length).toBe(12);
    expect(document.body.textContent).not.toMatch(/\*\*|\{mail\}|\[\[/);
    expect(document.querySelector('a[href^="mailto:"]')).toBeTruthy();
  });
  it('cambia a inglés', async () => {
    window.history.replaceState(null, '', '/privacidad?lang=es');
    render(<Privacy />);
    fireEvent.click(screen.getByText('English'));
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Privacy Policy'));
    expect(document.querySelectorAll('section').length).toBe(12);
    expect(document.documentElement.lang).toBe('en');
  });
  it('los enlaces externos usan rel=noopener', () => {
    render(<Privacy />);
    document.querySelectorAll('a[target=_blank]').forEach((a) => expect(a.getAttribute('rel')).toContain('noopener'));
  });
});

describe('términos de servicio', () => {
  it('se muestran completos en español, sin marcas de formato sin resolver', () => {
    window.history.replaceState(null, '', '/terminos?lang=es');
    render(<Terms />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Términos de servicio');
    expect(document.querySelectorAll('section').length).toBe(18);
    expect(document.body.textContent).not.toMatch(/\*\*|\{mail\}|\[\[/);
    // temas imprescindibles para una plataforma de pagos con instructores
    for (const tema of ['Suscripciones, precios y pagos', 'Desistimiento y reembolsos', 'Instructores y estudios: cobros', 'Salud y actividad física', 'Ley aplicable']) {
      expect(document.body.textContent).toContain(tema);
    }
    expect(document.querySelector('a[href^="mailto:"]')).toBeTruthy();
  });
  it('cambia a inglés con las mismas secciones y enlaza la política de privacidad', async () => {
    window.history.replaceState(null, '', '/terminos?lang=es');
    render(<Terms />);
    fireEvent.click(screen.getByText('English'));
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Terms of Service'));
    expect(document.querySelectorAll('section').length).toBe(18);
    expect(document.querySelector('a[href^="/privacidad"]')).toBeTruthy();
    expect(document.querySelector('a[href^="/terminos"]')).toBeTruthy();
  });
  it('avisa de lo que debe completar la titularidad (entidad, comisión, ley aplicable)', () => {
    window.history.replaceState(null, '', '/terminos?lang=es');
    render(<Terms />);
    const pendientes = [...document.querySelectorAll('span')].filter((x) => /^\[/.test(x.textContent || '')).length;
    expect(pendientes).toBeGreaterThanOrEqual(6);
  });
});
