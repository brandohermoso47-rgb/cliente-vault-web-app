CREATE TABLE "figure_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" text NOT NULL,
	"effect_type" text NOT NULL,
	"side" varchar(1),
	"start_ms" integer NOT NULL,
	"end_ms" integer NOT NULL,
	"params" jsonb NOT NULL,
	"color" varchar(7),
	"created_by" uuid NOT NULL,
	"edited_manually" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "figure_events_range" CHECK ("figure_events"."start_ms" >= 0 AND "figure_events"."end_ms" > "figure_events"."start_ms")
);
--> statement-breakpoint
ALTER TABLE "figure_events" ADD CONSTRAINT "figure_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "figure_events_class_owner_idx" ON "figure_events" USING btree ("class_id","created_by");--> statement-breakpoint

-- RLS: cada instructor ve y modifica solo las figuras que creó; el admin puede leerlas.
-- Sin contexto no se ve nada. Mismo modelo que 0002_row_level_security.sql.
GRANT SELECT, INSERT, UPDATE, DELETE ON figure_events TO waackon_rt;
--> statement-breakpoint
ALTER TABLE figure_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE figure_events FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY figure_events_select ON figure_events FOR SELECT TO waackon_rt USING (created_by = app_uid() OR app_is_admin());
--> statement-breakpoint
CREATE POLICY figure_events_insert ON figure_events FOR INSERT TO waackon_rt WITH CHECK (created_by = app_uid());
--> statement-breakpoint
CREATE POLICY figure_events_update ON figure_events FOR UPDATE TO waackon_rt USING (created_by = app_uid()) WITH CHECK (created_by = app_uid());
--> statement-breakpoint
CREATE POLICY figure_events_delete ON figure_events FOR DELETE TO waackon_rt USING (created_by = app_uid());
