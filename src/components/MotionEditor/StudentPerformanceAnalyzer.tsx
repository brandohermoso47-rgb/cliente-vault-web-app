/**
 * Student Performance Analyzer
 * Compares student pose against instructor reference using DTW
 * Provides detailed feedback and scoring
 */

import React, { useState, useRef } from 'react';
import { Play, Pause, Download, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';
import { comparePoseSequences, scoreStudentPerformance } from '../../lib/motionRecognition/dtw';
import { SmoothedLandmarks } from '../../types/motionRecognition';

interface StudentPerformanceAnalyzerProps {
  instructorVideoUrl: string;
  instructorPoses: SmoothedLandmarks[];
  studentVideoUrl: string;
  onAnalysisComplete?: (score: any) => void;
}

interface PerformanceScore {
  overallScore: number;
  formScore: number;
  timingScore: number;
  consistencyScore: number;
  feedback: string[];
  similarity: number;
  temporalAlignment: number;
}

export default function StudentPerformanceAnalyzer({
  instructorVideoUrl,
  instructorPoses,
  studentVideoUrl,
  onAnalysisComplete,
}: StudentPerformanceAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<PerformanceScore | null>(null);
  const [studentPoses, setStudentPoses] = useState<SmoothedLandmarks[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay'>('side-by-side');

  const instructorVideoRef = useRef<HTMLVideoElement>(null);
  const studentVideoRef = useRef<HTMLVideoElement>(null);

  const handleExtractPoses = async () => {
    setIsAnalyzing(true);
    try {
      // Extract poses from student video (would use pose detection)
      // For now, this is a placeholder
      const poses: SmoothedLandmarks[] = [];

      // Run DTW comparison
      const dtwResult = comparePoseSequences(instructorPoses, poses);
      const score = scoreStudentPerformance(instructorPoses, poses);

      const fullScore: PerformanceScore = {
        ...score,
        similarity: dtwResult.similarity,
        temporalAlignment: dtwResult.temporalAlignment,
      };

      setPerformanceScore(fullScore);
      setStudentPoses(poses);

      if (onAnalysisComplete) {
        onAnalysisComplete(fullScore);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Error during analysis: ' + (err as any).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 75) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 60) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Video Comparison */}
      <div className="bg-[#121212] border border-white/10 rounded-[24px] p-6">
        <div className="mb-4">
          <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Análisis de Forma (DTW Comparison)
          </h3>

          {/* Comparison Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setComparisonMode('side-by-side')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                comparisonMode === 'side-by-side'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              Lado a Lado
            </button>
            <button
              onClick={() => setComparisonMode('overlay')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                comparisonMode === 'overlay'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              Superpuesto
            </button>
          </div>
        </div>

        {/* Video Players */}
        <div className={`grid gap-4 mb-6 ${comparisonMode === 'side-by-side' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Instructor Video */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400">INSTRUCTOR</div>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={instructorVideoRef}
                src={instructorVideoUrl}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                ✓ Referencia
              </div>
            </div>
          </div>

          {/* Student Video */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400">ESTUDIANTE</div>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={studentVideoRef}
                src={studentVideoUrl}
                controls
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600/80 rounded text-xs text-white">
                Tu intento
              </div>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleExtractPoses}
          disabled={isAnalyzing || !studentVideoUrl}
          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              Analizar Forma Ahora
            </>
          )}
        </button>
      </div>

      {/* Performance Score Card */}
      {performanceScore && (
        <div className="space-y-4">
          {/* Overall Score */}
          <div className={`border rounded-[24px] p-8 text-center ${getScoreBgColor(performanceScore.overallScore)}`}>
            <div className="text-xs font-mono text-slate-400 mb-2">PUNTUACIÓN GENERAL</div>
            <div className={`text-6xl font-black ${getScoreColor(performanceScore.overallScore)}`}>
              {performanceScore.overallScore}
            </div>
            <div className="text-xs text-slate-300 mt-2">de 100</div>

            {/* Performance Level */}
            <div className="mt-4 px-3 py-1.5 rounded-full inline-block bg-black/30 text-xs font-bold">
              {performanceScore.overallScore >= 90
                ? '⭐⭐⭐ Excelente'
                : performanceScore.overallScore >= 75
                ? '⭐⭐ Muy Bueno'
                : performanceScore.overallScore >= 60
                ? '⭐ Bueno'
                : '⚠️ Necesita Mejora'}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            {/* Form Score */}
            <div className="bg-[#121212] border border-white/10 rounded-[16px] p-4">
              <div className="text-[10px] font-mono text-slate-400 mb-2 uppercase">Forma</div>
              <div className={`text-3xl font-black mb-2 ${getScoreColor(performanceScore.formScore)}`}>
                {performanceScore.formScore}
              </div>
              <div className="w-full bg-white/10 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${performanceScore.formScore}%` }}
                />
              </div>
            </div>

            {/* Timing Score */}
            <div className="bg-[#121212] border border-white/10 rounded-[16px] p-4">
              <div className="text-[10px] font-mono text-slate-400 mb-2 uppercase">Ritmo</div>
              <div className={`text-3xl font-black mb-2 ${getScoreColor(performanceScore.timingScore)}`}>
                {performanceScore.timingScore}
              </div>
              <div className="w-full bg-white/10 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all"
                  style={{ width: `${performanceScore.timingScore}%` }}
                />
              </div>
            </div>

            {/* Consistency Score */}
            <div className="bg-[#121212] border border-white/10 rounded-[16px] p-4">
              <div className="text-[10px] font-mono text-slate-400 mb-2 uppercase">Estabilidad</div>
              <div className={`text-3xl font-black mb-2 ${getScoreColor(performanceScore.consistencyScore)}`}>
                {performanceScore.consistencyScore}
              </div>
              <div className="w-full bg-white/10 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all"
                  style={{ width: `${performanceScore.consistencyScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-[#121212] border border-white/10 rounded-[24px] p-6 space-y-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              Feedback Personalizado
            </h4>
            <div className="space-y-2">
              {performanceScore.feedback.map((msg, idx) => (
                <div key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-lg mt-0.5">•</span>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#121212] border border-white/10 rounded-[16px] p-4 text-center">
              <div className="text-xs font-mono text-slate-400 mb-2">Similitud DTW</div>
              <div className="text-2xl font-black text-purple-400">
                {performanceScore.similarity.toFixed(1)}%
              </div>
            </div>
            <div className="bg-[#121212] border border-white/10 rounded-[16px] p-4 text-center">
              <div className="text-xs font-mono text-slate-400 mb-2">Alineación Temporal</div>
              <div className="text-2xl font-black text-pink-400">
                {performanceScore.temporalAlignment.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Download Report Button */}
          <button className="w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center gap-2 transition-all border border-white/10">
            <Download className="w-4 h-4" />
            Descargar Reporte de Análisis
          </button>
        </div>
      )}
    </div>
  );
}
