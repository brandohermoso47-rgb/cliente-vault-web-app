CREATE TABLE "spotify_connections" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"spotify_user_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"scope" text NOT NULL,
	"product" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "spotify_connections" ADD CONSTRAINT "spotify_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- RLS: solo el propio usuario (o el sistema) puede leer o escribir su conexión de Spotify.
-- Mismo modelo que stripe_customers en 0002_row_level_security.sql.
GRANT SELECT, INSERT, UPDATE, DELETE ON spotify_connections TO waackon_rt;
--> statement-breakpoint
ALTER TABLE spotify_connections ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE spotify_connections FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY spotify_connections_select ON spotify_connections FOR SELECT TO waackon_rt USING (user_id = app_uid() OR app_is_system());
--> statement-breakpoint
CREATE POLICY spotify_connections_insert ON spotify_connections FOR INSERT TO waackon_rt WITH CHECK (user_id = app_uid() OR app_is_system());
--> statement-breakpoint
CREATE POLICY spotify_connections_update ON spotify_connections FOR UPDATE TO waackon_rt USING (user_id = app_uid() OR app_is_system()) WITH CHECK (user_id = app_uid() OR app_is_system());
--> statement-breakpoint
CREATE POLICY spotify_connections_delete ON spotify_connections FOR DELETE TO waackon_rt USING (user_id = app_uid() OR app_is_system());
