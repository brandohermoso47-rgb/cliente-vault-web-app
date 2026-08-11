import { z } from 'zod';

// 1. Instructor Announcements Zod Schema
export const announcementSchema = z.object({
  title: z.string().trim().min(2, 'El título debe tener al menos 2 caracteres').max(200, 'El título excede los 200 caracteres'),
  content: z.string().trim().min(5, 'El contenido debe tener al menos 5 caracteres').max(5000, 'El contenido es demasiado extenso'),
  category: z.enum(['competencias', 'sesiones', 'clases', 'comunicados']).default('comunicados'),
  isImportant: z.boolean().default(false),
  actionUrl: z.string().url('URL inválida').or(z.literal('')).optional(),
  imageUrl: z.string().url('URL de imagen inválida').or(z.literal('')).optional(),
  authorUid: z.string().default('inst-1'),
  authorName: z.string().default('Instructor Oficial'),
  authorRole: z.enum(['instructor', 'student', 'guest']).default('instructor')
});

// 2. Community & Communication Hub Messages Zod Schema
export const communityMessageSchema = z.object({
  content: z.string().trim().min(1, 'El mensaje no puede estar vacío').max(2000, 'El mensaje excede el límite de 2000 caracteres'),
  channel: z.enum(['lobby', 'presentate', 'anuncios']).default('lobby'),
  videoUrl: z.string().url('URL de video inválida').or(z.literal('')).optional(),
  authorUid: z.string().default('user-anon'),
  authorName: z.string().trim().min(1).max(100).default('Bailarín'),
  authorRole: z.enum(['instructor', 'student', 'guest']).default('student')
});

// 3. Instructor Tasks Zod Schema
export const taskSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(150),
  description: z.string().trim().min(5, 'La descripción debe tener al menos 5 caracteres').max(2000),
  category: z.string().trim().default('general'),
  points: z.number().int().nonnegative('Los puntos no pueden ser negativos').default(50),
  studentUid: z.string().optional(),
  status: z.enum(['pending', 'completed']).default('pending'),
  deadline: z.string().optional()
});

// 4. User Profile Updates Zod Schema
export const profileUpdateSchema = z.object({
  uid: z.string().min(1, 'UID de usuario requerido'),
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  role: z.enum(['instructor', 'student', 'guest']).default('student'),
  bio: z.string().trim().max(1000).optional().default(''),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
  instagram: z.string().trim().max(100).optional().default(''),
  tiktok: z.string().trim().max(100).optional().default(''),
  youtube: z.string().trim().max(100).optional().default('')
});

// 5. Gemini AI Analysis Schemas
export const movementAnalysisSchema = z.object({
  danceNotes: z.string().trim().min(3, 'Las notas de danza son requeridas').max(3000),
  focusArea: z.string().trim().default('Arm Control & Roll-outs')
});

export const coachingFeedbackSchema = z.object({
  logs: z.array(z.any()).default([]),
  category: z.string().trim().default('drill')
});

export const chatSchema = z.object({
  message: z.string().trim().min(1, 'El mensaje es requerido').max(1500),
  history: z.array(z.object({
    sender: z.string(),
    text: z.string()
  })).optional().default([])
});

// 6. Stripe Session Schema
export const checkoutSessionSchema = z.object({
  tier: z.enum(['annual', 'monthly', 'ebook', 'clase_profesor', 'plan_instructor', 'plan_academia']).default('annual'),
  planType: z.enum(['clase_profesor', 'plan_instructor', 'plan_academia', 'student', 'instructor', 'studio', 'academia']).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  userEmail: z.string().email().optional().or(z.literal('')),
  userId: z.string().optional()
});

// 6b. Webhook Payment Event Schema (Stripe / Shopify / Mercado Pago)
export const webhookPaymentSchema = z.object({
  userId: z.string().optional().or(z.literal('')),
  userEmail: z.string().email().optional().or(z.literal('')),
  planType: z.enum([
    'clase_profesor', 
    'clase', 
    'inscripcion_profesor', 
    'plan_instructor', 
    'membresia_instructor', 
    'plan_academia', 
    'membresia_academia', 
    'student', 
    'estudiante', 
    'instructor', 
    'studio', 
    'academia'
  ]).default('clase_profesor'),
  gateway: z.enum(['stripe', 'shopify', 'mercadopago', 'simulated']).default('stripe'),
  transactionId: z.string().optional().default('tx_' + Date.now()),
  amountUSD: z.number().optional().default(29.99),
  status: z.enum(['completed', 'succeeded', 'paid', 'approved']).default('completed')
});

// 7. Analytics Practice Log Sync Schema
export const analyticsSyncSchema = z.object({
  uid: z.string().min(1, 'UID es requerido'),
  email: z.string().email().optional().or(z.literal('')),
  content: z.string().trim().min(1, 'El contenido es requerido').max(2000),
  date: z.string().optional()
});

// 8. AI Pedagogical Onboarding Engine Schema
export const onboardingSchema = z.object({
  studentName: z.string().trim().min(1).max(100).default('Alumno'),
  generalGoals: z.string().trim().min(2, 'Por favor completa tus metas generales'),
  waackingObjective: z.string().trim().min(2, 'Por favor completa tu objetivo en Waacking'),
  improvementAreas: z.string().trim().min(2, 'Por favor especifica tus áreas de mejora'),
  currentChallenges: z.string().trim().min(2, 'Por favor describe tus desafíos o bloqueos actuales')
});

// 9. Instructor Pricing & Methodology Zod Schema
export const instructorPricingMethodologySchema = z.object({
  monthlyPriceUSD: z.number({ message: 'La tarifa debe ser un número válido' })
    .positive('La tarifa mensual no puede ser un valor nulo o negativo (debe ser mayor a 0)')
    .min(1, 'La tarifa mínima de membresía es $1.00 USD/mes')
    .max(1000, 'La tarifa máxima no puede exceder $1000.00 USD/mes'),
  monthlyPriceFormatted: z.string().optional(),
  methodologyDescription: z.string().trim().max(10000, 'La descripción de metodología no puede exceder los 10000 caracteres').optional().default(''),
  associatedLabTools: z.array(z.string()).optional().default([])
});

// 10. Instructor Payout & Bank Account Zod Schemas (OnlyFans 80/20 Policy)
export const payoutRequestSchema = z.object({
  amountUSD: z.number({ message: 'El monto debe ser un número válido' })
    .positive('El monto a retirar debe ser mayor a $0.00 USD')
    .min(20, 'El umbral mínimo de retiro es $20.00 USD'),
  payoutMethod: z.string().optional().default('bank_transfer'),
  notes: z.string().optional().default('')
});

export const bankAccountSchema = z.object({
  bankName: z.string().trim().min(2, 'El nombre del banco es obligatorio'),
  accountHolder: z.string().trim().min(2, 'El titular de la cuenta es obligatorio'),
  accountNumber: z.string().trim().min(4, 'El número de cuenta / CLABE / IBAN es obligatorio'),
  routingNumber: z.string().trim().optional().default(''),
  country: z.string().trim().optional().default('USD')
});

// 11. Advanced AI Studio Tool Schemas (Video Analysis & Image Generation with Aspect Ratios)
export const videoAnalysisSchema = z.object({
  videoPrompt: z.string().trim().min(2, 'Prompt de video requerido').max(1000),
  videoData: z.string().optional(),
  mimeType: z.string().optional().default('video/mp4')
});

export const imageGenerationSchema = z.object({
  prompt: z.string().trim().min(3, 'El prompt para generar la imagen es requerido').max(1000),
  aspectRatio: z.enum(['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9']).default('1:1'),
  model: z.enum(['gemini-3.1-flash-image', 'gemini-3-pro-image', 'gemini-3.1-flash-lite-image']).default('gemini-3.1-flash-image')
});

// 12. Gemini Lesson Executive Summary Zod Schema
export const lessonSummarySchema = z.object({
  lessonId: z.string().optional(),
  lessonTitle: z.string().trim().min(1, 'Título de lección requerido'),
  lessonDescription: z.string().trim().optional().default(''),
  instructorName: z.string().trim().optional().default('Brando Hermoso'),
  category: z.string().trim().optional().default('técnica'),
  transcription: z.string().trim().min(5, 'Transcripción requerida para generar el resumen')
});



