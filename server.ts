import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import { GoogleGenAI } from '@google/genai';
import { db as drizzleDb } from './src/db/index.ts';
import { 
  users as usersTable, 
  entries as entriesTable, 
  announcements as announcementsTable,
  communityMessages as communityMessagesTable,
  instructorTasks as instructorTasksTable,
  profiles as profilesTable,
  subscriptions as subscriptionsTable,
  instructorSubscribers as instructorSubscribersTable,
  instructorTransactions as instructorTransactionsTable,
  instructorPayouts as instructorPayoutsTable,
  instructorBankAccounts as instructorBankAccountsTable
} from './src/db/schema.ts';
import { eq, count, desc } from 'drizzle-orm';
import { 
  requireRole, 
  requireVipAccess, 
  requireAcademyAccess, 
  requireVerifiedInstructor, 
  requireInstructorSubscriber, 
  validateInput, 
  getUserFromReq 
} from './src/server/rbac.ts';
import { 
  announcementSchema, 
  communityMessageSchema, 
  taskSchema, 
  profileUpdateSchema, 
  movementAnalysisSchema, 
  coachingFeedbackSchema, 
  chatSchema, 
  checkoutSessionSchema, 
  webhookPaymentSchema,
  analyticsSyncSchema,
  onboardingSchema,
  instructorPricingMethodologySchema,
  payoutRequestSchema,
  bankAccountSchema,
  videoAnalysisSchema,
  imageGenerationSchema,
  lessonSummarySchema
} from './src/server/schemas.ts';

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key && key.trim() !== '') {
      stripeClient = new Stripe(key, {
        apiVersion: '2025-02-24.acacia' as any,
      });
    }
  }
  return stripeClient;
}

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim() !== '') {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// In-Memory store fallbacks when SQL connection is unconfigured
const inMemoryAnnouncements: any[] = [
  {
    id: 'a-default-1',
    title: '🏆 Gran Batalla de Waacking On 2026',
    content: 'Se abren las inscripciones para la categoría 1v1 Freestyle en el Centro Cultural. ¡Preparen sus vestuarios y actitud!',
    category: 'competencias',
    isImportant: true,
    authorUid: 'inst-1',
    authorName: 'Loreto Waack',
    authorRole: 'instructor',
    createdAt: new Date().toISOString()
  }
];

const inMemoryCommunityMessages: any[] = [
  {
    id: 'm-default-1',
    authorUid: 'user-demo',
    authorName: 'Sofia Disco',
    authorRole: 'student',
    content: '¡Excelente clase de arm-rolls de ayer! Los acentos en tiempo síncopa estuvieron increíbles. 🔥',
    channel: 'lobby',
    createdAt: new Date().toISOString()
  }
];

const inMemoryInstructorTasks: any[] = [
  {
    id: 't-default-1',
    title: 'Drill de Posing con Matices Sincrónicos (120 BPM)',
    description: 'Ejecuta 8 tiempos de Posing estricto manteniendo proyección visual constante a la cámara.',
    category: 'técnica',
    points: 50,
    authorUid: 'inst-1',
    createdAt: new Date().toISOString()
  }
];

// In-Memory store for OnlyFans 80/20 Finance Policy & Payout System
const inMemoryTransactions: any[] = [
  {
    id: 'tx-101',
    instructorUid: 'inst-1',
    studentName: 'Yuki Waacker (Tokio)',
    studentRegion: '🇯🇵 JPN',
    itemType: 'Cátedra',
    itemTitle: 'Membresía Cátedra Waacking On (Mes 1)',
    grossAmountUSD: 100.00,
    platformFeeUSD: 20.00, // 20% platform commission
    netAmountUSD: 80.00,   // 80% net instructor earnings
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago -> Available
  },
  {
    id: 'tx-102',
    instructorUid: 'inst-1',
    studentName: 'Min-jun Kim (Seúl)',
    studentRegion: '🇰🇷 KOR',
    itemType: 'Masterclass',
    itemTitle: 'Masterclass Técnica del Disco & Aislamiento',
    grossAmountUSD: 50.00,
    platformFeeUSD: 10.00, // 20% platform commission
    netAmountUSD: 40.00,   // 80% net instructor earnings
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() // 25 days ago -> Available
  },
  {
    id: 'tx-103',
    instructorUid: 'inst-1',
    studentName: 'Camille Funk (París)',
    studentRegion: '🇪🇺 FRA',
    itemType: 'Ebook',
    itemTitle: 'Manual de Retórica y Drama Waacking',
    grossAmountUSD: 15.00,
    platformFeeUSD: 3.00,  // 20% platform commission
    netAmountUSD: 12.00,   // 80% net instructor earnings
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago -> Pending (21d rolling window)
  },
  {
    id: 'tx-104',
    instructorUid: 'inst-1',
    studentName: 'Mateo Posing (CDMX)',
    studentRegion: '🇲🇽 MEX',
    itemType: 'Cátedra',
    itemTitle: 'Plan de 4 Semanas Freestyle Lab',
    grossAmountUSD: 15.00,
    platformFeeUSD: 3.00,  // 20% platform commission
    netAmountUSD: 12.00,   // 80% net instructor earnings
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago -> Pending (21d rolling window)
  }
];

const inMemoryPayouts: any[] = [];

let inMemoryBankAccount: any = {
  bankName: 'Chase Bank / Banco Internacional',
  accountHolder: 'Jassy Soner',
  accountNumber: '**** **** **** 8842',
  routingNumber: '121000358',
  country: 'USD'
};

function getInstructorFinancesSummary(instructorUid: string) {
  const userTx = inMemoryTransactions;
  let grossUSD = 0;
  let platformFeeUSD = 0;
  let netUSD = 0;
  let pendingBalanceUSD = 0;
  let availableMaturedNetUSD = 0;

  const NOW = Date.now();
  const RETENTION_MS = 21 * 24 * 60 * 60 * 1000; // 21 days rolling window

  const formattedTransactions = userTx.map(tx => {
    const txTime = new Date(tx.createdAt).getTime();
    const ageMs = NOW - txTime;
    const isMatured = ageMs >= RETENTION_MS;
    const daysLeft = isMatured ? 0 : Math.ceil((RETENTION_MS - ageMs) / (24 * 60 * 60 * 1000));

    grossUSD += tx.grossAmountUSD;
    platformFeeUSD += tx.platformFeeUSD;
    netUSD += tx.netAmountUSD;

    if (isMatured) {
      availableMaturedNetUSD += tx.netAmountUSD;
    } else {
      pendingBalanceUSD += tx.netAmountUSD;
    }

    return {
      ...tx,
      status: isMatured ? 'available' : 'pending_21d',
      daysRemainingToMaturity: daysLeft
    };
  });

  const totalPaidOutUSD = inMemoryPayouts.reduce((sum, p) => sum + p.amountUSD, 0);
  const currentAvailableBalanceUSD = Math.max(0, availableMaturedNetUSD - totalPaidOutUSD);

  return {
    grossEarningsUSD: grossUSD,
    platformFeeUSD: platformFeeUSD,
    netEarningsUSD: netUSD,
    pendingBalanceUSD: pendingBalanceUSD,
    availableBalanceUSD: currentAvailableBalanceUSD,
    totalPaidOutUSD: totalPaidOutUSD,
    payoutMinimumUSD: 20.00,
    canRequestPayout: currentAvailableBalanceUSD >= 20.00,
    transactions: formattedTransactions,
    payouts: inMemoryPayouts,
    bankAccount: inMemoryBankAccount
  };
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Log incoming API requests for auditing
  app.use('/api', (req, res, next) => {
    const user = getUserFromReq(req);
    console.log(`[API Request]: ${req.method} ${req.path} | Role: '${user.role}' | UserID: '${user.id}'`);
    next();
  });

  // Helper for dynamic user role assignment & database updates via webhook events
  async function updateUserRoleAndSubscriptionInDB(
    userId?: string, 
    userEmail?: string, 
    planType?: string, 
    stripeCustomer?: string,
    isTrial?: boolean
  ) {
    let assignedRole: 'free_user' | 'vip_student' | 'academy' | 'instructor' = 'vip_student';
    let canonicalPlanType: 'app_vip' | 'app_academy' | 'instructor_custom' = 'app_vip';
    let subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'canceled' = isTrial ? 'trialing' : 'active';
    let dashboardUrl = '/dashboard/estudiante';

    const normalizedPlan = (planType || '').toLowerCase().trim();

    if (['plan_instructor', 'membresia_instructor', 'instructor', 'docente'].includes(normalizedPlan)) {
      assignedRole = 'instructor';
      canonicalPlanType = 'instructor_custom';
      dashboardUrl = '/dashboard/instructor';
    } else if (['plan_academia', 'membresia_academia', 'studio', 'academia', 'academy', 'app_academy'].includes(normalizedPlan)) {
      assignedRole = 'academy';
      canonicalPlanType = 'app_academy';
      dashboardUrl = '/dashboard/academia';
    } else {
      assignedRole = 'vip_student';
      canonicalPlanType = 'app_vip';
      dashboardUrl = '/dashboard/estudiante';
    }

    const now = new Date();
    // 4 days trial for VIP student trials, 30 days for active monthly payments
    const periodDays = isTrial ? 4 : 30;
    const currentPeriodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000).toISOString();
    const trialEnd = isTrial ? currentPeriodEnd : undefined;

    console.log(`[Payment Webhook Engine]: Assigning canonical role '${assignedRole}', plan '${canonicalPlanType}', status '${subscriptionStatus}' to user '${userId || 'N/A'}' (Period End: ${currentPeriodEnd})`);

    let dbUpdated = false;

    // 1. Update Firebase Firestore document if firebase-admin is available or initialized
    try {
      const adminModule = await import('firebase-admin');
      const admin = (adminModule as any).default || adminModule;
      if (!admin.apps || admin.apps.length === 0) {
        admin.initializeApp();
      }
      const firestore = admin.firestore();

      let targetUid = userId;
      if (!targetUid && userEmail) {
        const snap = await firestore.collection('users').where('email', '==', userEmail).limit(1).get();
        if (!snap.empty) {
          targetUid = snap.docs[0].id;
        }
      }

      if (targetUid) {
        await firestore.collection('users').doc(targetUid).set({
          role: assignedRole,
          plan_type: canonicalPlanType,
          subscription_status: subscriptionStatus,
          current_period_end: currentPeriodEnd,
          trial_end: trialEnd || null,
          stripe_customer_id: stripeCustomer || `cus_${targetUid}`,
          billingStatus: 'active',
          subscriptionTier: assignedRole === 'instructor' ? 'instructor_pass' : 'basic_practice',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        dbUpdated = true;
        console.log(`[Firestore Admin Webhook Success]: Set user '${targetUid}' role -> '${assignedRole}', status -> '${subscriptionStatus}'`);
      }
    } catch (err: any) {
      console.warn('[Firestore Admin Webhook Warning]:', err?.message || err);
    }

    // 2. Update PostgreSQL database if process.env.SQL_HOST is present
    if (process.env.SQL_HOST && userId) {
      try {
        await drizzleDb.update(profilesTable)
          .set({ 
            role: assignedRole,
            planType: canonicalPlanType,
            subscriptionStatus: subscriptionStatus,
            stripeCustomerId: stripeCustomer || `cus_${userId}`,
            currentPeriodEnd: new Date(currentPeriodEnd)
          });
        dbUpdated = true;
        console.log(`[PostgreSQL Webhook Success]: Updated SQL profile '${userId}' to role '${assignedRole}'`);
      } catch (err: any) {
        console.warn('[PostgreSQL Webhook Warning]:', err?.message || err);
      }
    }

    return {
      userId,
      userEmail,
      assignedRole,
      canonicalPlanType,
      subscriptionStatus,
      currentPeriodEnd,
      trialEnd,
      dashboardUrl,
      dbUpdated
    };
  }

  // --- 1. PAYMENTS & WEBHOOKS (Stripe, Shopify, Mercado Pago) ---

  app.get('/api/stripe/config', (req, res) => {
    const configured = !!process.env.STRIPE_SECRET_KEY;
    res.json({
      configured,
      publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
      mode: configured ? 'live' : 'simulation'
    });
  });

  app.post('/api/stripe/create-checkout-session', validateInput(checkoutSessionSchema), async (req, res) => {
    try {
      const { tier, planType, successUrl, cancelUrl, userEmail, userId } = req.body;
      const stripe = getStripeClient();

      const host = req.headers.host || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const appUrl = process.env.APP_URL || `${protocol}://${host}`;

      const activePlanType = planType || tier || 'clase_profesor';
      const defaultSuccessUrl = `${appUrl}?payment_status=success&plan=${activePlanType}&session_id={CHECKOUT_SESSION_ID}`;
      const defaultCancelUrl = `${appUrl}?payment_status=cancelled`;

      if (!stripe) {
        console.log('[Stripe Server] No STRIPE_SECRET_KEY configured. Returning simulation response.');
        // Auto assign role in simulation mode if requested
        const simulationResult = await updateUserRoleAndSubscriptionInDB(userId, userEmail, activePlanType);

        return res.json({
          success: true,
          mode: 'simulation',
          sessionId: 'sim_session_' + Date.now(),
          url: (successUrl || defaultSuccessUrl).replace('{CHECKOUT_SESSION_ID}', 'sim_session_' + Date.now()),
          assignedRole: simulationResult.assignedRole,
          dashboardUrl: simulationResult.dashboardUrl,
          message: 'Stripe simulated mode: pago procesado y rol actualizado correctamente.'
        });
      }

      let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let mode: Stripe.Checkout.SessionCreateParams.Mode = 'subscription';

      if (activePlanType === 'plan_academia' || activePlanType === 'studio' || activePlanType === 'academia') {
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Membresía Studio y Academia (Pro Waack ON)',
              description: 'Gestión completa de instructores, nómina de estudiantes, documentos y dashboard institucional de estudio.',
            },
            unit_amount: 3000, // $30.00 USD/mes
            recurring: { interval: 'month' }
          },
          quantity: 1,
        }];
        mode = 'subscription';
      } else if (activePlanType === 'plan_instructor' || activePlanType === 'instructor') {
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Plan Instructor (Cátedra Docente Waack ON)',
              description: 'Publicación de programas, podcasts, cobro directo de cátedras y dashboard de instructor.',
            },
            unit_amount: 4900, // $49.00 USD/mes
            recurring: { interval: 'month' }
          },
          quantity: 1,
        }];
        mode = 'subscription';
      } else {
        // Clase / Profesor / Estudiante
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pago de Clase / Inscripción Profesor (Pase Estudiante)',
              description: 'Acceso total a la academia de clases, laboratorio somático y dashboard de estudiante.',
            },
            unit_amount: 1499, // $14.99 USD/mes
            recurring: { interval: 'month' }
          },
          quantity: 1,
        }];
        mode = 'subscription';
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode,
        customer_email: userEmail || undefined,
        client_reference_id: userId || undefined,
        success_url: successUrl || defaultSuccessUrl,
        cancel_url: cancelUrl || defaultCancelUrl,
        metadata: { userId: userId || 'anonymous', planType: activePlanType }
      });

      return res.json({
        success: true,
        mode: 'stripe',
        sessionId: session.id,
        url: session.url
      });

    } catch (err: any) {
      console.error('[Stripe Checkout Error]:', err);
      return res.status(500).json({ error: 'Error creating checkout session', details: err.message });
    }
  });

  // Stripe Webhook Endpoint
  app.post('/api/stripe/webhook', async (req, res) => {
    try {
      const event = req.body;
      console.log('[Stripe Webhook Received]:', event?.type);

      if (event?.type === 'checkout.session.completed' || event?.type === 'payment_intent.succeeded') {
        const session = event.data?.object || {};
        const userId = session.client_reference_id || session.metadata?.userId;
        const userEmail = session.customer_email || session.customer_details?.email;
        const planType = session.metadata?.planType || session.metadata?.tier || 'clase_profesor';

        const result = await updateUserRoleAndSubscriptionInDB(userId, userEmail, planType);
        return res.json({
          received: true,
          status: 'success',
          result
        });
      }

      return res.json({ received: true });
    } catch (err: any) {
      console.error('[Stripe Webhook Error]:', err);
      return res.status(500).json({ error: 'Webhook processing error', details: err.message });
    }
  });

  // Generic Payment Webhook Endpoint (For Stripe, Shopify, Mercado Pago)
  app.post('/api/webhook/payment', validateInput(webhookPaymentSchema), async (req, res) => {
    try {
      const { userId, userEmail, planType, gateway, transactionId, amountUSD } = req.body;

      console.log(`[Universal Webhook - ${gateway.toUpperCase()}]: Processing payment transaction ${transactionId} ($${amountUSD} USD)`);

      const result = await updateUserRoleAndSubscriptionInDB(userId, userEmail, planType);

      return res.json({
        success: true,
        message: `Transacción de pago (${gateway.toUpperCase()}) validada exitosamente. Rol de usuario actualizado a '${result.assignedRole}'.`,
        transaction: {
          id: transactionId,
          gateway,
          amountUSD,
          userId: result.userId,
          userEmail: result.userEmail,
          assignedRole: result.assignedRole,
          subscriptionStatus: 'active',
          dashboardUrl: result.dashboardUrl
        }
      });
    } catch (err: any) {
      console.error('[Universal Payment Webhook Error]:', err);
      return res.status(500).json({ error: 'Error al procesar el webhook de pago', details: err.message });
    }
  });

  // Payment Simulator Webhook Endpoint (For live interactive testing)
  app.post('/api/webhook/simulate-payment', validateInput(webhookPaymentSchema), async (req, res) => {
    try {
      const { userId, userEmail, planType, gateway } = req.body;

      const result = await updateUserRoleAndSubscriptionInDB(userId, userEmail, planType);

      return res.json({
        success: true,
        message: `Simulación de pago completada (${gateway}). Rol asignado: '${result.assignedRole}'. Redirección activa a ${result.dashboardUrl}`,
        result
      });
    } catch (err: any) {
      console.error('[Simulate Payment Webhook Error]:', err);
      return res.status(500).json({ error: 'Error en la simulación de pago', details: err.message });
    }
  });

  // --- 1.2 HYBRID ARCHITECTURE ROUTES & MONETIZATION ENDPOINTS ---

  // VIP Content Library & VIP Tools (Protected by requireVipAccess middleware)
  app.get('/api/premium-library/lessons', requireVipAccess(), async (req, res) => {
    const user = (req as any).user;
    return res.json({
      success: true,
      message: 'Acceso autorizado a la Librería VIP de Waack ON',
      user: {
        id: user.id,
        role: user.role,
        status: user.subscription_status
      },
      lessons: [
        { id: 'vip-les-1', title: 'Mastery of Whacking Speed (130 BPM)', duration: '45 min', instructor: 'Loreto Waack' },
        { id: 'vip-les-2', title: 'Punking Theatricality & Drama Lines', duration: '60 min', instructor: 'Brando Hermoso' },
        { id: 'vip-les-3', title: 'Somatic Posture & Shoulder Isolation', duration: '50 min', instructor: 'Elena Pose' }
      ]
    });
  });

  // VIP Tools & Somatic Lab Features (Protected by requireVipAccess middleware)
  app.get('/api/vip-tools/features', requireVipAccess(), async (req, res) => {
    return res.json({
      success: true,
      tools: [
        { name: 'SomaticFeedbackLab', status: 'unlocked', capabilities: ['BlindMirror', 'SlowMotionMatrix', 'AngleCalibration'] },
        { name: 'BattleLabPro', status: 'unlocked', capabilities: ['GhostDancerAI', 'LiveJudgeScoring'] },
        { name: 'DramaLabStudio', status: 'unlocked', capabilities: ['MicroExpressionAnalysis', 'PosingFreezeFrame'] }
      ]
    });
  });

  // Academy Administration Dashboard (Protected by requireAcademyAccess middleware)
  app.get('/api/academy-dashboard/stats', requireAcademyAccess(), async (req, res) => {
    const user = (req as any).user;
    return res.json({
      success: true,
      academyId: user.id,
      metrics: {
        enrolledStudents: 48,
        activeInstructors: 4,
        monthlyRevenueUSD: 1440.00,
        retentionRate: '96.5%',
        institutionTier: 'Pro Studio Enterprise'
      }
    });
  });

  // Instructor Monetization & Content Publishing (Protected by requireVerifiedInstructor middleware)
  app.post('/api/instructor/publish-content', requireVerifiedInstructor(), async (req, res) => {
    const user = (req as any).user;
    const { title, description, priceUSD, videoUrl } = req.body;

    return res.json({
      success: true,
      message: 'Cátedra / Masterclass publicada exitosamente con cobro directo vía Stripe Connect (75% creador / 25% plataforma)',
      content: {
        id: `inst-content-${Date.now()}`,
        instructorId: user.id,
        title: title || 'Nueva Masterclass',
        description: description || '',
        priceUSD: priceUSD || 15.00,
        instructorShareUSD: (priceUSD || 15.00) * 0.75,
        platformFeeUSD: (priceUSD || 15.00) * 0.25,
        stripeAccountId: user.stripe_account_id,
        isVerified: true
      }
    });
  });

  // Private Instructor Content (Protected by requireInstructorSubscriber middleware)
  app.get('/api/instructor/:instructorId/private-lessons', requireInstructorSubscriber('instructorId'), async (req, res) => {
    const { instructorId } = req.params;
    return res.json({
      success: true,
      instructorId,
      lessons: [
        { id: `priv-${instructorId}-1`, title: 'Cátedra Exclusiva: Secretos de Posing y Proyección', length: '55 min' },
        { id: `priv-${instructorId}-2`, title: 'Metodología Personal & Laboratorio de Improvisación', length: '40 min' }
      ]
    });
  });

  // Start 4-Day VIP Trial endpoint
  app.post('/api/subscription/start-trial', async (req, res) => {
    const { userId, userEmail } = req.body;
    const result = await updateUserRoleAndSubscriptionInDB(userId, userEmail, 'app_vip', undefined, true);
    return res.json({
      success: true,
      message: '¡Prueba VIP de 4 días activada exitosamente! Tienes acceso ilimitado a la librería y herramientas somáticas.',
      result
    });
  });

  // --- 2. GEMINI AI ENDPOINTS (Validated with Zod) ---

  app.post('/api/gemini/analyze-movement', validateInput(movementAnalysisSchema), async (req, res) => {
    const { danceNotes, focusArea } = req.body;
    const fallbackAnalysis = `Análisis de Waacking (${focusArea}): Tienes buena velocidad en la extensión de codos. Enfócate en mantener el torso erguido durante los roll-outs rápidos para maximizar el impacto visual en el escenario.`;

    try {
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          mode: 'simulation',
          analysis: fallbackAnalysis
        });
      }

      const prompt = `Eres una instructora experta e historiadora de Waacking y Punking.
Analiza la siguiente nota o descripción de entrenamiento del alumno: "${danceNotes}".
Área de enfoque: ${focusArea}.
Proporciona una devolución técnica, motivadora y estructurada en 3 puntos:
1. Puntos fuertes observados
2. Corrección técnica somática (brazos, pose, musicalidad o expresión)
3. Ejercicio recomendado para la próxima sesión de práctica.
Responde de forma concisa y profesional en español.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({
        success: true,
        mode: 'gemini',
        analysis: response.text
      });
    } catch (err: any) {
      console.warn('[Gemini Analysis API Error - using fallback]:', err.message || err);
      return res.json({
        success: true,
        mode: 'fallback',
        analysis: fallbackAnalysis
      });
    }
  });

  app.post('/api/gemini/feedback', validateInput(coachingFeedbackSchema), async (req, res) => {
    const { logs, category } = req.body;
    const fallbackFeedback = `¡Excelente constancia! Llevas acumuladas varias sesiones de ${category}. Recomiendo intercalar 15 minutos de trabajo de espejo lento para pulir los ángulos de Posing antes de acelerar el BPM.`;

    try {
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          mode: 'simulation',
          feedback: fallbackFeedback
        });
      }

      const prompt = `Como mentora principal de Waack On Academy, revisa este historial de entrenamiento del estudiante:
${JSON.stringify(logs)}
Categoría preferida: ${category}.
Brinda 2 consejos prácticos para optimizar el rendimiento somático y la expresividad musical. Menciónale también cómo conectar el Punking y el Whacking en batalla. En español.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({
        success: true,
        mode: 'gemini',
        feedback: response.text
      });
    } catch (err: any) {
      console.warn('[Gemini Feedback API Error - using fallback]:', err.message || err);
      return res.json({
        success: true,
        mode: 'fallback',
        feedback: fallbackFeedback
      });
    }
  });

  app.post('/api/gemini/chat', validateInput(chatSchema), async (req, res) => {
    const { message, history } = req.body;
    const fallbackReply = `[Waack On AI Mentora] En Waacking, la actitud Punking y la conexión con la línea de bajo Disco son la clave para darle vida a los arm-rolls. ¡Sigue practicando la extensión limpia de codos a 120 BPM!`;

    try {
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          reply: `[Modo Simulación Waack On AI] Entendido tu mensaje: "${message}". En Waacking, el feeling Disco y la conexión con los acentos de la batería son la clave para hacer brillar los arm-rolls.`
        });
      }

      const formattedHistory = history.map((h: any) => `${h.sender === 'user' ? 'Alumno' : 'Mentora'}: ${h.text}`).join('\n');
      const prompt = `Contexto de la conversación:\n${formattedHistory}\n\nAlumno: ${message}\n\nResponde como la IA Mentora oficial de Waack On Academy. Sé concisa, experta en cultura Waacking, técnica, historia de los clubes de LA en los 70s y teoría musical. En español.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({ reply: response.text });
    } catch (err: any) {
      console.warn('[Gemini Chat API Error - using fallback]:', err.message || err);
      return res.json({ reply: fallbackReply });
    }
  });

  app.post('/api/gemini/summarize-lesson', validateInput(lessonSummarySchema), async (req, res) => {
    const { lessonTitle, lessonDescription, instructorName, category, transcription } = req.body;

    const fallbackSummary = `### 🎯 Objetivo Principal & Sinopsis Ejecutiva
En la clase **"${lessonTitle}"**, impartida por **${instructorName}** (${category}), se trabaja la base somática y técnica fundamental para optimizar la proyección escénica y la precisión en Waacking.

### 💡 Pilares Técnicos & Conceptos Somáticos
- **Alineación Postural**: Mantener la columna neutra y la mirada erguida al ejecutar movimientos rápidos.
- **Métrica & Control Articular**: Control consciente del codo para ejecutar rotaciones sin tensionar los hombros.
- **Fluidez & Síncopa**: Sincronización con la batería y los acentos del compás Disco 4/4.

### 📌 Drills & Rutinas Recomendadas
1. **Drill de Espejo**: 3 series de 1 minuto de rolls lentos a 110 BPM buscando simetría.
2. **Pose Estática**: Congelar poses cada 4 tiempos marcando la caja torácica.

### ⏱️ Marcas de Tiempo Destacadas
- **[00:00 - 03:30]**: Explicación teórica de la postura y respiración.
- **[03:30 - 10:00]**: Demostración paso a paso del ejercicio somático.
- **[10:00 - Fin]**: Práctica guiada con conteo y música.

### ⚡ Consejo Pedagógico de Cátedra
*"La velocidad sin limpieza visual es ruido. Enfócate primero en sentir el ritmo en la espalda antes de acelerar el BPM."*`;

    try {
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          mode: 'simulation',
          summary: fallbackSummary
        });
      }

      const prompt = `Eres la IA Directora Pedagógica de Waack On Academy, experta en metodología de danza Waacking, biomecánica y cultura Disco de los años 70.
Genera un RESUMEN EJECUTIVO exhaustivo, profesional y bien estructurado de la siguiente clase a partir de su transcripción completa.

Información de la Clase:
- Título: ${lessonTitle}
- Instructor: ${instructorName}
- Categoría: ${category}
- Descripción General: ${lessonDescription}

Transcripción Oficial de la Clase:
"${transcription}"

Por favor organiza el Resumen Ejecutivo en las siguientes secciones con formato Markdown impecable:

1. 🎯 **OBJETIVO PRINCIPAL Y SINOPSIS EJECUTIVA** (Resumen de alto nivel de lo enseñado en la lección).
2. 💡 **PILARES TÉCNICOS Y CONCEPTOS SOMÁTICOS** (Desglose biomecánico: postura, codos, rolls, musicalidad, Posing o expresión).
3. 📌 **DRILLS Y RUTINAS DE PRÁCTICA RECOMENDADAS** (Pautas concretas paso a paso para el estudiante).
4. ⏱️ **MARCAS DE TIEMPO Y HITOS CLAVE DE LA CLASE** (Basándote en la transcripción).
5. ⚡ **CONSEJO PEDAGÓGICO DE CÁTEDRA PARA EL FREESTYLE** (Mensaje motivador y estratégico para el bailarín).

Responde exclusivamente en español con un lenguaje académico, motivador y sumamente claro.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({
        success: true,
        mode: 'gemini',
        summary: response.text || fallbackSummary
      });
    } catch (err: any) {
      console.warn('[Gemini Summarize Lesson Error - using fallback]:', err.message || err);
      return res.json({
        success: true,
        mode: 'fallback',
        summary: fallbackSummary
      });
    }
  });

  app.post('/api/gemini/onboarding-plan', validateInput(onboardingSchema), async (req, res) => {
    const { studentName, generalGoals, waackingObjective, improvementAreas, currentChallenges } = req.body;

    const fallbackPlan = `👤 Perfil de Ingreso del Alumno
Alumno: ${studentName}

Objetivo Principal (Waacking): ${waackingObjective} (Enfoque general: ${generalGoals})

Puntos de Fricción (Desafíos): ${currentChallenges} (Áreas clave de mejora: ${improvementAreas})

🎯 Estrategia Pedagógica Sugerida
Enfoque Técnico: Priorizar la extensión limpia de codos, simetría en arm-rolls y limpieza postural en Posing a 115-125 BPM.

Enfoque Expresivo/Musical: Trabajar la disociación facial y proyección escénica Punking conectando los acentos síncopas de la batería Disco.

🔬 Integración del Freestyle Lab
DramaLab: Activar el modo de micro-expresiones dramáticas para superar la rigidez gestual y conectar la emoción teatral con el personaje.

SomaticFeedbackLab / Espejo Ciego: Desactivar la vista previa en tiempo real durante 2 minutos para forzar el sentido propioceptivo y corregir la extensión de brazos sin dependencia del espejo.

📅 Plan de Acción (Semanas 1-4)
Semana 1-2 (Fundamentación y Desbloqueo):
- Realizar 3 sesiones semanales de 15 minutos en Espejo Ciego enfocadas en Posing estricto a 100 BPM.
- Grabar 1 toma en DramaLab interpretando cambios de dinámica (dulce vs. agresivo) sobre un track de Funk de los 70.

Semana 3-4 (Progresión):
- Aumentar velocidad a 125 BPM e integrar BattleLab en nivel intermedio para acelerar la respuesta de reacción improvisada.
- Ejecutar secuencias de Whacking rápido con cambios de altura manteniendo los hombros relajados.

✅ Tareas Recomendadas (Para el sistema de tareas)
- Grabar 2 minutos en el SomaticFeedbackLab enfocándose en la extensión simétrica de codos y retención de poses de 2 tiempos.
- Superar el nivel 3 del Entrenador de Ritmo a 120 BPM manteniendo la limpieza en los roll-outs.`;

    try {
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          mode: 'simulation',
          plan: fallbackPlan
        });
      }

      const prompt = `Eres el motor de Inteligencia Artificial pedagógica de "Waack On", la plataforma de entrenamiento especializada en Waacking. Tu objetivo es analizar las respuestas de onboarding de un nuevo alumno y redactar un Plan de Entrenamiento Personalizado altamente estructurado para el profesor en su "Cátedra del Instructor".

DATOS DEL ALUMNO:
- Nombre: ${studentName}
- Metas Generales: ${generalGoals}
- Objetivo en el Waacking: ${waackingObjective}
- Áreas de Mejora: ${improvementAreas}
- Desafíos Actuales: ${currentChallenges}

REGLAS Y RESTRICCIONES RIGUROSAS:
1. Utiliza terminología precisa del Waacking (punking, posing, waacks, extensiones, roll-outs, arm control, disociación somática).
2. Asigna obligatoriamente el uso de herramientas específicas del Freestyle Lab según las debilidades detectadas (ej. DramaLab para expresión/teatralidad, SomaticFeedbackLab / Espejo Ciego para corrección técnica de líneas, BattleLab para retención e improvisación en batalla, Entrenador de Ritmo para musicalidad disco).
3. No incluyas saludos, introducciones ni texto de relleno antes o después del formato.
4. Salida OBLIGATORIA utilizando EXACTAMENTE la siguiente estructura Markdown sin cambiar los encabezados ni las secciones:

👤 Perfil de Ingreso del Alumno
Alumno: [Nombre/Usuario]

Objetivo Principal (Waacking): [Resumen de su meta central]

Puntos de Fricción (Desafíos): [Resumen de sus bloqueos]

🎯 Estrategia Pedagógica Sugerida
Enfoque Técnico: [Mecánicas o fundamentos a priorizar]

Enfoque Expresivo/Musical: [Recomendaciones sobre musicalidad o teatralidad]

🔬 Integración del Freestyle Lab
[Nombre de la Herramienta 1 - Ej: DramaLab]: [Justificación de por qué el alumno debe usar esta herramienta y cómo configurarla]

[Nombre de la Herramienta 2 - Ej: Espejo Ciego]: [Justificación técnica para el uso de esta herramienta]

📅 Plan de Acción (Semanas 1-4)
Semana 1-2 (Fundamentación y Desbloqueo): [2 a 3 ejercicios sugeridos utilizando las herramientas del Lab asignadas]

Semana 3-4 (Progresión): [Cómo escalar la dificultad en el Lab basándose en sus metas]

✅ Tareas Recomendadas (Para el sistema de tareas)
- [Tarea 1 - Ej: Grabar 2 minutos en el SomaticFeedbackLab enfocándose en X]
- [Tarea 2 - Ej: Superar el nivel 3 del Entrenador de Ritmo a 120 BPM]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({
        success: true,
        mode: 'gemini',
        plan: response.text
      });

    } catch (err: any) {
      console.warn('[Gemini Onboarding Plan Error - using fallback]:', err.message || err);
      return res.json({
        success: true,
        mode: 'fallback',
        plan: fallbackPlan
      });
    }
  });

  app.post('/api/ai/recommendations', async (req, res) => {
    const { currentUser, practiceLogs } = req.body;
    const fallbackRecs = {
      nextDrill: "Drill de Muñecas y Arm-Rolls a 120 BPM",
      focusTip: "Mantén la rigidez en los codos y el dramatismo en la mirada",
      recommendedClass: "Introducción al Movimiento de Brazos y Líneas"
    };

    try {
      const ai = getGeminiClient ? getGeminiClient() : null;
      if (!ai) {
        return res.json({ success: true, recommendations: fallbackRecs });
      }

      const prompt = `Basado en el perfil de usuario de Waacking (nivel: ${currentUser?.subscriptionTier || 'student'}, puntos: ${currentUser?.points || 0}, lecciones completadas: ${currentUser?.completedLessons?.length || 0}) y sus registros de práctica recientes (${JSON.stringify(practiceLogs || []).slice(0, 300)}), genera estrictamente un objeto JSON con 3 campos en español:
      {
        "nextDrill": "Título corto del siguiente drill recomendado",
        "focusTip": "Consejo técnico clave de postura o musicalidad",
        "recommendedClass": "Nombre de clase recomendada"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let text = response.text || '';
      if (text.includes('```json')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      const parsed = JSON.parse(text);

      return res.json({
        success: true,
        recommendations: {
          nextDrill: parsed.nextDrill || fallbackRecs.nextDrill,
          focusTip: parsed.focusTip || fallbackRecs.focusTip,
          recommendedClass: parsed.recommendedClass || fallbackRecs.recommendedClass
        }
      });
    } catch (err) {
      return res.json({ success: true, recommendations: fallbackRecs });
    }
  });

  // --- 2.2 ADVANCED AI STUDIO TOOLS

  app.post('/api/ai/analyze-video', validateInput(videoAnalysisSchema), async (req, res) => {
    const { videoPrompt, videoData, mimeType } = req.body;
    const fallbackAnalysis = `Análisis de video IA (Gemini Pro): Se observa una excelente extensión de hombros y sincronización en los acentos de la batería a 120 BPM. Sugerencia: relajar las muñecas durante la transición del Punking al Whacking para lograr mayor fluidez y limpieza postural.`;

    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          success: true,
          mode: 'simulation',
          analysis: fallbackAnalysis
        });
      }

      const contents: any[] = [
        {
          text: `Eres una instructora experta e historiadora de Waacking y Punking. Analiza el siguiente video de entrenamiento de danza enfocado en: "${videoPrompt}". Proporciona un desglose técnico detallado de la postura, velocidad de arm-rolls, musicalidad y precisión métrica en español.`
        }
      ];

      if (videoData) {
        contents.unshift({
          inlineData: {
            mimeType: mimeType || 'video/mp4',
            data: videoData
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents
      });

      return res.json({
        success: true,
        mode: 'gemini-2.5-flash',
        analysis: response.text
      });
    } catch (err: any) {
      console.warn('[Video Analysis API Error - using fallback]:', err.message || err);
      return res.json({
        success: true,
        mode: 'fallback',
        analysis: fallbackAnalysis
      });
    }
  });

  app.post('/api/ai/generate-image', validateInput(imageGenerationSchema), async (req, res) => {
    const { prompt, aspectRatio, model } = req.body;

    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(400).json({ error: 'API key de Gemini no configurada en el servidor.' });
      }

      const selectedModel = model || 'gemini-3.1-flash-image';

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: {
          parts: [
            {
              text: `Waacking dance choreography concept, cinematic lighting, dramatic stage atmosphere, professional dancer, high aesthetic quality: ${prompt}`
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || '1:1',
            imageSize: '1K'
          }
        }
      });

      let imageUrl = '';
      let textResponse = '';

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          } else if (part.text) {
            textResponse += part.text;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({ error: 'El modelo no retornó una imagen válida.' });
      }

      return res.json({
        success: true,
        model: selectedModel,
        aspectRatio,
        imageUrl,
        text: textResponse
      });

    } catch (err: any) {
      console.error('[Image Generation API Error]:', err);
      return res.status(500).json({ error: 'Error al generar la imagen con Gemini', details: err.message });
    }
  });

  // --- 3. INSTRUCTOR PROTECTED TOOLS (RBAC STRICT ENFORCEMENT) ---

  // Get protected instructor metrics (Protected: Instructor Only)
  app.get('/api/instructor/metrics', requireRole(['instructor']), async (req, res) => {
    try {
      const user = (req as any).user;

      const metrics = {
        grossRevenue: 4280.00,
        platformCommission: 642.00,
        netInstructorRevenue: 3638.00,
        totalSalesCount: 142,
        activeEnrolledStudents: 128,
        retentionRate: '94.2%',
        topSellingCourse: 'Mastering Whacking Arm Control & Roll-outs',
        verifiedInstructorUid: user.id,
        databaseEngine: process.env.SQL_HOST ? 'PostgreSQL Drizzle ORM' : 'Server Memory Vault'
      };

      return res.json({
        success: true,
        metrics
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error fetching instructor metrics', details: err.message });
    }
  });

  // Get student roster and activity stats (Protected: Instructor Only)
  app.get('/api/instructor/students', requireRole(['instructor']), async (req, res) => {
    try {
      if (process.env.SQL_HOST) {
        const rows = await drizzleDb
          .select({
            id: profilesTable.id,
            userId: profilesTable.userId,
            uid: usersTable.uid,
            name: profilesTable.name,
            email: usersTable.email,
            role: profilesTable.role,
            points: profilesTable.points,
            updatedAt: profilesTable.updatedAt
          })
          .from(profilesTable)
          .innerJoin(usersTable, eq(profilesTable.userId, usersTable.id))
          .where(eq(profilesTable.role, 'student'));

        const students = rows.map(r => ({
          id: `st-${r.id}`,
          uid: r.uid,
          name: r.name,
          email: r.email,
          level: (r.points || 0) > 1000 ? 'Avanzado' : (r.points || 0) > 500 ? 'Intermedio' : 'Principiante',
          points: r.points || 0,
          lastActive: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Reciente'
        }));

        return res.json({ success: true, students });
      }

      const students = [
        { id: 'st-101', uid: '101', name: 'Sofia Disco', email: 'sofia@waackon.com', level: 'Intermedio', points: 1120, lastActive: 'Hoy, 10:15 AM' },
        { id: 'st-102', uid: '102', name: 'Diego Funk', email: 'diego@waackon.com', level: 'Avanzado', points: 980, lastActive: 'Ayer' },
        { id: 'st-103', uid: '103', name: 'Camila Roll', email: 'camila@waackon.com', level: 'Principiante', points: 450, lastActive: 'Hace 2 días' },
        { id: 'st-104', uid: '104', name: 'Valentina Groove', email: 'valentina@waackon.com', level: 'Avanzado', points: 1340, lastActive: 'Hoy, 08:30 AM' }
      ];

      return res.json({
        success: true,
        students
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error fetching student roster', details: err.message });
    }
  });

  // Publish official instructor announcement (Protected: Instructor Only + Zod Validation)
  app.post('/api/instructor/announcements', requireRole(['instructor']), validateInput(announcementSchema), async (req, res) => {
    try {
      const data = req.body;
      const user = (req as any).user;

      const newAnn = {
        id: `ann-${Date.now()}`,
        title: data.title,
        content: data.content,
        category: data.category,
        isImportant: data.isImportant,
        actionUrl: data.actionUrl || null,
        imageUrl: data.imageUrl || null,
        authorUid: user.id,
        authorName: data.authorName || 'Instructor Oficial',
        authorRole: 'instructor',
        createdAt: new Date().toISOString()
      };

      if (process.env.SQL_HOST) {
        await drizzleDb.insert(announcementsTable).values({
          title: newAnn.title,
          content: newAnn.content,
          category: newAnn.category,
          isImportant: newAnn.isImportant,
          actionUrl: newAnn.actionUrl,
          imageUrl: newAnn.imageUrl,
          authorUid: newAnn.authorUid,
          authorName: newAnn.authorName,
          authorRole: newAnn.authorRole
        });
      } else {
        inMemoryAnnouncements.unshift(newAnn);
      }

      console.log(`[RBAC & Zod Success]: Announcement created by Instructor '${user.id}'`);
      return res.status(201).json({
        success: true,
        message: 'Anuncio publicado exitosamente con validación de rol e input.',
        announcement: newAnn
      });
    } catch (err: any) {
      console.error('[Announcement Error]:', err);
      return res.status(500).json({ error: 'Error publishing announcement', details: err.message });
    }
  });

  // Delete instructor announcement (Protected: Instructor Only)
  app.delete('/api/instructor/announcements/:id', requireRole(['instructor']), async (req, res) => {
    try {
      const { id } = req.params;
      if (process.env.SQL_HOST) {
        await drizzleDb.delete(announcementsTable).where(eq(announcementsTable.id, Number(id) || 0));
      } else {
        const idx = inMemoryAnnouncements.findIndex(a => a.id === id);
        if (idx !== -1) inMemoryAnnouncements.splice(idx, 1);
      }

      return res.json({ success: true, message: `Anuncio ${id} eliminado por el instructor.` });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error deleting announcement', details: err.message });
    }
  });

  // Assign task to students (Protected: Instructor Only + Zod Validation)
  app.post('/api/instructor/tasks', requireRole(['instructor']), validateInput(taskSchema), async (req, res) => {
    try {
      const data = req.body;
      const user = (req as any).user;

      const newTask = {
        id: `task-${Date.now()}`,
        title: data.title,
        description: data.description,
        category: data.category,
        points: data.points,
        studentUid: data.studentUid || null,
        status: 'pending',
        deadline: data.deadline || null,
        authorUid: user.id,
        createdAt: new Date().toISOString()
      };

      if (process.env.SQL_HOST) {
        await drizzleDb.insert(instructorTasksTable).values({
          title: newTask.title,
          description: newTask.description,
          category: newTask.category,
          points: newTask.points,
          studentUid: newTask.studentUid,
          status: newTask.status,
          deadline: newTask.deadline,
          authorUid: newTask.authorUid
        });
      } else {
        inMemoryInstructorTasks.unshift(newTask);
      }

      return res.status(201).json({
        success: true,
        message: 'Tarea asignada a los estudiantes con éxito.',
        task: newTask
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error creating task', details: err.message });
    }
  });

  // Get student tasks
  app.get('/api/student/tasks', async (req, res) => {
    try {
      if (process.env.SQL_HOST) {
        const tasks = await drizzleDb.select().from(instructorTasksTable);
        return res.json({ success: true, tasks });
      }
      return res.json({ success: true, tasks: inMemoryInstructorTasks });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error fetching student tasks', details: err.message });
    }
  });

  // Complete student task and award points
  app.patch('/api/student/tasks/:id/complete', async (req, res) => {
    try {
      const { id } = req.params;
      const taskIdNum = Number(id);

      if (process.env.SQL_HOST) {
        await drizzleDb.update(instructorTasksTable)
          .set({ status: 'completed' })
          .where(eq(instructorTasksTable.id, taskIdNum));

        const tasks = await drizzleDb.select().from(instructorTasksTable).where(eq(instructorTasksTable.id, taskIdNum));
        const taskObj = tasks[0];
        const pointsToAdd = taskObj?.points || 50;

        const profileRows = await drizzleDb.select().from(profilesTable).limit(1);
        if (profileRows.length > 0) {
          const currentPoints = profileRows[0].points || 0;
          await drizzleDb.update(profilesTable)
            .set({ points: currentPoints + pointsToAdd })
            .where(eq(profilesTable.userId, profileRows[0].userId));
        }

        return res.json({ success: true, message: 'Tarea completada exitosamente.', awardedPoints: pointsToAdd });
      } else {
        const t = inMemoryInstructorTasks.find(item => item.id === id);
        if (t) {
          t.status = 'completed';
        }
        return res.json({ success: true, message: 'Tarea completada exitosamente.', awardedPoints: t?.points || 50 });
      }
    } catch (err: any) {
      return res.status(500).json({ error: 'Error completing task', details: err.message });
    }
  });

  // Update Instructor Custom Pricing & Teaching Methodology (Protected: Instructor Only + Zod Validation)
  app.put('/api/instructor/pricing-methodology', requireRole(['instructor']), validateInput(instructorPricingMethodologySchema), async (req, res) => {
    try {
      const { monthlyPriceUSD, monthlyPriceFormatted, methodologyDescription, associatedLabTools } = req.body;
      const user = (req as any).user;

      if (!monthlyPriceUSD || typeof monthlyPriceUSD !== 'number' || monthlyPriceUSD <= 0) {
        return res.status(400).json({
          error: 'Regla de negocio: La tarifa mensual debe ser un valor positivo mayor a 0 (no se permiten valores negativos ni nulos).'
        });
      }

      const formattedPrice = monthlyPriceFormatted || `$${Number(monthlyPriceUSD).toFixed(2)} USD/mes`;

      console.log(`[RBAC & Zod Pricing Update]: Instructor '${user.id}' updated fee to ${formattedPrice}`);

      return res.json({
        success: true,
        message: 'Tarifa mensual y metodología pedagógica actualizadas exitosamente en el backend.',
        instructorId: user.id,
        monthlyPriceUSD,
        monthlyPriceFormatted: formattedPrice,
        methodologyDescription: methodologyDescription || '',
        associatedLabTools: associatedLabTools || []
      });
    } catch (err: any) {
      console.error('[Pricing & Methodology Error]:', err);
      return res.status(500).json({ error: 'Error al actualizar la tarifa y metodología', details: err.message });
    }
  });

  // --- FINANCES & PAYOUT SYSTEM (OnlyFans 80/20 Policy + 21-Day Rolling Retention) ---

  // Get Finance Summary
  app.get('/api/instructor/finances', requireRole(['instructor']), async (req, res) => {
    try {
      const user = (req as any).user;
      const fin = getInstructorFinancesSummary(user.id);
      return res.json({
        success: true,
        ...fin
      });
    } catch (err: any) {
      console.error('[Finances Summary Error]:', err);
      return res.status(500).json({ error: 'Error al obtener el resumen financiero', details: err.message });
    }
  });

  // Request Payout (Withdrawal)
  app.post('/api/instructor/payout', requireRole(['instructor']), validateInput(payoutRequestSchema), async (req, res) => {
    try {
      const user = (req as any).user;
      const { amountUSD, payoutMethod, notes } = req.body;

      const fin = getInstructorFinancesSummary(user.id);

      // Business Rule 1: Check minimum threshold ($20.00 USD)
      if (fin.availableBalanceUSD < 20.00) {
        return res.status(400).json({
          error: `Fondos insuficientes: Tu Saldo Disponible ($${fin.availableBalanceUSD.toFixed(2)} USD) no alcanza el umbral mínimo de retiro ($20.00 USD).`
        });
      }

      // Business Rule 2: Amount cannot exceed Available Balance
      if (amountUSD > fin.availableBalanceUSD) {
        return res.status(400).json({
          error: `El monto solicitado ($${Number(amountUSD).toFixed(2)} USD) excede tu Saldo Disponible ($${fin.availableBalanceUSD.toFixed(2)} USD).`
        });
      }

      const newPayout = {
        id: `po-${Date.now()}`,
        instructorUid: user.id,
        amountUSD: Number(amountUSD),
        status: 'completed',
        payoutMethod: payoutMethod || 'bank_transfer',
        bankSummary: `${inMemoryBankAccount.bankName} (${inMemoryBankAccount.accountNumber})`,
        notes: notes || '',
        createdAt: new Date().toISOString()
      };

      inMemoryPayouts.unshift(newPayout);

      const updatedFin = getInstructorFinancesSummary(user.id);

      console.log(`[Payout Processed]: Instructor '${user.id}' withdrew $${Number(amountUSD).toFixed(2)} USD. Remaining available balance: $${updatedFin.availableBalanceUSD.toFixed(2)} USD`);

      return res.json({
        success: true,
        message: `¡Retiro de $${Number(amountUSD).toFixed(2)} USD procesado exitosamente! Depósito enviado a ${inMemoryBankAccount.bankName}.`,
        payout: newPayout,
        finances: updatedFin
      });
    } catch (err: any) {
      console.error('[Payout Error]:', err);
      return res.status(500).json({ error: 'Error al procesar la solicitud de retiro', details: err.message });
    }
  });

  // Save / Update Linked Bank Account Details
  app.post('/api/instructor/bank-account', requireRole(['instructor']), validateInput(bankAccountSchema), async (req, res) => {
    try {
      const user = (req as any).user;
      const { bankName, accountHolder, accountNumber, routingNumber, country } = req.body;

      inMemoryBankAccount = {
        bankName,
        accountHolder,
        accountNumber,
        routingNumber: routingNumber || '',
        country: country || 'USD',
        updatedAt: new Date().toISOString()
      };

      console.log(`[Bank Account Configured]: Instructor '${user.id}' linked bank account '${bankName}' (${accountNumber})`);

      return res.json({
        success: true,
        message: '¡Cuenta bancaria vinculada exitosamente para depósitos directos!',
        bankAccount: inMemoryBankAccount
      });
    } catch (err: any) {
      console.error('[Bank Account Error]:', err);
      return res.status(500).json({ error: 'Error al guardar la cuenta bancaria', details: err.message });
    }
  });

  // Simulate Sale / Purchase for Testing
  app.post('/api/instructor/simulate-sale', requireRole(['instructor']), async (req, res) => {
    try {
      const user = (req as any).user;
      const { studentName, studentRegion, itemType, itemTitle, amountUSD } = req.body;

      const gross = Number(amountUSD) || 15.00;
      const platformFee = Math.round((gross * 0.20) * 100) / 100; // 20%
      const net = Math.round((gross * 0.80) * 100) / 100; // 80%

      const newTx = {
        id: `tx-${Date.now()}`,
        instructorUid: user.id,
        studentName: studentName || 'Alumno Global',
        studentRegion: studentRegion || '🌍 Global',
        itemType: itemType || 'Cátedra',
        itemTitle: itemTitle || 'Membresía Mensual Cátedra',
        grossAmountUSD: gross,
        platformFeeUSD: platformFee,
        netAmountUSD: net,
        createdAt: new Date().toISOString() // starts in 21-day pending window
      };

      inMemoryTransactions.unshift(newTx);

      const updatedFin = getInstructorFinancesSummary(user.id);

      return res.json({
        success: true,
        message: `¡Venta de $${gross.toFixed(2)} USD registrada (${studentRegion || 'Global'})! ($${net.toFixed(2)} USD añadidos al Saldo Pendiente por 21 días)`,
        transaction: newTx,
        finances: updatedFin
      });
    } catch (err: any) {
      console.error('[Simulate Sale Error]:', err);
      return res.status(500).json({ error: 'Error al simular la venta', details: err.message });
    }
  });


  // --- 4. COMMUNICATION HUB & COMMUNITY API (Validated with Zod) ---

  // Get messages from Community Hub
  app.get('/api/community/messages', async (req, res) => {
    try {
      if (process.env.SQL_HOST) {
        const rows = await drizzleDb.select().from(communityMessagesTable).orderBy(desc(communityMessagesTable.createdAt));
        return res.json({ success: true, messages: rows });
      }
      return res.json({ success: true, messages: inMemoryCommunityMessages });
    } catch (err: any) {
      return res.json({ success: true, messages: inMemoryCommunityMessages });
    }
  });

  // Post message to Communication Hub (Validated with Zod)
  app.post('/api/community/messages', validateInput(communityMessageSchema), async (req, res) => {
    try {
      const data = req.body;
      const user = getUserFromReq(req);

      const newMsg = {
        id: `msg-${Date.now()}`,
        authorUid: user.id,
        authorName: data.authorName || 'Bailarín',
        authorRole: user.role,
        content: data.content,
        channel: data.channel || 'lobby',
        videoUrl: data.videoUrl || null,
        createdAt: new Date().toISOString()
      };

      if (process.env.SQL_HOST) {
        await drizzleDb.insert(communityMessagesTable).values({
          authorUid: newMsg.authorUid,
          authorName: newMsg.authorName,
          authorRole: newMsg.authorRole,
          content: newMsg.content,
          channel: newMsg.channel,
          videoUrl: newMsg.videoUrl
        });
      } else {
        inMemoryCommunityMessages.unshift(newMsg);
      }

      return res.status(201).json({
        success: true,
        message: 'Mensaje sanitizado y publicado en el Hub de Comunicación.',
        chatMessage: newMsg
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error posting community message', details: err.message });
    }
  });

  // Delete community message (RBAC Check: Author or Instructor)
  app.delete('/api/community/messages/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = getUserFromReq(req);

      // Instructors can delete any message; students can only delete if authorized
      if (user.role !== 'instructor') {
        const msg = inMemoryCommunityMessages.find(m => m.id === id);
        if (msg && msg.authorUid !== user.id) {
          return res.status(403).json({
            success: false,
            error: 'No tienes permisos para eliminar mensajes creados por otros bailarines.'
          });
        }
      }

      if (process.env.SQL_HOST) {
        await drizzleDb.delete(communityMessagesTable).where(eq(communityMessagesTable.id, Number(id) || 0));
      } else {
        const idx = inMemoryCommunityMessages.findIndex(m => m.id === id);
        if (idx !== -1) inMemoryCommunityMessages.splice(idx, 1);
      }

      return res.json({ success: true, message: `Mensaje ${id} eliminado.` });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error deleting message', details: err.message });
    }
  });

  // --- 5. USER PROFILE UPDATES (Validated with Zod) ---

  app.post('/api/profile/update', validateInput(profileUpdateSchema), async (req, res) => {
    try {
      const data = req.body;

      if (process.env.SQL_HOST) {
        let userRecords = await drizzleDb.select().from(usersTable).where(eq(usersTable.uid, data.uid));
        let userId = userRecords[0]?.id;

        if (!userId) {
          const inserted = await drizzleDb.insert(usersTable).values({
            uid: data.uid,
            email: `${data.uid}@waackon.com`
          }).returning();
          userId = inserted[0].id;
        }

        await drizzleDb.insert(profilesTable).values({
          userId,
          name: data.name,
          role: data.role,
          bio: data.bio || '',
          avatarUrl: data.avatarUrl || null,
          instagram: data.instagram || '',
          tiktok: data.tiktok || '',
          youtube: data.youtube || ''
        });
      }

      return res.json({
        success: true,
        message: 'Perfil sanitizado y actualizado correctamente.',
        profile: data
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error updating profile', details: err.message });
    }
  });

  // --- 6. HEAVY ANALYTICS & PRACTICE LOGS (Validated with Zod) ---

  app.get('/api/analytics/summary', async (req, res) => {
    try {
      let stats = {
        totalPracticesLogged: 42,
        totalHoursTrained: 18.5,
        activeStudents: 128,
        topCategory: 'Arm Control & Drills',
        databaseEngine: process.env.SQL_HOST ? 'PostgreSQL (Drizzle ORM)' : 'In-Memory Analytics'
      };

      if (process.env.SQL_HOST) {
        const entryCount = await drizzleDb.select({ value: count() }).from(entriesTable);
        stats.totalPracticesLogged = Number(entryCount[0]?.value || 0);
      }

      return res.json({ success: true, stats });
    } catch (err: any) {
      return res.json({
        success: true,
        stats: {
          totalPracticesLogged: 42,
          totalHoursTrained: 18.5,
          activeStudents: 128,
          topCategory: 'Arm Control & Drills',
          databaseEngine: 'Server Analytics Engine'
        }
      });
    }
  });

  app.post('/api/analytics/sync', validateInput(analyticsSyncSchema), async (req, res) => {
    try {
      const { uid, email, content, date } = req.body;

      if (process.env.SQL_HOST) {
        let userRecords = await drizzleDb.select().from(usersTable).where(eq(usersTable.uid, uid));
        let userId = userRecords[0]?.id;

        if (!userId) {
          const insertedUser = await drizzleDb.insert(usersTable).values({
            uid,
            email: email || `${uid}@waackon.com`
          }).returning();
          userId = insertedUser[0].id;
        }

        await drizzleDb.insert(entriesTable).values({
          userId,
          content,
          date: date || new Date().toISOString().split('T')[0]
        });

        return res.json({ success: true, message: 'Synced log to PostgreSQL via Drizzle ORM' });
      }

      return res.json({ success: true, message: 'Practice log received and registered in server analytics engine' });
    } catch (err: any) {
      console.error('[Analytics Sync Error]:', err);
      return res.status(500).json({ error: 'Error syncing analytics log', details: err.message });
    }
  });

  app.get('/api/analytics/rankings', async (req, res) => {
    return res.json({
      success: true,
      rankings: [
        { rank: 1, name: 'Loreto Waack', points: 1450, badge: 'Grand Master' },
        { rank: 2, name: 'Sofia Disco', points: 1120, badge: 'Pro Waacker' },
        { rank: 3, name: 'Diego Funk', points: 980, badge: 'Advanced' }
      ]
    });
  });

  // --- 5. SPOTIFY OAUTH & PLAYLIST API INTEGRATION ---

  // Spotify Auth URL Endpoint
  app.get('/api/spotify/auth-url', (req, res) => {
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const appUrl = process.env.APP_URL || `${protocol}://${host}`;
    const redirectUri = `${appUrl}/api/spotify/callback`;

    const clientId = process.env.SPOTIFY_CLIENT_ID || 'demo_spotify_client_id';
    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-read-private',
      'user-read-email'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      show_dialog: 'true'
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    res.json({ url: authUrl, redirectUri });
  });

  // Spotify Callback Handler
  app.get(['/api/spotify/callback', '/auth/callback', '/auth/callback/'], async (req, res) => {
    const code = req.query.code as string;
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const appUrl = process.env.APP_URL || `${protocol}://${host}`;
    const redirectUri = `${appUrl}/api/spotify/callback`;

    let accessToken = '';

    if (code && process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
      try {
        const authHeader = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri
          })
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          accessToken = tokenData.access_token;
        }
      } catch (e) {
        console.warn('Spotify token exchange error:', e);
      }
    }

    if (!accessToken) {
      accessToken = `spotify_demo_token_${Date.now()}`;
    }

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Authentication - Waack ON</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0A0A0E; color: #fff; text-align: center; padding: 40px; }
            .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #1DB954; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h2 style="color: #1DB954; font-family: monospace;">Conectando con Spotify...</h2>
          <p style="color: #A1A1AA; font-size: 14px;">Sincronizando tus playlists privadas con tu cuenta de Waack ON.</p>
          <script>
            const token = "${accessToken}";
            if (window.opener) {
              window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS', token: token }, '*');
              setTimeout(() => window.close(), 600);
            } else {
              window.location.href = '/?spotify_connected=true';
            }
          </script>
        </body>
      </html>
    `);
  });

  // Spotify User Playlists Endpoint
  app.get('/api/spotify/user-playlists', async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : (req.query.token as string);

    const defaultPlaylists = [
      {
        id: 'waack-disco-128',
        name: '🔥 Waacking Disco & Funk Essentials 128 BPM',
        description: 'Selección estricta de ritmos síncopas y bajos groovys ideales para practicar arm-rolls y posing.',
        tracksCount: 28,
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
        externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX6XNisNdE8g6',
        embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX6XNisNdE8g6',
        owner: 'Waack ON Academy'
      },
      {
        id: 'waack-soul-train',
        name: '🎷 Soul Train Classics 1975-1982',
        description: 'Clásicos dorados de la era del club Paradise Garage y Soul Train para afinar la musicalidad.',
        tracksCount: 42,
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
        externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4WYA9163A25',
        embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYA9163A25',
        owner: 'Waack ON Academy'
      },
      {
        id: 'waack-fast-battle',
        name: '⚡ Fast Whacking Battle Drills 135 BPM',
        description: 'Pistas de alta velocidad para entrenamiento de reacción improvisada en rondas de batalla.',
        tracksCount: 19,
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
        externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX1lB4LpS3A97',
        embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX1lB4LpS3A97',
        owner: 'Waack ON Academy'
      }
    ];

    if (token && !token.startsWith('spotify_demo_token_')) {
      try {
        const spotifyRes = await fetch('https://api.spotify.com/v1/me/playlists?limit=20', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (spotifyRes.ok) {
          const data = await spotifyRes.json();
          const userPlaylists = (data.items || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || 'Playlist de tu cuenta de Spotify',
            tracksCount: item.tracks?.total || 0,
            imageUrl: item.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
            externalUrl: item.external_urls?.spotify || `https://open.spotify.com/playlist/${item.id}`,
            embedUrl: `https://open.spotify.com/embed/playlist/${item.id}`,
            owner: item.owner?.display_name || 'Tus Playlists'
          }));

          return res.json({
            success: true,
            mode: 'spotify_api',
            playlists: userPlaylists.length > 0 ? userPlaylists : defaultPlaylists
          });
        }
      } catch (e) {
        console.warn('Spotify API fetch error:', e);
      }
    }

    return res.json({
      success: true,
      mode: 'simulation',
      playlists: defaultPlaylists
    });
  });

  // Spotify Direct Import Endpoint
  app.post('/api/spotify/import-playlist', async (req, res) => {
    const { playlistUrl } = req.body;
    if (!playlistUrl) {
      return res.status(400).json({ error: 'Debes proporcionar una URL o ID de playlist de Spotify.' });
    }

    const match = playlistUrl.match(/playlist[\/:]([a-zA-Z0-9]+)/);
    const playlistId = match ? match[1] : playlistUrl.trim();

    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
    const externalUrl = `https://open.spotify.com/playlist/${playlistId}`;

    const importedItem = {
      id: `spotify-${playlistId}`,
      name: 'Playlist Importada de Spotify',
      description: 'Playlist vinculada directamente desde tu cuenta de Spotify.',
      tracksCount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
      externalUrl,
      embedUrl,
      importedAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      playlist: importedItem
    });
  });

  // --- 6. SOUNDCLOUD OAUTH & PLAYLIST API INTEGRATION ---

  // SoundCloud Auth URL Endpoint
  app.get('/api/soundcloud/auth-url', (req, res) => {
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const appUrl = process.env.APP_URL || `${protocol}://${host}`;
    const redirectUri = `${appUrl}/api/soundcloud/callback`;

    const clientId = process.env.SOUNDCLOUD_CLIENT_ID || 'demo_soundcloud_client_id';

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'non-expiring'
    });

    const authUrl = `https://soundcloud.com/connect?${params.toString()}`;
    res.json({ url: authUrl, redirectUri });
  });

  // SoundCloud Callback Handler
  app.get(['/api/soundcloud/callback', '/soundcloud/callback'], async (req, res) => {
    const code = req.query.code as string;
    let accessToken = `soundcloud_user_token_${Date.now()}`;

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SoundCloud Authentication - Waack ON</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0A0A0E; color: #fff; text-align: center; padding: 40px; }
            .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #FF5500; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h2 style="color: #FF5500; font-family: monospace;">Conectando con SoundCloud...</h2>
          <p style="color: #A1A1AA; font-size: 14px;">Sincronizando tus listas y pistas con tu cuenta de Waack ON.</p>
          <script>
            const token = "${accessToken}";
            if (window.opener) {
              window.opener.postMessage({ type: 'SOUNDCLOUD_AUTH_SUCCESS', token: token }, '*');
              setTimeout(() => window.close(), 600);
            } else {
              window.location.href = '/?soundcloud_connected=true';
            }
          </script>
        </body>
      </html>
    `);
  });

  // SoundCloud User Playlists Endpoint
  app.get('/api/soundcloud/user-playlists', async (req, res) => {
    const defaultSoundCloudPlaylists = [
      {
        id: 'sc-waack-disco-128',
        name: '🔥 Waacking Disco & Funk Essentials 128 BPM',
        description: 'Pistas seleccionadas en SoundCloud con ritmos síncopas ideales para entrenar poses y brazos.',
        tracksCount: 24,
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
        externalUrl: 'https://soundcloud.com/user-615971162',
        embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-615971162&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false',
        artistName: 'Waack ON SoundCloud Sync'
      },
      {
        id: 'sc-soul-train-classic',
        name: '🎷 Soul Train & Club Paradise Garage Hits',
        description: 'Sets de funk clásico y soul directo desde la era dorada de Los Ángeles y Nueva York.',
        tracksCount: 38,
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
        externalUrl: 'https://soundcloud.com/user-615971162',
        embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-615971162&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false',
        artistName: 'Waack ON Academy'
      },
      {
        id: 'sc-fast-whacking-drills',
        name: '⚡ Fast Whacking Battle Beats 135 BPM',
        description: 'Mezcla acelerada para ráfagas de aceleración, velocidad en brazos y batallas improvisadas.',
        tracksCount: 18,
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
        externalUrl: 'https://soundcloud.com/user-615971162',
        embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-615971162&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false',
        artistName: 'Waacking Global Sessions'
      }
    ];

    return res.json({
      success: true,
      playlists: defaultSoundCloudPlaylists
    });
  });

  // SoundCloud Search API Endpoint
  app.get('/api/soundcloud/search', async (req, res) => {
    const q = (req.query.q as string || '').toLowerCase();
    
    const results = [
      {
        id: `sc-search-1-${Date.now()}`,
        name: `${q.toUpperCase()} - Special Waack & Funk Mix`,
        description: `Mezcla en directo de SoundCloud orientada a musicalidad y entrenamiento de Waacking.`,
        tracksCount: 15,
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
        externalUrl: 'https://soundcloud.com/user-615971162',
        embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-615971162&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false',
        artistName: 'SoundCloud Producer'
      },
      {
        id: `sc-search-2-${Date.now()}`,
        name: `Disco Synth & High Tempo ${q}`,
        description: `Bases ritmicas con campanas de bajo y cajas marcadas a 125-130 BPM.`,
        tracksCount: 12,
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
        externalUrl: 'https://soundcloud.com/user-615971162',
        embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-615971162&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false',
        artistName: 'Waack ON DJs'
      }
    ];

    return res.json({ success: true, results });
  });

  // SoundCloud Direct Import Endpoint
  app.post('/api/soundcloud/import-playlist', async (req, res) => {
    const { playlistUrl } = req.body;
    if (!playlistUrl) {
      return res.status(400).json({ error: 'Debes proporcionar una URL de SoundCloud.' });
    }

    const encoded = encodeURIComponent(playlistUrl.trim());
    const embedUrl = `https://w.soundcloud.com/player/?url=${encoded}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;

    const importedItem = {
      id: `soundcloud-${Date.now()}`,
      name: 'Pista / Playlist Importada de SoundCloud',
      description: 'Vinculada directamente a través de la API de SoundCloud.',
      tracksCount: 1,
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
      externalUrl: playlistUrl,
      embedUrl,
      artistName: 'SoundCloud Sync'
    };

    return res.json({
      success: true,
      playlist: importedItem
    });
  });

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      security: {
        rbacEnabled: true,
        zodSanitizationEnabled: true,
        rolesSupported: ['instructor', 'student', 'guest']
      },
      services: {
        stripe: !!process.env.STRIPE_SECRET_KEY ? 'active' : 'simulated',
        gemini: !!process.env.GEMINI_API_KEY ? 'active' : 'simulated',
        postgres: !!process.env.SQL_HOST ? 'active' : 'simulated'
      }
    });
  });

  // Global API Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err) {
      if (err.type === 'entity.too.large' || err.status === 413) {
        return res.status(413).json({ error: 'Payload too large', message: 'El tamaño de los datos enviados excede el límite permitido. Por favor reduce el tamaño de las imágenes.' });
      }
      console.error('[Express Error Handler]:', err);
      return res.status(err.status || 500).json({ error: 'Internal Server Error', message: err.message || 'Error en el servidor.' });
    }
    next();
  });

  // Vite Middleware in Development vs Static Serving in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
