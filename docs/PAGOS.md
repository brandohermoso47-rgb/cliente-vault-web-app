# Pagos globales (Stripe + Stripe Connect)

Waack On cobra con **Stripe Checkout** (suscripciones) y reparte con **Stripe Connect** el dinero de cada
instructor o estudio. El cobro y los datos de tarjeta viven en Stripe; el servidor (Cloud Functions) solo crea
sesiones de pago y recibe avisos (webhook). El estado de las suscripciones lo escribe **únicamente el servidor**.

## Qué medios de pago verá cada persona
Stripe Checkout muestra automáticamente los métodos que aplican al **país y moneda** de cada cliente
(tarjetas, Apple Pay / Google Pay, PIX, OXXO, SEPA, iDEAL, Bancontact, etc.). Se activan en
*Stripe Dashboard → Configuración → Métodos de pago*. Para cobrar en moneda local activa **Adaptive Pricing**
(Dashboard → Configuración → Checkout) o define precios multimoneda en cada Price (`currency_options`).

## Pasos (una sola vez)

1. **Cuenta de Stripe** activada para tu país, con **Connect** habilitado (tipo *Express*) y, si vendes en la UE/UK/otros,
   **Stripe Tax** activado (Dashboard → Impuestos).
2. **Productos y precios** (modo test primero). Crea, con precio **mensual y anual** cada uno:
   - `Escuela completa` (suscripción a la plataforma).
   - `Una cátedra` (suscripción a un instructor).
3. **Catálogo en Firestore** (colección `plans`, documentos creados por un admin en la consola):

   | Documento | Campos |
   | --- | --- |
   | `plans/escuela` | `kind: "platform"`, `active: true`, `prices: { month: "price_…", year: "price_…" }`, `automaticTax: true` |
   | `plans/catedra` | `kind: "instructor"`, `active: true`, `prices: { month: "price_…", year: "price_…" }`, `feePercent: <número>`, `automaticTax: true` |

   `feePercent` es el % que se queda Waack On de cada suscripción a un instructor (decisión tuya; no hay valor por defecto).
4. **Secretos** (los introduces tú en tu terminal; nunca se guardan en el repositorio):
   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY --project buoyant-objective-fwjkk
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project buoyant-objective-fwjkk
   ```
5. **Desplegar solo las funciones de pagos** (no uses `--only functions` a secas: podría ofrecer borrar `function-1`):
   ```bash
   firebase deploy --only functions:createCheckoutSession,functions:createPortalSession,functions:createConnectOnboarding,functions:stripeWebhook --project buoyant-objective-fwjkk
   ```
6. **Webhook**: en Stripe → Desarrolladores → Webhooks, crea un endpoint apuntando a la URL de `stripeWebhook`
   que muestra el despliegue, con los eventos `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted` y `account.updated` (activa *Eventos de cuentas conectadas* para este último).
   Copia el *Signing secret* al paso 4 (`STRIPE_WEBHOOK_SECRET`) y vuelve a desplegar.
7. **Probar** con tarjetas de prueba de Stripe antes de pasar a modo real (cambia `STRIPE_SECRET_KEY` y el `price_…` de cada plan).

## Flujo
- **Suscribirse:** Planes → botón → `createCheckoutSession` → Stripe Checkout → webhook → `subscriptions/{id}` → la app lo refleja.
- **Instructor cobra:** Mi cuenta → *Configurar cobros* → `createConnectOnboarding` → Stripe (datos fiscales y bancarios) → `payoutAccounts/{uid}`.
- **Gestionar/cancelar/facturas:** Mi cuenta → *Gestionar suscripciones* → Portal de facturación de Stripe.

## Pendiente de decidir
- Precios reales por plan (el diseño muestra 19 € y 39 € como referencia) y `feePercent`.
- Política de reembolsos e impuestos por país (Stripe Tax calcula, tú registras el IVA/GST donde corresponda).
- El acceso a contenido de pago **todavía no se bloquea en el servidor**: hoy la interfaz refleja las suscripciones,
  pero los cursos no están protegidos por reglas. Hay que protegerlos (Firestore/Storage) antes de vender.
