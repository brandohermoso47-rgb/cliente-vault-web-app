/**
 * Dynamic Time Warping (DTW) for pose comparison
 * Compares instructor and student pose sequences to measure form accuracy
 */

import { SmoothedLandmarks } from '../../types/motionRecognition';

interface DTWResult {
  distance: number;
  similarity: number; // 0-100, higher is better
  warpingPath: Array<[number, number]>;
  temporalAlignment: number; // % of frames aligned
}

interface PoseDistance {
  euclidean: number; // Joint-level distance
  angular: number; // Angle difference at key joints
  weighted: number; // Combined metric
}

/**
 * Calculate Euclidean distance between two poses
 */
function calculatePoseDistance(
  pose1: SmoothedLandmarks,
  pose2: SmoothedLandmarks
): number {
  let sumSquares = 0;
  const joints = Object.keys(pose1) as (keyof SmoothedLandmarks)[];

  for (const joint of joints) {
    if (
      typeof pose1[joint] === 'object' &&
      typeof pose2[joint] === 'object' &&
      'x' in pose1[joint] &&
      'y' in pose1[joint]
    ) {
      const p1 = pose1[joint] as { x: number; y: number };
      const p2 = pose2[joint] as { x: number; y: number };

      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      sumSquares += dx * dx + dy * dy;
    }
  }

  return Math.sqrt(sumSquares);
}

/**
 * DTW distance matrix computation
 */
function computeDTWMatrix(
  seq1: SmoothedLandmarks[],
  seq2: SmoothedLandmarks[]
): number[][] {
  const n = seq1.length;
  const m = seq2.length;
  const dtw: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(m + 1).fill(Infinity));

  dtw[0][0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = calculatePoseDistance(seq1[i - 1], seq2[j - 1]);
      dtw[i][j] = cost + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
    }
  }

  return dtw;
}

/**
 * Backtrack to find optimal warping path
 */
function getWarpingPath(dtw: number[][]): Array<[number, number]> {
  let i = dtw.length - 1;
  let j = dtw[0].length - 1;
  const path: Array<[number, number]> = [];

  while (i > 0 || j > 0) {
    path.push([i - 1, j - 1]);

    if (i === 0) {
      j--;
    } else if (j === 0) {
      i--;
    } else {
      const min = Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
      if (dtw[i - 1][j - 1] === min) {
        i--;
        j--;
      } else if (dtw[i - 1][j] === min) {
        i--;
      } else {
        j--;
      }
    }
  }

  return path.reverse();
}

/**
 * Main DTW comparison function
 * Returns similarity score and alignment information
 */
export function comparePoseSequences(
  instructorPoses: SmoothedLandmarks[],
  studentPoses: SmoothedLandmarks[]
): DTWResult {
  if (instructorPoses.length === 0 || studentPoses.length === 0) {
    return {
      distance: Infinity,
      similarity: 0,
      warpingPath: [],
      temporalAlignment: 0,
    };
  }

  // Compute DTW matrix
  const dtw = computeDTWMatrix(instructorPoses, studentPoses);
  const dtwDistance = dtw[instructorPoses.length][studentPoses.length];

  // Get warping path
  const warpingPath = getWarpingPath(dtw);

  // Normalize distance by sequence length
  const maxLength = Math.max(instructorPoses.length, studentPoses.length);
  const normalizedDistance = dtwDistance / maxLength;

  // Convert to similarity (0-100)
  // Assume max expected distance is ~500 pixels per frame
  const maxExpectedDistance = 500 * maxLength;
  const similarity = Math.max(0, 100 * (1 - normalizedDistance / 500));

  // Calculate temporal alignment percentage
  const alignedFrames = warpingPath.filter(([i, j]) => i === j).length;
  const temporalAlignment = (alignedFrames / warpingPath.length) * 100;

  return {
    distance: normalizedDistance,
    similarity,
    warpingPath,
    temporalAlignment,
  };
}

/**
 * Score student performance (0-100)
 * Based on form accuracy, timing, and consistency
 */
export function scoreStudentPerformance(
  instructorPoses: SmoothedLandmarks[],
  studentPoses: SmoothedLandmarks[],
  confidenceThreshold: number = 0.6
): {
  overallScore: number;
  formScore: number;
  timingScore: number;
  consistencyScore: number;
  feedback: string[];
} {
  const dtwResult = comparePoseSequences(instructorPoses, studentPoses);

  // Form score (40%): based on pose similarity
  const formScore = Math.min(100, dtwResult.similarity);

  // Timing score (30%): based on temporal alignment
  const timingScore = dtwResult.temporalAlignment;

  // Consistency score (30%): based on landmark confidence
  const avgConfidence = calculateAverageConfidence(studentPoses);
  const consistencyScore = Math.min(100, (avgConfidence / confidenceThreshold) * 100);

  // Weighted overall score
  const overallScore =
    formScore * 0.4 + timingScore * 0.3 + consistencyScore * 0.3;

  // Generate feedback
  const feedback = generateFeedback(formScore, timingScore, consistencyScore);

  return {
    overallScore: Math.round(overallScore),
    formScore: Math.round(formScore),
    timingScore: Math.round(timingScore),
    consistencyScore: Math.round(consistencyScore),
    feedback,
  };
}

/**
 * Calculate average confidence across all landmarks
 */
function calculateAverageConfidence(poses: SmoothedLandmarks[]): number {
  let totalConfidence = 0;
  let count = 0;

  for (const pose of poses) {
    const joints = Object.keys(pose) as (keyof SmoothedLandmarks)[];
    for (const joint of joints) {
      if (
        typeof pose[joint] === 'object' &&
        'confidence' in pose[joint]
      ) {
        totalConfidence += (pose[joint] as any).confidence || 0;
        count++;
      }
    }
  }

  return count > 0 ? totalConfidence / count : 0;
}

/**
 * Generate human-readable feedback based on scores
 */
function generateFeedback(
  formScore: number,
  timingScore: number,
  consistencyScore: number
): string[] {
  const feedback: string[] = [];

  // Form feedback
  if (formScore < 50) {
    feedback.push('❌ Forma: Necesitas practicar la posición de brazos y postura');
  } else if (formScore < 70) {
    feedback.push('⚠️ Forma: Casi bien, ajusta la alineación de hombros');
  } else if (formScore < 90) {
    feedback.push('✓ Forma: Buena técnica, solo detalles menores');
  } else {
    feedback.push('✓✓ Forma: Excelente imitación del movimiento');
  }

  // Timing feedback
  if (timingScore < 50) {
    feedback.push('❌ Ritmo: Estás muy desfasado, sigue el metrónomo');
  } else if (timingScore < 70) {
    feedback.push('⚠️ Ritmo: Casi sincronizado, acelera un poco');
  } else if (timingScore < 90) {
    feedback.push('✓ Ritmo: Buen timing, muy cercano');
  } else {
    feedback.push('✓✓ Ritmo: Perfectamente sincronizado');
  }

  // Consistency feedback
  if (consistencyScore < 50) {
    feedback.push('❌ Estabilidad: Los movimientos son muy erráticos');
  } else if (consistencyScore < 70) {
    feedback.push('⚠️ Estabilidad: Algunos temblores, mantén más control');
  } else if (consistencyScore < 90) {
    feedback.push('✓ Estabilidad: Movimientos controlados');
  } else {
    feedback.push('✓✓ Estabilidad: Movimientos muy fluidos y controlados');
  }

  return feedback;
}

/**
 * Compare multiple student attempts to track improvement
 */
export function trackProgressOverTime(
  instructorPoses: SmoothedLandmarks[],
  studentAttempts: SmoothedLandmarks[][]
): {
  scores: number[];
  improvement: number;
  trend: 'improving' | 'declining' | 'stable';
}[] {
  return studentAttempts.map((attempt, index) => {
    const score = scoreStudentPerformance(instructorPoses, attempt);
    const prevScore = index > 0
      ? scoreStudentPerformance(instructorPoses, studentAttempts[index - 1])
      : null;

    const improvement =
      prevScore ? score.overallScore - prevScore.overallScore : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (improvement > 5) trend = 'improving';
    else if (improvement < -5) trend = 'declining';

    return {
      scores: [
        score.formScore,
        score.timingScore,
        score.consistencyScore,
        score.overallScore,
      ],
      improvement,
      trend,
    };
  });
}
