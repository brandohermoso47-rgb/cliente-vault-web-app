def edit(path, fn):
    s = open(path, encoding='utf8').read()
    s = fn(s)
    open(path, 'w', encoding='utf8').write(s)

def must(s, a, b, count=1):
    assert s.count(a) >= 1, 'no encontrado: ' + a[:90]
    return s.replace(a, b, count)

# ── ruta ────────────────────────────────────────────────────────────────────────────────────────
def main(s):
    s = must(s, "import Privacy from './screens/Privacy';", "import Privacy from './screens/Privacy';\nimport Terms from './screens/Terms';")
    s = must(s, "createRoot(document.getElementById('root')!).render(path === '/privacidad' ? <Privacy /> : <App />);",
                "createRoot(document.getElementById('root')!).render(path === '/privacidad' ? <Privacy /> : path === '/terminos' ? <Terms /> : <App />);")
    return s
edit('src/main.tsx', main)

# ── versión de los términos y registro de aceptación ────────────────────────────────────────────
edit('src/lib/validators.ts', lambda s: s + "\n// Versión vigente de los Términos de servicio (src/screens/Terms.tsx). Cámbiala cuando el texto cambie de forma importante.\nexport const TERMS_VERSION = '2026-09-21';\n")

def session(s):
    s = must(s, "  application?: Record<string, unknown> | null;\n};", "  application?: Record<string, unknown> | null;\n  terms?: string | null; // versión de los términos aceptada en el registro\n};")
    s = must(s, "export const pending: PendingSignup = { profile: null, application: null };", "export const pending: PendingSignup = { profile: null, application: null, terms: null };")
    s = must(s, "  const out = { profile: pending.profile ?? null, application: pending.application ?? null };\n  pending.profile = null;\n  pending.application = null;",
                "  const out = { profile: pending.profile ?? null, application: pending.application ?? null, terms: pending.terms ?? null };\n  pending.profile = null;\n  pending.application = null;\n  pending.terms = null;")
    return s
edit('src/lib/session.ts', session)

LINKS = ('<span>He leído y acepto los <a href="/terminos" target="_blank" rel="noopener noreferrer" style={S.link}>Términos de servicio</a> y la '
         '<a href="/privacidad" target="_blank" rel="noopener noreferrer" style={S.link}>Política de privacidad</a>')

def register(s):
    s = must(s, "import { emailOk, handleOk, passwordOk, PASSWORD_HELP } from '../lib/validators';", "import { emailOk, handleOk, passwordOk, PASSWORD_HELP, TERMS_VERSION } from '../lib/validators';")
    s = must(s, '<span>He leído y acepto la <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={S.link}>Política de privacidad</a> de Waack On.</span>', LINKS + ' de Waack On.</span>')
    s = must(s, "Debes aceptar la política de privacidad.", "Debes aceptar los términos de servicio y la política de privacidad.")
    s = must(s, "    setBusy(true);\n    pending.profile =", "    setBusy(true);\n    pending.terms = TERMS_VERSION;\n    pending.profile =")
    s = must(s, "      pending.profile = null;\n      setErr(authMessage(ex));", "      pending.profile = null;\n      pending.terms = null;\n      setErr(authMessage(ex));")
    return s
edit('src/screens/Register.tsx', register)

def pro(s):
    s = must(s, "import { emailOk, passwordOk, PASSWORD_HELP } from '../lib/validators';", "import { emailOk, passwordOk, PASSWORD_HELP, TERMS_VERSION } from '../lib/validators';")
    s = must(s, '<span>He leído y acepto la <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={S.link}>Política de privacidad</a> y confirmo que los datos son verdaderos.</span>', LINKS + ' y confirmo que los datos son verdaderos.</span>')
    s = must(s, "Debes aceptar la política de privacidad.", "Debes aceptar los términos de servicio y la política de privacidad.")
    s = must(s, "        pending.profile = { displayName: application.contactName,", "        pending.terms = TERMS_VERSION;\n        pending.profile = { displayName: application.contactName,")
    s = must(s, "      pending.profile = null;\n      pending.application = null;\n", "      pending.profile = null;\n      pending.application = null;\n      pending.terms = null;\n")
    return s
edit('src/screens/RegisterPro.tsx', pro)

# ── el frontend envía la versión aceptada a la API ──────────────────────────────────────────────
edit('tools/patches-payments.mjs', lambda s: must(s, "    if (p.application) body.application = p.application;", "    if (p.application) body.application = p.application;\n    if (p.terms) body.termsVersion = p.terms;"))

# ── enlace en el login ──────────────────────────────────────────────────────────────────────────
def tpl(s):
    a = '<a href="/privacidad" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:rgba(226,231,255,.6);text-decoration:underline;text-underline-offset:3px">Política de privacidad</a>'
    assert s.count(a) == 1
    b = '<a href="/terminos" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:rgba(226,231,255,.6);text-decoration:underline;text-underline-offset:3px">Términos de servicio</a><span style="color:rgba(226,231,255,.35)"> · </span>' + a
    return s.replace(a, b, 1)
edit('tools/template.html', tpl)

# ── API: columnas de aceptación de términos ─────────────────────────────────────────────────────
def schema(s):
    return must(s, "  role: userRole('role').notNull().default('usuario'),\n  createdAt: createdAt(),",
                   "  role: userRole('role').notNull().default('usuario'),\n  termsVersion: text('terms_version'), // versión de los Términos de servicio que aceptó al registrarse\n  termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true }),\n  createdAt: createdAt(),")
edit('api/src/db/schema.ts', schema)

def users(s):
    s = must(s, "  application: applicationBody.optional(),\n});\n\nconst patchBody", "  application: applicationBody.optional(),\n  termsVersion: z.string().trim().regex(/^\\d{4}-\\d{2}-\\d{2}$/).optional(), // p. ej. 2026-09-21\n});\n\nconst patchBody")
    s = must(s, "        photoUrl: t.picture ?? null,\n      }).onConflictDoNothing", "        photoUrl: t.picture ?? null,\n        ...(body.termsVersion ? { termsVersion: body.termsVersion, termsAcceptedAt: new Date() } : {}),\n      }).onConflictDoNothing")
    return s
edit('api/src/routes/users.ts', users)
print('OK')
