import { User } from '../types';

/**
 * Helper to construct headers with RBAC credentials (x-user-role & x-user-id)
 */
function getAuthHeaders(currentUser?: User): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (currentUser) {
    headers['x-user-role'] = currentUser.role || 'student';
    headers['x-user-id'] = currentUser.id || 'anonymous';
  } else {
    headers['x-user-role'] = 'student';
    headers['x-user-id'] = 'anonymous';
  }

  return headers;
}

/**
 * Fetch protected instructor metrics from backend (RBAC protected)
 */
export async function fetchInstructorMetrics(currentUser: User) {
  const res = await fetch('/api/instructor/metrics', {
    method: 'GET',
    headers: getAuthHeaders(currentUser)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al obtener métricas del servidor (RBAC)');
  }
  return data.metrics;
}

/**
 * Fetch student roster (RBAC protected)
 */
export async function fetchStudentRoster(currentUser: User) {
  const res = await fetch('/api/instructor/students', {
    method: 'GET',
    headers: getAuthHeaders(currentUser)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error de acceso RBAC');
  }
  return data.students;
}

/**
 * Publish official announcement through backend (RBAC & Zod validated)
 */
export async function createBackendAnnouncement(
  currentUser: User,
  payload: {
    title: string;
    content: string;
    category?: string;
    isImportant?: boolean;
    actionUrl?: string;
    imageUrl?: string;
  }
) {
  const res = await fetch('/api/instructor/announcements', {
    method: 'POST',
    headers: getAuthHeaders(currentUser),
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      category: payload.category || 'comunicados',
      isImportant: payload.isImportant || false,
      actionUrl: payload.actionUrl || '',
      imageUrl: payload.imageUrl || '',
      authorUid: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role
    })
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.issues) {
      const msgs = data.issues.map((i: any) => `${i.field}: ${i.message}`).join(', ');
      throw new Error(`Validación de Zod fallida: ${msgs}`);
    }
    throw new Error(data.error || 'Error al publicar anuncio');
  }
  return data.announcement;
}

/**
 * Post message to Communication Hub (Zod validated)
 */
export async function postCommunityMessage(
  currentUser: User,
  payload: {
    content: string;
    channel?: 'lobby' | 'presentate' | 'anuncios';
    videoUrl?: string;
  }
) {
  const res = await fetch('/api/community/messages', {
    method: 'POST',
    headers: getAuthHeaders(currentUser),
    body: JSON.stringify({
      content: payload.content,
      channel: payload.channel || 'lobby',
      videoUrl: payload.videoUrl || '',
      authorUid: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role
    })
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.issues) {
      const msgs = data.issues.map((i: any) => `${i.field}: ${i.message}`).join(', ');
      throw new Error(`Validación de Zod fallida: ${msgs}`);
    }
    throw new Error(data.error || 'Error al enviar mensaje');
  }
  return data.chatMessage;
}

/**
 * Assign task to students (RBAC & Zod validated)
 */
export async function createInstructorTask(
  currentUser: User,
  payload: {
    title: string;
    description: string;
    category?: string;
    points?: number;
    deadline?: string;
  }
) {
  const res = await fetch('/api/instructor/tasks', {
    method: 'POST',
    headers: getAuthHeaders(currentUser),
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      category: payload.category || 'general',
      points: payload.points ?? 50,
      deadline: payload.deadline || ''
    })
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.issues) {
      const msgs = data.issues.map((i: any) => `${i.field}: ${i.message}`).join(', ');
      throw new Error(`Validación Zod fallida: ${msgs}`);
    }
    throw new Error(data.error || 'Error al crear tarea de instructor');
  }
  return data.task;
}

/**
 * Update user profile (Zod validated)
 */
export async function updateProfileBackend(
  currentUser: User,
  profileData: Partial<User>
) {
  const res = await fetch('/api/profile/update', {
    method: 'POST',
    headers: getAuthHeaders(currentUser),
    body: JSON.stringify({
      uid: currentUser.id,
      name: profileData.name || currentUser.name,
      role: profileData.role || currentUser.role,
      bio: profileData.bio || currentUser.bio || '',
      avatarUrl: profileData.avatar || currentUser.avatar || '',
      instagram: profileData.instagram || currentUser.instagram || '',
      tiktok: '',
      youtube: ''
    })
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.issues) {
      const msgs = data.issues.map((i: any) => `${i.field}: ${i.message}`).join(', ');
      throw new Error(`Validación Zod fallida: ${msgs}`);
    }
    throw new Error(data.error || 'Error al actualizar perfil');
  }
  return data.profile;
}

export interface OnboardingAnswersInput {
  studentName: string;
  generalGoals: string;
  waackingObjective: string;
  improvementAreas: string;
  currentChallenges: string;
  preferredLab?: string;
  bpmBand?: string;
}

/**
 * Generate AI Pedagogical Onboarding Plan (Zod validated + Gemini AI)
 */
export async function generateOnboardingPlanBackend(
  currentUser: User,
  answers: OnboardingAnswersInput
) {
  const res = await fetch('/api/gemini/onboarding-plan', {
    method: 'POST',
    headers: getAuthHeaders(currentUser),
    body: JSON.stringify(answers)
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.issues) {
      const msgs = data.issues.map((i: any) => `${i.field}: ${i.message}`).join(', ');
      throw new Error(`Validación Zod fallida: ${msgs}`);
    }
    throw new Error(data.error || 'Error al generar el plan pedagógico');
  }
  return data.plan as string;
}

export interface InstructorPricingMethodologyPayload {
  monthlyPriceUSD: number;
  monthlyPriceFormatted?: string;
  methodologyDescription?: string;
  associatedLabTools?: string[];
}

/**
 * Update instructor membership fee and teaching methodology (RBAC & Zod validated)
 */
export async function updateInstructorPricingMethodologyBackend(
  currentUser: User,
  payload: InstructorPricingMethodologyPayload
) {
  const res = await fetch('/api/instructor/pricing-methodology', {
    method: 'PUT',
    headers: getAuthHeaders(currentUser),
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.issues && Array.isArray(data.issues)) {
      const msgs = data.issues.map((i: any) => `${i.field || 'campo'}: ${i.message}`).join(', ');
      throw new Error(`Validación Zod de tarifa y metodología fallida: ${msgs}`);
    }
    throw new Error(data.error || 'Error al actualizar la tarifa y metodología del instructor');
  }
  return data;
}

export interface PayoutRequestInput {
  amountUSD: number;
  payoutMethod?: string;
  notes?: string;
}

export interface BankAccountInput {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  routingNumber?: string;
  country?: string;
}

/**
 * Fetch full finance summary from backend (RBAC protected)
 */
export async function fetchInstructorFinances(currentUser: User) {
  const res = await fetch('/api/instructor/finances', {
    method: 'GET',
    headers: getAuthHeaders(currentUser)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al obtener resumen financiero del servidor');
  }
  return data;
}

/**
 * Request Payout Withdrawal (RBAC & Zod validated + OnlyFans 80/20 balance checks)
 */
export async function requestInstructorPayoutBackend(
  currentUser: User,
  payload: PayoutRequestInput
) {
  const res = await fetch('/api/instructor/payout', {
    method: 'POST',
    headers: getAuthHeaders(currentUser),
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.issues && Array.isArray(data.issues)) {
      const msgs = data.issues.map((i: any) => `${i.field || 'campo'}: ${i.message}`).join(', ');
      throw new Error(`Validación Zod de retiro fallida: ${msgs}`);
    }
    throw new Error(data.error || 'Error al procesar la solicitud de retiro');
  }
  return data;
}

/**
 * Save/Update Linked Bank Account for direct deposits (RBAC & Zod validated)
 */
export async function saveInstructorBankAccountBackend(
  currentUser: User,
  payload: BankAccountInput
) {
  const res = await fetch('/api/instructor/bank-account', {
    method: 'POST',
    headers: getAuthHeaders(currentUser),
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.issues && Array.isArray(data.issues)) {
      const msgs = data.issues.map((i: any) => `${i.field || 'campo'}: ${i.message}`).join(', ');
      throw new Error(`Validación Zod de cuenta bancaria fallida: ${msgs}`);
    }
    throw new Error(data.error || 'Error al guardar la cuenta bancaria');
  }
  return data;
}

/**
 * Simulate Sale in backend (20% platform fee, 80% instructor net)
 */
export async function getPersonalizedRecommendations(currentUser: User, practiceLogs: any[]) {
  const res = await fetch('/api/ai/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentUser, practiceLogs })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al obtener recomendaciones de IA');
  }
  return data.recommendations;
}

/**
 * Simulate Sale in backend (20% platform fee, 80% instructor net)
 */
export async function simulateInstructorSaleBackend(
  currentUser: User,
  payload?: { studentName?: string; studentRegion?: string; itemType?: string; itemTitle?: string; amountUSD?: number }
) {
  const res = await fetch('/api/instructor/simulate-sale', {
    method: 'POST',
    headers: getAuthHeaders(currentUser),
    body: JSON.stringify(payload || {})
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al simular la venta en el servidor');
  }
  return data;
}



