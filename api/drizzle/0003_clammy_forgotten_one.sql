CREATE TABLE "instructor_pricing" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"price_monthly_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'usd' NOT NULL,
	"stripe_product_id" text,
	"stripe_monthly_price_id" text,
	"stripe_yearly_price_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "instructor_pricing" ADD CONSTRAINT "instructor_pricing_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- RLS: el precio de cada instructor lo lee cualquiera (directorio público); solo el propio instructor
-- (o el sistema) lo escribe. Mismo modelo que 0002_row_level_security.sql.
GRANT SELECT, INSERT, UPDATE, DELETE ON instructor_pricing TO waackon_rt;
--> statement-breakpoint
ALTER TABLE instructor_pricing ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE instructor_pricing FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY instructor_pricing_select ON instructor_pricing FOR SELECT TO waackon_rt USING (true);
--> statement-breakpoint
CREATE POLICY instructor_pricing_insert ON instructor_pricing FOR INSERT TO waackon_rt WITH CHECK (user_id = app_uid() OR app_is_system());
--> statement-breakpoint
CREATE POLICY instructor_pricing_update ON instructor_pricing FOR UPDATE TO waackon_rt USING (user_id = app_uid() OR app_is_system()) WITH CHECK (user_id = app_uid() OR app_is_system());
--> statement-breakpoint
CREATE POLICY instructor_pricing_delete ON instructor_pricing FOR DELETE TO waackon_rt USING (app_is_admin());