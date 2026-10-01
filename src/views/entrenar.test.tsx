import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import EntrenarEstilos from './EntrenarEstilos';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const tab = (name: RegExp) => screen.getByRole('tab', { name });

describe('Entrenar con otros estilos', () => {
  it('abre en español con el título y las 7 pestañas', () => {
    render(<EntrenarEstilos />);
    expect(screen.getByText('Entrenar con otros estilos')).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(7);
    expect(tab(/autoevaluación/i)).toBeTruthy();
    expect(screen.getByText(/Combina tu otro estilo con Waacking/)).toBeTruthy();
  });

  it('cambia de idioma y lo recuerda', () => {
    const { unmount } = render(<EntrenarEstilos />);
    fireEvent.change(screen.getByLabelText(/idioma/i), { target: { value: 'ja' } });
    expect(screen.getByText('他のスタイルでトレーニング')).toBeTruthy();
    unmount();
    render(<EntrenarEstilos />);
    expect(screen.getByText('他のスタイルでトレーニング')).toBeTruthy();
  });

  it('en el estudio, tocar un paso llena el count seleccionado y avanza', () => {
    render(<EntrenarEstilos />);
    fireEvent.click(screen.getByRole('button', { name: '1.4' })); // count vacío de la frase de ejemplo
    fireEvent.click(screen.getByRole('button', { name: 'Golpe' })); // "Hit" en español
    expect(screen.getByRole('button', { name: '1.4' }).textContent).toContain('Golpe');
  });

  it('el mapa de estilos lista los 13 estilos y "Ensayar" vuelve al estudio con su tempo', () => {
    render(<EntrenarEstilos />);
    fireEvent.click(tab(/^estilos$/i));
    expect(screen.getAllByRole('button', { name: /ensayar en el estudio/i })).toHaveLength(13);
    fireEvent.click(screen.getAllByRole('button', { name: /ensayar en el estudio/i })[0]); // Breaking → 112 BPM
    expect(screen.getByText('112')).toBeTruthy();
  });

  it('el calentamiento muestra 7 ejercicios con enlace a YouTube', () => {
    render(<EntrenarEstilos />);
    fireEvent.click(tab(/calentamiento/i));
    const links = screen.getAllByRole('link', { name: /youtube/i });
    expect(links).toHaveLength(7);
    expect(links[0].getAttribute('href')).toMatch(/^https:\/\/www\.youtube\.com\/results\?/);
    expect(links[0].getAttribute('rel')).toContain('noopener');
  });

  it('la autoevaluación explica el error si el navegador no da cámara', async () => {
    render(<EntrenarEstilos />);
    fireEvent.click(tab(/autoevaluación/i));
    fireEvent.click(screen.getByRole('button', { name: /encender cámara/i }));
    expect(await screen.findByText(/No se pudo acceder a la cámara/)).toBeTruthy();
  });

  it('la autoevaluación guarda una evaluación en el historial', () => {
    render(<EntrenarEstilos />);
    fireEvent.click(tab(/autoevaluación/i));
    fireEvent.click(screen.getByRole('button', { name: /guardar evaluación/i }));
    expect(screen.getByText(/Promedio 3\.0/)).toBeTruthy();
  });

  it('el plan de clase suma 75 minutos y sube 5 al pulsar +', () => {
    render(<EntrenarEstilos />);
    fireEvent.click(tab(/plan de clase/i));
    expect(screen.getByText('75 min', { selector: 'b' })).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: /más 5 minutos/i })[0]);
    expect(screen.getByText('80 min', { selector: 'b' })).toBeTruthy();
  });

  it('el quiz hace 5 preguntas y muestra el resultado', () => {
    render(<EntrenarEstilos />);
    fireEvent.click(tab(/^quiz$/i));
    for (let i = 0; i < 5; i++) {
      const opts = screen.getAllByRole('button').filter((b) => b.closest('[role=tabpanel]') && !/siguiente|resultado/i.test(b.textContent ?? '') && (b as HTMLButtonElement).style.justifyContent === 'flex-start');
      expect(opts.length).toBe(4);
      fireEvent.click(opts[0]);
      fireEvent.click(screen.getByRole('button', { name: /siguiente|ver resultado/i }));
    }
    expect(screen.getByText(/\/5$/)).toBeTruthy();
  });
});
