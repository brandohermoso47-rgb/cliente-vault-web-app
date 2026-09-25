import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  IClass,
  IStudent,
  IClassEnrollment,
  IStudentPlan,
  IClassGroup,
  IFinances,
  ICourse,
  IDocument,
  IPodcast,
  IAnnouncement,
} from '../types/instructor';

// ==================== CLASSES (CLASES) ====================

export function subscribeInstructorClasses(
  uid: string,
  callback: (classes: IClass[]) => void
) {
  const q = query(
    collection(db, `users/${uid}/instructorData/classes`),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const classes = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as IClass[];
      callback(classes);
    },
    (err) => {
      console.error('Error loading classes:', err);
      callback([]);
    }
  );
}

export async function createClass(
  uid: string,
  data: Partial<IClass>
): Promise<string> {
  if (!data.title?.trim()) throw new Error('Título requerido');
  if (!data.schedule?.day) throw new Error('Día de semana requerido');
  if ((data.capacity || 0) < 1) throw new Error('Capacidad debe ser ≥ 1');

  const docRef = await addDoc(
    collection(db, `users/${uid}/instructorData/classes`),
    {
      ...data,
      enrolled: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function updateClass(
  uid: string,
  classId: string,
  updates: Partial<IClass>
): Promise<void> {
  await updateDoc(
    doc(db, `users/${uid}/instructorData/classes`, classId),
    {
      ...updates,
      updatedAt: serverTimestamp(),
    }
  );
}

export async function deleteClass(uid: string, classId: string): Promise<void> {
  await deleteDoc(doc(db, `users/${uid}/instructorData/classes`, classId));
}

// ==================== STUDENTS (ALUMNOS) ====================

export function subscribeInstructorStudents(
  uid: string,
  callback: (students: IStudent[]) => void
) {
  const q = query(
    collection(db, `users/${uid}/instructorData/students`),
    orderBy('joinedAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const students = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as IStudent[];
      callback(students);
    },
    (err) => {
      console.error('Error loading students:', err);
      callback([]);
    }
  );
}

export async function addStudentToInstructor(
  uid: string,
  studentData: Partial<IStudent>
): Promise<string> {
  if (!studentData.name?.trim()) throw new Error('Nombre requerido');
  if (!studentData.email?.trim()) throw new Error('Email requerido');

  const docRef = await addDoc(
    collection(db, `users/${uid}/instructorData/students`),
    {
      ...studentData,
      enrolledClasses: studentData.enrolledClasses || [],
      joinedAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function updateStudent(
  uid: string,
  studentId: string,
  updates: Partial<IStudent>
): Promise<void> {
  await updateDoc(
    doc(db, `users/${uid}/instructorData/students`, studentId),
    updates
  );
}

// ==================== CLASS ENROLLMENTS ====================

export function subscribeClassEnrollments(
  uid: string,
  classId: string,
  callback: (enrollments: IClassEnrollment[]) => void
) {
  const q = query(
    collection(db, `users/${uid}/instructorData/enrollments`),
    where('classId', '==', classId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const enrollments = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as IClassEnrollment[];
      callback(enrollments);
    },
    (err) => {
      console.error('Error loading enrollments:', err);
      callback([]);
    }
  );
}

export async function enrollStudent(
  uid: string,
  classId: string,
  studentId: string
): Promise<void> {
  await addDoc(collection(db, `users/${uid}/instructorData/enrollments`), {
    classId,
    studentId,
    status: 'active',
    progress: 0,
    enrolledAt: serverTimestamp(),
    lastAccessed: null,
  });
}

export async function updateStudentProgress(
  uid: string,
  enrollmentId: string,
  progress: number
): Promise<void> {
  await updateDoc(
    doc(db, `users/${uid}/instructorData/enrollments`, enrollmentId),
    { progress }
  );
}

// ==================== STUDENT PLANS (PLANES DE ESTUDIO) ====================

export function subscribeStudentPlan(
  uid: string,
  classId: string,
  studentId: string,
  callback: (plan: IStudentPlan | null) => void
) {
  const planId = `${classId}_${studentId}`;
  const docRef = doc(db, `users/${uid}/instructorData/curriculum`, planId);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({
          id: snap.id,
          ...snap.data(),
        } as IStudentPlan);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error('Error loading student plan:', err);
      callback(null);
    }
  );
}

export async function createStudentPlan(
  uid: string,
  classId: string,
  studentId: string,
  curriculum: any[] = []
): Promise<void> {
  const planId = `${classId}_${studentId}`;
  await updateDoc(doc(db, `users/${uid}/instructorData/curriculum`, planId), {
    classId,
    studentId,
    curriculum: curriculum || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch(() => {
    return addDoc(collection(db, `users/${uid}/instructorData/curriculum`), {
      id: planId,
      classId,
      studentId,
      curriculum: curriculum || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

// ==================== CLASS GROUPS (GRUPOS) ====================

export function subscribeClassGroups(
  uid: string,
  classId: string,
  callback: (groups: IClassGroup[]) => void
) {
  const q = query(
    collection(db, `users/${uid}/instructorData/groups`),
    where('classId', '==', classId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const groups = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as IClassGroup[];
      callback(groups);
    },
    (err) => {
      console.error('Error loading groups:', err);
      callback([]);
    }
  );
}

export async function createClassGroup(
  uid: string,
  classId: string,
  name: string,
  studentIds: string[] = []
): Promise<string> {
  if (!name.trim()) throw new Error('Nombre de grupo requerido');

  const docRef = await addDoc(
    collection(db, `users/${uid}/instructorData/groups`),
    {
      classId,
      name,
      studentIds,
      createdAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function updateClassGroup(
  uid: string,
  groupId: string,
  updates: Partial<IClassGroup>
): Promise<void> {
  await updateDoc(
    doc(db, `users/${uid}/instructorData/groups`, groupId),
    updates
  );
}

// ==================== FINANCES (FINANZAS) ====================

export function subscribeInstructorFinances(
  uid: string,
  callback: (finances: IFinances) => void
) {
  const docRef = doc(db, `users/${uid}/instructorData`, 'finances');

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as IFinances);
      } else {
        callback({});
      }
    },
    (err) => {
      console.error('Error loading finances:', err);
      callback({});
    }
  );
}

export async function updateFinances(
  uid: string,
  finances: Partial<IFinances>
): Promise<void> {
  await updateDoc(doc(db, `users/${uid}/instructorData`, 'finances'), {
    ...finances,
    updatedAt: serverTimestamp(),
  }).catch(() => {
    return addDoc(collection(db, `users/${uid}/instructorData`), {
      finances: {
        ...finances,
        updatedAt: serverTimestamp(),
      },
    });
  });
}

// ==================== COURSES (CURSOS) ====================

export function subscribeInstructorCourses(
  uid: string,
  callback: (courses: ICourse[]) => void
) {
  const q = query(
    collection(db, `users/${uid}/instructorData/courses`),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const courses = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ICourse[];
      callback(courses);
    },
    (err) => {
      console.error('Error loading courses:', err);
      callback([]);
    }
  );
}

export async function createCourse(
  uid: string,
  courseData: Partial<ICourse>
): Promise<string> {
  if (!courseData.title?.trim()) throw new Error('Título del curso requerido');

  const docRef = await addDoc(
    collection(db, `users/${uid}/instructorData/courses`),
    {
      ...courseData,
      lessons: courseData.lessons || [],
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function publishCourse(
  uid: string,
  courseId: string
): Promise<void> {
  await updateDoc(
    doc(db, `users/${uid}/instructorData/courses`, courseId),
    {
      status: 'published',
      updatedAt: serverTimestamp(),
    }
  );
}

// ==================== DOCUMENTS (DOCUMENTOS) ====================

export function subscribeInstructorDocuments(
  uid: string,
  callback: (documents: IDocument[]) => void
) {
  const q = query(
    collection(db, `users/${uid}/instructorData/documents`),
    orderBy('uploadedAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const documents = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as IDocument[];
      callback(documents);
    },
    (err) => {
      console.error('Error loading documents:', err);
      callback([]);
    }
  );
}

export async function uploadDocument(
  uid: string,
  docData: Partial<IDocument>
): Promise<string> {
  if (!docData.title?.trim()) throw new Error('Título requerido');
  if (!docData.url?.trim()) throw new Error('URL requerida');

  const docRef = await addDoc(
    collection(db, `users/${uid}/instructorData/documents`),
    {
      ...docData,
      sharedWith: docData.sharedWith || [],
      uploadedAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

// ==================== PODCASTS ====================

export function subscribeInstructorPodcasts(
  uid: string,
  callback: (podcasts: IPodcast[]) => void
) {
  const q = query(
    collection(db, `users/${uid}/instructorData/podcasts`),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const podcasts = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as IPodcast[];
      callback(podcasts);
    },
    (err) => {
      console.error('Error loading podcasts:', err);
      callback([]);
    }
  );
}

export async function createPodcast(
  uid: string,
  podcastData: Partial<IPodcast>
): Promise<string> {
  if (!podcastData.title?.trim()) throw new Error('Título requerido');

  const docRef = await addDoc(
    collection(db, `users/${uid}/instructorData/podcasts`),
    {
      ...podcastData,
      episodes: podcastData.episodes || [],
      createdAt: serverTimestamp(),
    }
  );
  return docRef.id;
}

// ==================== ANNOUNCEMENTS ====================

export function subscribeInstructorAnnouncements(
  uid: string,
  callback: (announcements: IAnnouncement[]) => void
) {
  const q = query(
    collection(db, `users/${uid}/instructorData/announcements`),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const announcements = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as IAnnouncement[];
      callback(announcements);
    },
    (err) => {
      console.error('Error loading announcements:', err);
      callback([]);
    }
  );
}

export async function createAnnouncement(
  uid: string,
  content: string,
  targetAudience: string[] = []
): Promise<string> {
  if (!content.trim()) throw new Error('Contenido requerido');

  const docRef = await addDoc(
    collection(db, `users/${uid}/instructorData/announcements`),
    {
      content,
      targetAudience,
      createdAt: serverTimestamp(),
    }
  );
  return docRef.id;
}
