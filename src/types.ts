/**
 * Types and interfaces for La Academia de Waacking
 */

export type UserRole = 
  | 'free_user'
  | 'vip_student'
  | 'academy'
  | 'instructor'
  // Legacy aliases for backward compatibility
  | 'student'
  | 'studio'
  | 'academia'
  | 'estudiante'
  | 'guest'
  | 'unassigned'
  | 'none';

export type PlanType = 'app_vip' | 'app_academy' | 'instructor_custom';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'cancelled';

export interface UserSubscription {
  id: string;
  userId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  trialEnd?: string;
  instructorId?: string; // For instructor_custom subscriptions (75/25 split)
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt?: string;
}

export type StudentSubscriptionTier = 'free' | 'basic_practice' | 'instructor_pass';

export interface InstructorPushPreference {
  instructorId: string;
  instructorName: string;
  enabled: boolean;
  announcements?: boolean;
  lessonAlerts?: boolean;
  feedbackAlerts?: boolean;
  liveSessionAlerts?: boolean;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys?: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  subscribedAt?: string;
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
  avatar: string;
  role?: UserRole;
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
  pushEnabled?: boolean;
  pushPermission?: 'granted' | 'denied' | 'default';
  pushEndpoint?: string;
  pushSubscription?: PushSubscriptionData;
  instructorPushPreferences?: InstructorPushPreference[];
  pushTopics?: {
    announcements?: boolean;
    feedback?: boolean;
    lives?: boolean;
    drills?: boolean;
  };
  points: number; // accumulated gamification points
  customAchievements?: CustomAchievement[];
  // Stripe & Hybrid Subscription Architecture fields
  stripe_customer_id?: string;
  stripe_account_id?: string; // Stripe Connect ID (instructors)
  is_connect_verified?: boolean; // Stripe Connect verification status
  subscription_status?: SubscriptionStatus;
  plan_type?: PlanType;
  current_period_end?: string;
  trial_end?: string;
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
  provider: 'soundcloud' | 'youtube' | 'spotify' | 'upload' | 'drive' | 'custom';
  url: string;
  bpm?: number;
  createdAt?: string;
  storagePath?: string;
  artist?: string;
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
  minutes?: number;
  durationMinutes?: number;
  activityType?: 'drill' | 'battle' | 'combo' | 'playlist' | 'sensorial' | string;
  description?: string;
  focusArea?: string;
  category?: Lesson['category'] | string;
  bpm?: number;
  bpmAverage?: number;
  caloriesBurned?: number;
  rpeScore?: number;
  notes?: string;
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
  category: 'fundamentos' | 'brazos' | 'postura' | 'musicalidad' | 'improvisacion' | 'caracter' | 'velocidad' | string;
  videoUrl: string; // youtube/vimeo placeholder embed
  completed: boolean;
  instructorId?: string;
  instructorName?: string;
  transcription?: string;
  musicSource?: MusicSource;
  style?: 'classic' | 'punking' | 'fast_waack' | 'posing' | 'soul_freestyle' | string;
  technique?: 'rolls' | 'poses_lines' | 'musicality' | 'posture' | 'drama' | 'speed' | 'footwork' | 'fundamentals' | string;
  difficulty?: 'principiante' | 'intermedio' | 'avanzado' | string;
  tags?: string[];
  bpm?: number;
}

export interface PlaylistItem {
  id: string;
  title: string;
  artist?: string;
  bpm?: number;
  duration?: string;
  type?: 'slow' | 'fast' | string;
  audioUrl?: string; // audio url or streaming link
  provider?: 'upload' | 'soundcloud' | 'spotify' | 'youtube' | 'drive' | 'custom' | string;
  userId?: string;
  storagePath?: string;
  category?: string;
  createdAt?: string;
  trackCount?: number;
  coverUrl?: string;
  platform?: string;
  sourceUrl?: string;
}

export interface Correction {
  id?: string;
  time?: string; // e.g. "0:45"
  timestamp?: string; // e.g. "00:12"
  text?: string;
  comment?: string;
  author?: string;
  role?: UserRole;
}

export interface FeedbackItem {
  id: string;
  studentId?: string;
  studentName: string;
  studentAvatar: string;
  videoTitle: string;
  videoUrl: string;
  description: string;
  date?: string;
  submittedDate?: string;
  corrections?: Correction[];
  completed?: boolean;
  status?: 'pending' | 'in_review' | 'completed' | string;
  instructorName?: string;
  score?: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  studentName?: string;
  title: string;
  body: string;
  type: 'feedback_reviewed' | 'battle_invite' | 'system' | 'live_stream' | 'new_course' | 'drill_reminder' | 'hydration_reminder' | 'announcement' | 'community';
  category?: 'live' | 'feedback' | 'course' | 'drill' | 'announcement' | 'hydration' | 'community' | 'system';
  feedbackId?: string;
  instructorName?: string;
  instructorAvatar?: string;
  actionTab?: string;
  actionUrl?: string;
  actionLabel?: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  read: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  startTime?: string;
  endTime?: string;
  duration?: string;
  category?: string;
  instructor: string;
  location?: string;
  description: string;
  rsvpCount?: number;
  rsvpByMe?: boolean;
  isCompleted?: boolean;
  meetUrl?: string;
}

export interface LessonResource {
  title: string;
  type: 'pdf' | 'audio' | 'link' | string;
  url: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  type?: string;
  isLocked: boolean;
  isCompleted: boolean;
  summary?: string;
  resources?: LessonResource[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorRole: string;
  instructorAvatar: string;
  thumbnail: string;
  category: string;
  level: string;
  totalDuration: string;
  enrolledCount: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  progress: number;
  lessonsCount: number;
  isPopular?: boolean;
  isNew?: boolean;
  lessons: CourseLesson[];
}

export interface CommunityPost {
  id: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  hasLiked: boolean;
  tags: string[];
}

export interface RankingUser {
  rank: number;
  name: string;
  avatar: string;
  level: string;
  score: number;
  hoursTrained: number;
  streakDays: number;
  badges: string[];
}

export interface LiveClass {
  id: string;
  title: string;
  instructor: string;
  instructorRole: string;
  instructorAvatar: string;
  date: string;
  time: string;
  thumbnail: string;
  status: 'upcoming' | 'live' | 'completed' | string;
  attendeesCount: number;
  meetUrl: string;
  description: string;
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
  thumbnail: string;
  host: string;
  date: string;
}

export interface Ebook {
  id: string;
  title: string;
  description: string;
  pages: number;
  downloadUrl: string;
  thumbnail: string;
  author: string;
  badge?: string;
}

export interface Reel {
  id: string;
  title: string;
  videoUrl: string;
  author: string;
  authorAvatar: string;
  likes: number;
  comments: number;
  musicTitle: string;
}

export interface MuscleRecommendation {
  id: string;
  muscleGroup: string;
  focusArea: string;
  status: 'fatigado' | 'optimo' | 'moderado' | string;
  recoveryScore: number;
  suggestedExercise: string;
  recommendedDuration: string;
}

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  isCompleted: boolean;
  dueDate: string;
}

export interface WaackPillar {
  id: string;
  name: string;
  shortDescription: string;
  iconName: string;
  level: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export interface DrillCombo {
  id: string;
  title: string;
  difficulty: string;
  defaultBpm: number;
  targetBeats: number;
  description: string;
}

export interface DramaPrompt {
  id: string;
  archetype: string;
  scenario: string;
  suggestedEmotion: string;
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

export interface DirectMessage {
  id: string;
  conversationId: string; // e.g. "dm_user1_user2"
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  receiverRole: UserRole;
  text: string;
  type?: 'text' | 'audio' | 'drill' | 'image' | 'battle_invite';
  audioDuration?: string;
  attachmentUrl?: string;
  drillDetails?: {
    title: string;
    bpm: number;
    category?: string;
  };
  createdAt: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  isRead?: boolean;
}

export interface WeeklyChallengeSubmission {
  id: string;
  challengeId: string;
  userId?: string;
  dancerName: string;
  dancerAvatar: string;
  dancerLevel: string;
  videoUrl: string;
  videoThumbnail?: string;
  title: string;
  notes?: string;
  submittedAt: string;
  votesCount: number;
  reactions: {
    fire: number;
    queen: number;
    precision: number;
    drama: number;
  };
  votedByMe?: boolean;
  myReaction?: 'fire' | 'queen' | 'precision' | 'drama';
  score?: number;
  instructorFeedback?: {
    author: string;
    avatar: string;
    comment: string;
    score: number;
    badges: string[];
  };
  isWinner?: boolean;
  rank?: number;
}

export interface WeeklyCommunityChallenge {
  id: string;
  weekNumber: number;
  title: string;
  subtitle: string;
  theme: string;
  category: string;
  description: string;
  coverImage: string;
  recommendedTrack: {
    title: string;
    artist: string;
    bpm: number;
    audioUrl?: string;
    spotifyUrl?: string;
  };
  criteria: Array<{
    title: string;
    weight: string;
    description: string;
  }>;
  judge: {
    name: string;
    role: string;
    avatar: string;
  };
  startDate: string;
  endDate: string;
  status: 'active' | 'voting' | 'completed';
  rewardXp: number;
  submissions: WeeklyChallengeSubmission[];
  winners?: Array<{
    rank: number;
    submissionId: string;
    dancerName: string;
    dancerAvatar: string;
    entryTitle: string;
    score: number;
    prizeTitle: string;
    badge: string;
    videoUrl: string;
  }>;
}

export interface PastChallengeWinner {
  id: string;
  weekNumber: number;
  title: string;
  theme: string;
  dateRange: string;
  winnerName: string;
  winnerAvatar: string;
  winnerLevel: string;
  entryTitle: string;
  videoUrl: string;
  score: number;
  votesCount: number;
  participantsCount: number;
  prizeAwarded: string;
}

export interface MessagingContact {
  id: string;
  name: string;
  displayName?: string;
  username?: string;
  avatar: string;
  role: UserRole;
  status?: 'online' | 'in_battle' | 'offline';
  category: 'instructor' | 'friend' | 'student';
  specialty?: string;
  level?: string;
  country?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}


