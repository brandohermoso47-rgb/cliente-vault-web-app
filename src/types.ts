/**
 * Types and interfaces for La Academia de Waacking
 */

export type UserRole = 'student' | 'instructor' | 'studio' | 'academia' | 'academy' | 'estudiante' | 'guest';

export type StudentSubscriptionTier = 'free' | 'basic_practice' | 'instructor_pass';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
  avatar: string;
  role: UserRole;
  status?: 'online' | 'in_battle' | 'offline';
  isOnline?: boolean;
  completedLessons: string[]; // lesson ids
  email?: string;
  nickname?: string;
  bio?: string;
  level?: string;
  instagram?: string;
  targetMinutes?: number;
  hydrationReminders?: boolean;
  lessonNotifications?: boolean;
  trainingPreferences?: {
    hydrationReminders?: boolean;
    lessonNotifications?: boolean;
  };
  points: number; // accumulated gamification points
  customAchievements?: CustomAchievement[];
  billingStatus?: 'active' | 'cancelled';
  subscriptionTier?: StudentSubscriptionTier;
  subscribedInstructorIds?: string[];
  instructorSubscriptionStatus?: 'active' | 'cancelled';
  monthlyPrice?: string;
  monthlyPriceUSD?: number;
  methodologyDescription?: string;
  associatedLabTools?: string[];
  isFeaturedInstructor?: boolean;
  featuredPlan?: 'monthly' | 'semi-annual' | 'annual';
  featuredExpiry?: string;
  weakAreas?: string[];
  onboardingPreferences?: {
    targetGoal?: string;
    preferredBpm?: string;
    lab?: string;
  };
  soundcloudProfileUrl?: string;
  connectedMusicSources?: {
    soundcloud?: boolean;
    spotify?: boolean;
    youtube?: boolean;
  };
}

export interface MusicSource {
  provider: 'soundcloud' | 'youtube' | 'spotify';
  url: string;
  title?: string;
  bpm?: number;
}

export interface UserPlaylist {
  id: string;
  userId: string;
  title: string;
  provider: 'soundcloud' | 'youtube' | 'spotify';
  url: string;
  bpm?: number;
  createdAt?: string;
}

export interface CustomAchievement {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  type: 'winner' | 'finalist' | 'participation' | 'milestone' | 'other';
  pointsReward?: number;
}

export interface PracticeLog {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  activityType: 'drill' | 'battle' | 'combo' | 'playlist' | 'sensorial';
  description: string;
  category?: Lesson['category'];
  bpm?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  authorAvatar?: string;
  authorRole?: string;
  category?: 'competencias' | 'sesiones' | 'clases' | 'comunicados' | 'general';
  important?: boolean;
  actionUrl?: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  date: string;
}

export interface Presentation {
  id: string;
  studentName: string;
  studentAvatar: string;
  text: string;
  videoUrl?: string;
  date: string;
  likes: number;
  comments: Comment[];
  isLikedByMe?: boolean;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  role: UserRole;
}

export interface IntensiveCourse {
  id: string;
  title: string;
  subtitle: string;
  durationWeeks: number;
  modulesCount: number;
  level: string;
  description: string;
  coverImage: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface CatedraMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'Guía Teórica' | 'Plantilla' | 'Mapa Mental';
  pages: number;
  fileSize: string;
  downloadUrl?: string;
  description: string;
}

export interface InstructorCatedra {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  specialty: string;
  isSubscribed: boolean;
  monthlyPrice?: string;
  monthlyPriceUSD?: number;
  methodologyDescription?: string;
  associatedLabTools?: string[];
  featuredColor: string;
  lessonsCount: number;
  courses: IntensiveCourse[];
  materials: CatedraMaterial[];
}

export interface Lesson {
  id: string;
  level: 1 | 2;
  title: string;
  description: string;
  duration: string;
  category: 'fundamentos' | 'brazos' | 'postura' | 'musicalidad' | 'improvisacion' | 'caracter' | 'velocidad';
  videoUrl: string; // youtube/vimeo placeholder embed
  completed: boolean;
  instructorId?: string;
  instructorName?: string;
  transcription?: string;
  musicSource?: MusicSource;
}

export interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: string;
  type: 'slow' | 'fast';
  audioUrl: string; // mock audio url
}

export interface Correction {
  id: string;
  time: string; // e.g. "0:45"
  text: string;
  author: string;
  role: UserRole;
}

export interface FeedbackItem {
  id: string;
  studentId?: string;
  studentName: string;
  studentAvatar: string;
  videoTitle: string;
  videoUrl: string;
  description: string;
  date: string;
  corrections: Correction[];
  completed: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  studentName?: string;
  title: string;
  body: string;
  type: 'feedback_reviewed' | 'battle_invite' | 'system';
  feedbackId?: string;
  read: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: string;
  instructor: string;
  description: string;
  rsvpCount: number;
  rsvpByMe?: boolean;
  meetUrl?: string;
}

export interface SomaticDiaryEntry {
  id: string;
  date: string;
  poseClassification: string;
  confidence: number;
  feltSense: string;
  symmetry: number;
  fluidity: number;
  elbowAngle: number;
  torque: number;
  poseImage: string;
}

export interface FriendshipDoc {
  id: string;
  users: string[]; // [uid1, uid2]
  status: 'pending' | 'accepted' | 'declined';
  requestedBy: string;
  createdAt: string;
}

export interface BattleDoc {
  id: string;
  battleId?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  guestId: string;
  guestName: string;
  guestAvatar?: string;
  tool: 'live_battles';
  status: 'waiting' | 'active' | 'finished' | 'declined' | 'expired';
  createdAt: string;
  currentTrackId?: string;
  roundTimer?: number;
  activeRound?: number;
  hostScore?: number;
  guestScore?: number;
}

export interface PodcastEpisode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  artworkUrl?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  publishDate: string; // YYYY-MM-DD
  status: 'draft' | 'published';
  playsCount: number;
}

export interface PodcastShow {
  id: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  title: string;
  description: string;
  coverImage: string; // 1:1 image
  category?: string;
  status: 'active' | 'archived';
  episodes: PodcastEpisode[];
  createdAt: string;
}

export interface StudioInstructor {
  id: string;
  name: string;
  avatar: string;
  email: string;
  assignedClassesCount: number;
  specialty: string;
  status: 'active' | 'inactive';
  joinedDate?: string;
}

export interface StudioStudent {
  id: string;
  name: string;
  avatar: string;
  email: string;
  level: 'Nivel 1' | 'Nivel 2' | 'Avanzado';
  streakDays: number;
  subscriptionStatus: 'active' | 'pending' | 'inactive';
  joinedDate: string;
  lastActive?: string;
}

export interface StudioDocument {
  id: string;
  title: string;
  category: 'guia_pdf' | 'planificacion_bpm' | 'manual_tecnica';
  categoryLabel: string;
  format: string;
  description: string;
  fileUrl: string;
  fileName?: string;
  createdAt: string;
  downloadsCount: number;
  authorName?: string;
}

export interface Studio {
  id: string;
  name: string;
  logo: string;
  subscriptionPlan: 'Pro Academy' | 'Enterprise Studio' | 'Starter Studio';
  address?: string;
  phone?: string;
  instructors: StudioInstructor[];
  students: StudioStudent[];
  documents: StudioDocument[];
  scheduledClassesThisWeek?: number;
  attendanceRatePercent?: number;
}

