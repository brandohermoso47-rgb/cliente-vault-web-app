# Payment Security Audit - Status Report

**Session**: claude/compassionate-bell-9fctl0  
**Date**: 2026-09-29  
**Status**: 5/5 P0 vectors closed (client-side + Firestore)

## What was done today

### PASO 1: Client-side role/billing writes eliminated ✅
**File**: `src/views/InstructorNew.tsx`

- `handleBecomeInstructor()`: Removed `role: 'instructor'` write → shows approval pending msg
- `handleRevertToStudent()`: Removed `role: 'student'` write → shows server message
- `handleCheckoutSubmit()`: Removed `billingStatus: 'active'` write → now calls `/api/billing/checkout`
- `handleCancelSubscription()`: Removed `billingStatus: 'cancelled'` write → now calls `/api/billing/portal`
- Line 5240: Button handler removed billing writes → calls `/api/billing/portal`

**Impact**: Client can no longer activate its own subscription. Checkout now requires Stripe session with `mode: 'stripe'`.

### PASO 2: Payment simulator verification ✅
**Result**: No `/api/webhook/simulate-payment` endpoint exists in the backend.  
**Status**: ✅ Simulator does not exist; nothing to delete.

### PASO 3: Stripe error handling verification ✅
**File**: `api/src/routes/billing.ts`  
**Status**: ✅ Already implemented. All payment endpoints use `needStripe(deps)` which returns HTTP 503 if `STRIPE_SECRET_KEY` is missing.

No changes needed.

### PASO 4: Firestore rules hardened ✅
**File**: `firestore.rules`

Added blocklist to prevent client from writing these fields:
- `role` (already checked, but now part of diff-based validation)
- `billingStatus` 
- `subscriptionTier`
- `subscribedInstructorIds`
- `instructorSubscriptionStatus`
- `isFeaturedInstructor`
- `featuredPlan`
- `featuredExpiry`
- `stripeCustomerId`
- `stripeAccountId`
- `isConnectVerified`

**New rule logic**: 
```
allow update: if (isOwner(userId)
    && !request.resource.data.diff(resource.data).affectedKeys()
         .hasAny(['role', 'billingStatus', ...]) 
    && only([...editable fields...])
    ...)
```

These fields can only be written by Admin SDK (webhook), never from client.

### Tests added ✅
**File**: `rules-tests/run.mjs`

Added 8 new test cases:
- deny NO puede escribir billingStatus
- deny NO puede escribir stripeCustomerId
- deny NO puede escribir stripeAccountId
- deny NO puede escribir subscriptionTier
- deny NO puede escribir isFeaturedInstructor
- deny NO puede escribir featuredPlan
- deny NO puede escribir instructorSubscriptionStatus
- (existing) deny NO puede subirse el rol a admin

These tests will fail if client ever tries to write these fields. **Run before deploying:**
```bash
npm run test:rules
```

### PASO 5: AI endpoints authentication ✅
**Result**: No AI endpoints found in current codebase.  
**Status**: Not applicable. If endpoints are added later, apply `requireAuth` middleware.

---

## Architecture Verified

- **Backend**: Express + PostgreSQL (source of truth) + Stripe
- **Frontend**: React SPA (read-only for role/billing; writes only via API)
- **Real-time**: Firestore (listeners only; role synced from backend webhook)
- **No duplicate backends**: `/api/` is the only backend; `/src/` contains only the React app

Role vocabulary is consistent across all layers:
- `usuario`, `instructor`, `estudio`, `admin`

---

## Remaining work (Semana 2 onwards)

### Higher priority (before opening registration)
1. **Plan catalog** (Fase 3 from original audit):
   - Verify catalog has all 4 plans: free, vip_student, academy, instructor
   - Add missing plans if needed
   - Ensure `feePercent` has no defaults; require explicit values

2. **Legal texts** (Fase 5):
   - Fill in: company name, tax ID, address, EU representative, fee%, applicable law
   - Change test in `src/screens/screens.test.tsx` from "at least 6 placeholders" to "zero placeholders"
   - Add landing footer links to `/terminos` and `/privacidad`

3. **Unify role vocabulary** (NUEVO 1 from yesterday):
   - Standardize on one role set (currently correct: `usuario`, `instructor`, `estudio`, `admin`)
   - Add migration test to firestore if old values exist

4. **Webhook handler** (Fase 4):
   - Verify `/api/v1/webhooks/stripe` handles all 5 events:
     - `customer.subscription.created|updated|deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `account.updated`
   - Verify it updates PostgreSQL → custom claim → Firestore listener

### Lower priority (Semana 3+)
- Panel de aprobación de solicitudes (exists in API, needs UI)
- Stripe Connect onboarding flow
- CI/staging environment

---

## What still can't be verified

Due to network policy (registry.npmjs.org blocked for npm ci):
- TypeScript type checking (`npx tsc --noEmit`)
- Linting
- Unit tests (`npm test`)

These should be run locally or in a CI/CD pipeline once registry access is restored.

---

## Next immediate steps (for you)

1. Run `npm run test:rules` to verify Firestore security tests pass
2. (Optional) Add the 4 missing plans to PostgreSQL schema if not present
3. Check if `/api/webhook/simulate-payment` endpoint is live in production (curl it)
4. Fill in legal text placeholders and update footer links
5. Decide on Stripe setup timing (key upload, webhook registration, etc.)

**Do NOT deploy** without:
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` set in Secret Manager
- Legal texts complete
- Firestore rules tests passing
