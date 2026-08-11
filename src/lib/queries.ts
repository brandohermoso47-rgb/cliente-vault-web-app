import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import { fetchInstructorMetrics, fetchStudentRoster } from './api';

/**
 * Query key factory for clear cache management
 */
export const queryKeys = {
  instructorMetrics: (userId: string) => ['instructor', 'metrics', userId] as const,
  studentRoster: (userId: string) => ['instructor', 'students', userId] as const,
  dashboardStats: (userId: string) => ['dashboard', 'stats', userId] as const,
  communityChat: (channel: string) => ['community', 'messages', channel] as const,
};

/**
 * Hook to fetch instructor metrics with TanStack Query caching
 */
export function useInstructorMetrics(currentUser: User, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.instructorMetrics(currentUser.id),
    queryFn: () => fetchInstructorMetrics(currentUser),
    enabled: enabled && currentUser.role === 'instructor',
    staleTime: 1000 * 60 * 5, // Cache valid for 5 minutes
  });
}

/**
 * Hook to fetch student roster with TanStack Query caching
 */
export function useStudentRoster(currentUser: User, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.studentRoster(currentUser.id),
    queryFn: () => fetchStudentRoster(currentUser),
    enabled: enabled && currentUser.role === 'instructor',
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook for quick dashboard stats calculation caching
 */
export function useDashboardStats(user: User) {
  return useQuery({
    queryKey: queryKeys.dashboardStats(user.id),
    queryFn: async () => {
      // Calculate or fetch cached dashboard metrics
      const totalLessons = (user.completedLessons || []).length;
      const points = user.points || 0;
      const targetMinutes = user.targetMinutes || 30;
      
      return {
        totalLessons,
        points,
        targetMinutes,
        levelProgress: Math.min(100, Math.round((totalLessons / 15) * 100)),
        lastUpdated: new Date().toISOString(),
      };
    },
    staleTime: 1000 * 60 * 3, // 3 minutes stale time
  });
}
