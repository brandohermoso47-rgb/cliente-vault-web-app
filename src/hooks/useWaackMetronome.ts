import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

export type Subdivision = '4n' | '8n' | '16n'; // Negras (Poses), Corcheas (Lines), Semicorcheas (Rolls)

export function useWaackMetronome(initialBpm: number = 125) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [subdivision, setSubdivision] = useState<Subdivision>('8n');
  const [currentBeat, setCurrentBeat] = useState<number>(0);

  const synthRef = useRef<Tone.MembraneSynth | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);

  // Inicializar sintetizador de percusión de bajo consumo
  useEffect(() => {
    synthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 }
    }).toDestination();

    return () => {
      synthRef.current?.dispose();
      loopRef.current?.dispose();
    };
  }, []);

  // Actualizar tempo dinámicamente sin detener la marcha
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  // Alternar Reproducción / Parada
  const togglePlay = async () => {
    // Requerido por los navegadores para autorizar el contexto de audio
    await Tone.start();

    if (isPlaying) {
      Tone.Transport.stop();
      if (loopRef.current) {
        loopRef.current.dispose();
        loopRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      let step = 0;

      loopRef.current = new Tone.Loop((time) => {
        const beatIndex = step % 4;
        
        // En Disco/Waacking, los acentos fuertes están en los tiempos 2/4 (Backbeat)
        const isBackbeat = beatIndex === 1 || beatIndex === 3;
        const note = isBackbeat ? 'C4' : 'C3'; 
        const volume = isBackbeat ? 1 : 0.6;

        synthRef.current?.triggerAttackRelease(note, '16n', time, volume);

        // Sincronizar estado visual de la UI de forma segura
        Tone.Draw.schedule(() => {
          setCurrentBeat(beatIndex + 1);
        }, time);

        step++;
      }, subdivision).start(0);

      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  return {
    isPlaying,
    bpm,
    setBpm,
    subdivision,
    setSubdivision,
    currentBeat,
    togglePlay
  };
}
