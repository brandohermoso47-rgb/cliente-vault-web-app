// Instructor Panel Types

export interface IClass {
  id: string;
  title: string;
  description?: string;
  schedule: {
    day: string;
    time: string;
    timezone: string;
  };
  capacity: number;
  enrolled: number;
  status: 'live' | 'scheduled' | 'completed';
  videoUrl?: string;
  videoDurationMs?: number;
  createdAt: any;
  updatedAt: any;
}

export interface IStudent {
  id: string;
  name: string;
  email: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  progress: number;
  enrolledClasses: string[];
  joinedAt: any;
}

export interface IClassEnrollment {
  id: string;
  classId: string;
  studentId: string;
  enrolledAt: any;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  lastAccessed: any;
}

export interface IStudentPlan {
  id: string;
  classId: string;
  studentId: string;
  curriculum: IPlanItem[];
  createdAt: any;
  updatedAt: any;
}

export interface IPlanItem {
  id: string;
  name: string;
  completed: boolean;
  dueDate?: any;
  description?: string;
}

export interface IClassGroup {
  id: string;
  classId: string;
  name: string;
  studentIds: string[];
  createdAt: any;
}

export interface IFinances {
  bankAccount?: {
    iban: string;
    accountHolder: string;
    bankName: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
  paymentSettings?: {
    commissionRate: number;
    payoutSchedule: 'weekly' | 'biweekly' | 'monthly';
    minPayoutThreshold: number;
  };
  earnings?: {
    totalEarnings: number;
    platformCommission: number;
    pendingPayout: number;
    nextPayoutDate?: any;
  };
  payoutHistory?: IPayoutRecord[];
  updatedAt?: any;
}

export interface IPayoutRecord {
  id: string;
  amount: number;
  date: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference: string;
}

export interface ICourse {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  lessons: ILesson[];
  createdAt: any;
  updatedAt: any;
}

export interface ILesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  order: number;
}

export interface IDocument {
  id: string;
  title: string;
  url: string;
  sharedWith: string[];
  uploadedAt: any;
  size: number;
}

export interface IPodcast {
  id: string;
  title: string;
  description: string;
  episodes: IEpisode[];
  createdAt: any;
}

export interface IEpisode {
  id: string;
  title: string;
  url: string;
  duration: number;
  releaseDate: any;
}

export interface IAnnouncement {
  id: string;
  content: string;
  targetAudience: string[];
  createdAt: any;
}
