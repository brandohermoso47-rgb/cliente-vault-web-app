-- ROW LEVEL SECURITY para todas las tablas.
-- La base de datos decide qué filas ve y modifica cada persona, aunque una ruta de la API olvide filtrar.
--
-- Modelo:
--   * La API abre una transacción por petición, hace SET LOCAL ROLE waackon_rt (rol sin privilegios, sin BYPASSRLS)
--     y fija dos variables: app.user_id (quién es) y app.role ('user' | 'admin' | 'system').
--   * 'user'  → cada persona (usuario, instructor, estudio) solo ve y toca SUS filas.
--   * 'admin' → además gestiona usuarios, solicitudes y planes. NO ve pagos, suscripciones ni cuentas de cobro ajenas.
--   * 'system'→ solo código interno de confianza (inicio de sesión, webhook de Stripe).
--   * Sin variables (una consulta olvidada sin contexto) → no ve nada (falla cerrado).

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'waackon_rt') THEN
    CREATE ROLE waackon_rt NOLOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
END $$;
--> statement-breakpoint
GRANT waackon_rt TO CURRENT_USER;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO waackon_rt;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO waackon_rt;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO waackon_rt;
--> statement-breakpoint

-- ── Funciones de contexto ──────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION app_uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('app.user_id', true), '')::uuid
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT coalesce(nullif(current_setting('app.role', true), ''), 'none')
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_is_admin() RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT app_role() IN ('admin', 'system')
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_is_system() RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT app_role() = 'system'
$$;
--> statement-breakpoint

-- ── Activar RLS (también para el dueño de las tablas) ──────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE users FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE applications FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE plans FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE stripe_customers FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE payout_accounts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE payout_accounts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE payments FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE stripe_events FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

-- ── users: cada persona ve y edita solo su fila; el admin gestiona usuarios; el alta la hace el sistema ──
CREATE POLICY users_select ON users FOR SELECT TO waackon_rt USING (id = app_uid() OR app_is_admin());
--> statement-breakpoint
CREATE POLICY users_insert ON users FOR INSERT TO waackon_rt WITH CHECK (app_is_system());
--> statement-breakpoint
CREATE POLICY users_update ON users FOR UPDATE TO waackon_rt USING (id = app_uid() OR app_is_admin()) WITH CHECK (id = app_uid() OR app_is_admin());
--> statement-breakpoint
CREATE POLICY users_delete ON users FOR DELETE TO waackon_rt USING (app_is_admin());
--> statement-breakpoint

-- ── applications: solicitud propia (siempre "pendiente"); solo el admin la resuelve ──
CREATE POLICY applications_select ON applications FOR SELECT TO waackon_rt USING (user_id = app_uid() OR app_is_admin());
--> statement-breakpoint
CREATE POLICY applications_insert ON applications FOR INSERT TO waackon_rt
  WITH CHECK ((user_id = app_uid() AND status = 'pendiente' AND reviewed_by IS NULL AND reviewed_at IS NULL) OR app_is_system());
--> statement-breakpoint
CREATE POLICY applications_update ON applications FOR UPDATE TO waackon_rt USING (app_is_admin()) WITH CHECK (app_is_admin());
--> statement-breakpoint
CREATE POLICY applications_delete ON applications FOR DELETE TO waackon_rt USING (app_is_admin());
--> statement-breakpoint

-- ── plans: catálogo legible por todos; solo el admin lo cambia ──
CREATE POLICY plans_select ON plans FOR SELECT TO waackon_rt USING (true);
--> statement-breakpoint
CREATE POLICY plans_insert ON plans FOR INSERT TO waackon_rt WITH CHECK (app_is_admin());
--> statement-breakpoint
CREATE POLICY plans_update ON plans FOR UPDATE TO waackon_rt USING (app_is_admin()) WITH CHECK (app_is_admin());
--> statement-breakpoint
CREATE POLICY plans_delete ON plans FOR DELETE TO waackon_rt USING (app_is_admin());
--> statement-breakpoint

-- ── Datos de dinero: solo la propia persona (ni siquiera el admin ve los de otras); escribe el sistema ──
CREATE POLICY stripe_customers_select ON stripe_customers FOR SELECT TO waackon_rt USING (user_id = app_uid() OR app_is_system());
--> statement-breakpoint
CREATE POLICY stripe_customers_insert ON stripe_customers FOR INSERT TO waackon_rt WITH CHECK (user_id = app_uid() OR app_is_system());
--> statement-breakpoint
CREATE POLICY stripe_customers_update ON stripe_customers FOR UPDATE TO waackon_rt USING (app_is_system()) WITH CHECK (app_is_system());
--> statement-breakpoint
CREATE POLICY stripe_customers_delete ON stripe_customers FOR DELETE TO waackon_rt USING (app_is_system());
--> statement-breakpoint

CREATE POLICY payout_accounts_select ON payout_accounts FOR SELECT TO waackon_rt USING (user_id = app_uid() OR app_is_system());
--> statement-breakpoint
CREATE POLICY payout_accounts_insert ON payout_accounts FOR INSERT TO waackon_rt WITH CHECK (user_id = app_uid() OR app_is_system());
--> statement-breakpoint
CREATE POLICY payout_accounts_update ON payout_accounts FOR UPDATE TO waackon_rt USING (app_is_system()) WITH CHECK (app_is_system());
--> statement-breakpoint
CREATE POLICY payout_accounts_delete ON payout_accounts FOR DELETE TO waackon_rt USING (app_is_system());
--> statement-breakpoint

CREATE POLICY subscriptions_select ON subscriptions FOR SELECT TO waackon_rt USING (user_id = app_uid() OR app_is_system());
--> statement-breakpoint
CREATE POLICY subscriptions_insert ON subscriptions FOR INSERT TO waackon_rt WITH CHECK (app_is_system());
--> statement-breakpoint
CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE TO waackon_rt USING (app_is_system()) WITH CHECK (app_is_system());
--> statement-breakpoint
CREATE POLICY subscriptions_delete ON subscriptions FOR DELETE TO waackon_rt USING (app_is_system());
--> statement-breakpoint

CREATE POLICY payments_select ON payments FOR SELECT TO waackon_rt USING (user_id = app_uid() OR app_is_system());
--> statement-breakpoint
CREATE POLICY payments_insert ON payments FOR INSERT TO waackon_rt WITH CHECK (app_is_system());
--> statement-breakpoint
CREATE POLICY payments_update ON payments FOR UPDATE TO waackon_rt USING (app_is_system()) WITH CHECK (app_is_system());
--> statement-breakpoint
CREATE POLICY payments_delete ON payments FOR DELETE TO waackon_rt USING (app_is_system());
--> statement-breakpoint

-- ── Eventos de Stripe: solo el sistema ──
CREATE POLICY stripe_events_all ON stripe_events FOR ALL TO waackon_rt USING (app_is_system()) WITH CHECK (app_is_system());
--> statement-breakpoint

-- ── Nadie se cambia el rol a sí mismo, ni cambia su identidad (RLS no puede comparar valor viejo y nuevo: lo hace un disparador) ──
CREATE OR REPLACE FUNCTION users_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.firebase_uid IS DISTINCT FROM OLD.firebase_uid THEN
    RAISE EXCEPTION 'La identidad de un usuario no se puede cambiar' USING ERRCODE = '42501';
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT app_is_admin() THEN
    RAISE EXCEPTION 'No puedes cambiar tu propio rol' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER users_guard_trg BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION users_guard();
