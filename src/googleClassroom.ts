import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  creationTime?: string;
  updateTime?: string;
  enrollmentCode?: string;
  courseState?: string;
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
}

export interface ClassroomCourseWork {
  id?: string;
  courseId: string;
  title: string;
  description?: string;
  materials?: any[];
  state?: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  maxPoints?: number;
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
}

export interface ClassroomAnnouncement {
  id?: string;
  courseId: string;
  text: string;
  state?: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
}

export interface ClassroomStudent {
  courseId: string;
  userId: string;
  profile?: {
    id: string;
    name?: {
      fullName?: string;
    };
    emailAddress?: string;
    photoUrl?: string;
  };
}

// Google Auth Provider configured with Google Classroom scopes
export const classroomAuthProvider = new GoogleAuthProvider();
classroomAuthProvider.addScope('https://www.googleapis.com/auth/classroom.courses');
classroomAuthProvider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
classroomAuthProvider.addScope('https://www.googleapis.com/auth/classroom.coursework.me');
classroomAuthProvider.addScope('https://www.googleapis.com/auth/classroom.coursework.students');
classroomAuthProvider.addScope('https://www.googleapis.com/auth/classroom.announcements');
classroomAuthProvider.addScope('https://www.googleapis.com/auth/classroom.rosters');
classroomAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

let cachedClassroomAccessToken: string | null = null;

export const setClassroomAccessToken = (token: string | null) => {
  cachedClassroomAccessToken = token;
};

export const getClassroomAccessToken = (): string | null => {
  return cachedClassroomAccessToken;
};

/**
 * Sign in user with Google to grant Google Classroom permissions
 */
export const signInForGoogleClassroom = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, classroomAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Classroom.');
    }
    cachedClassroomAccessToken = credential.accessToken;
    return cachedClassroomAccessToken;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('La ventana de autenticación fue cerrada por el usuario.');
    }
    console.error('Error al iniciar sesión con Google Classroom:', error);
    throw error;
  }
};

/**
 * Fetch courses from Google Classroom
 */
export const listClassroomCourses = async (token?: string): Promise<ClassroomCourse[]> => {
  const activeToken = token || cachedClassroomAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Classroom.');
  }

  const response = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al obtener clases de Google Classroom');
  }

  const data = await response.json();
  return data.courses || [];
};

/**
 * Fetch CourseWork items for a course
 */
export const getClassroomCourseWork = async (courseId: string, token?: string): Promise<ClassroomCourseWork[]> => {
  const activeToken = token || cachedClassroomAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Classroom.');
  }

  const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al obtener tareas de Google Classroom');
  }

  const data = await response.json();
  return data.courseWork || [];
};

/**
 * Fetch Announcements for a course
 */
export const getClassroomAnnouncements = async (courseId: string, token?: string): Promise<ClassroomAnnouncement[]> => {
  const activeToken = token || cachedClassroomAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Classroom.');
  }

  const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements`, {
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al obtener anuncios de Google Classroom');
  }

  const data = await response.json();
  return data.announcements || [];
};

/**
 * Fetch Students roster for a course
 */
export const getClassroomStudents = async (courseId: string, token?: string): Promise<ClassroomStudent[]> => {
  const activeToken = token || cachedClassroomAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Classroom.');
  }

  const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/students`, {
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al obtener estudiantes de Google Classroom');
  }

  const data = await response.json();
  return data.students || [];
};

/**
 * Create a new course in Google Classroom
 */
export const createClassroomCourse = async (
  courseData: { name: string; section?: string; descriptionHeading?: string; description?: string },
  token?: string
): Promise<ClassroomCourse> => {
  const activeToken = token || cachedClassroomAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Classroom.');
  }

  const response = await fetch('https://classroom.googleapis.com/v1/courses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: courseData.name,
      section: courseData.section || 'Waack On Academy',
      descriptionHeading: courseData.descriptionHeading || 'Curso de Waacking & Expresión Corporal',
      description: courseData.description || 'Sincronizado desde la plataforma Waack On Academy.',
      ownerId: 'me',
      courseState: 'ACTIVE'
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al crear la clase en Google Classroom');
  }

  return await response.json();
};

/**
 * Create a new CourseWork item in Google Classroom
 */
export const createClassroomCourseWork = async (
  courseId: string,
  workData: { title: string; description?: string; maxPoints?: number; workType?: 'ASSIGNMENT' },
  token?: string
): Promise<ClassroomCourseWork> => {
  const activeToken = token || cachedClassroomAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Classroom.');
  }

  const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: workData.title,
      description: workData.description || 'Tarea asignada desde Waack On Platform.',
      workType: workData.workType || 'ASSIGNMENT',
      state: 'PUBLISHED',
      maxPoints: workData.maxPoints || 100
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al crear la tarea en Google Classroom');
  }

  return await response.json();
};

/**
 * Create a new Announcement in Google Classroom
 */
export const createClassroomAnnouncement = async (
  courseId: string,
  text: string,
  token?: string
): Promise<ClassroomAnnouncement> => {
  const activeToken = token || cachedClassroomAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Classroom.');
  }

  const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      state: 'PUBLISHED'
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al publicar anuncio en Google Classroom');
  }

  return await response.json();
};
