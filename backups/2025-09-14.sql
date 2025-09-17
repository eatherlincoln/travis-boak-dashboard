

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_current_user_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_current_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name','User'),
    'athlete'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Default platform stats rows for new users
  INSERT INTO public.platform_stats (user_id, platform, follower_count, monthly_views, engagement_rate) VALUES
    (NEW.id,'instagram',38700,730000,8.2),
    (NEW.id,'youtube',   8800, 86800,6.5),
    (NEW.id,'tiktok',     1410, 37000,9.1)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_role_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.role_change_log (user_id, old_role, new_role, changed_by)
    VALUES (NEW.id, OLD.role, NEW.role, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_role_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_analytics_public"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  INSERT INTO public.analytics_public AS ap (source, metric, value, updated_at)
  VALUES (NEW.source, NEW.metric, NEW.value, COALESCE(NEW.updated_at, now()))
  ON CONFLICT (source, metric)
  DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = EXCLUDED.updated_at;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_analytics_public"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_instagram_posts_public"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  INSERT INTO public.instagram_posts_public AS p (
    media_id, caption, permalink, media_url, like_count, comment_count, reach, saves, timestamp, updated_at
  )
  VALUES (
    NEW.media_id, NEW.caption, NEW.permalink, NEW.media_url,
    NEW.like_count, NEW.comment_count, NEW.reach, NEW.saves,
    NEW.timestamp, COALESCE(NEW.updated_at, now())
  )
  ON CONFLICT (media_id) DO UPDATE SET
    caption       = EXCLUDED.caption,
    permalink     = EXCLUDED.permalink,
    media_url     = EXCLUDED.media_url,
    like_count    = EXCLUDED.like_count,
    comment_count = EXCLUDED.comment_count,
    reach         = EXCLUDED.reach,
    saves         = EXCLUDED.saves,
    timestamp     = EXCLUDED.timestamp,
    updated_at    = EXCLUDED.updated_at;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_instagram_posts_public"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_asset_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_asset_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source" "text" NOT NULL,
    "metric" "text" NOT NULL,
    "value" numeric NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_public" (
    "source" "text" NOT NULL,
    "metric" "text" NOT NULL,
    "value" numeric NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."analytics_public" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instagram_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_url" "text" NOT NULL,
    "image_url" "text",
    "title" "text" NOT NULL,
    "content_type" "text" DEFAULT 'image'::"text",
    "likes_count" integer DEFAULT 0,
    "comments_count" integer DEFAULT 0,
    "shares_count" integer DEFAULT 0,
    "saves_count" integer DEFAULT 0,
    "reach_count" integer DEFAULT 0,
    "impressions_count" integer DEFAULT 0,
    "posted_at" timestamp with time zone,
    "hashtags" "text"[],
    "engagement_rate" numeric GENERATED ALWAYS AS (
CASE
    WHEN ("reach_count" > 0) THEN (((((("likes_count" + "comments_count") + COALESCE("shares_count", 0)) + COALESCE("saves_count", 0)))::numeric / ("reach_count")::numeric) * (100)::numeric)
    ELSE (0)::numeric
END) STORED,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "instagram_posts_content_type_check" CHECK (("content_type" = ANY (ARRAY['image'::"text", 'video'::"text", 'carousel'::"text", 'story'::"text"])))
);


ALTER TABLE "public"."instagram_posts" OWNER TO "postgres";


COMMENT ON TABLE "public"."instagram_posts" IS 'Individual Instagram post performance metrics and metadata';



CREATE TABLE IF NOT EXISTS "public"."instagram_posts_public" (
    "media_id" "text" NOT NULL,
    "caption" "text",
    "permalink" "text",
    "media_url" "text",
    "like_count" integer,
    "comment_count" integer,
    "reach" integer,
    "saves" integer,
    "timestamp" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."instagram_posts_public" REPLICA IDENTITY FULL;


ALTER TABLE "public"."instagram_posts_public" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."metrics_daily" (
    "id" bigint NOT NULL,
    "post_id" "uuid",
    "date" "date" NOT NULL,
    "views" bigint,
    "likes" bigint,
    "comments" bigint,
    "shares" bigint,
    "saves" bigint,
    "followers" bigint,
    "reach" bigint,
    "engagement_rate" numeric
);


ALTER TABLE "public"."metrics_daily" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."metrics_daily_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."metrics_daily_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."metrics_daily_id_seq" OWNED BY "public"."metrics_daily"."id";



CREATE TABLE IF NOT EXISTS "public"."platform_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "platform" "text" NOT NULL,
    "handle" "text" NOT NULL,
    "external_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "platform_accounts_platform_check" CHECK (("platform" = ANY (ARRAY['instagram'::"text", 'tiktok'::"text", 'youtube'::"text"])))
);


ALTER TABLE "public"."platform_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_audience" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "platform" "text" NOT NULL,
    "gender" "jsonb" DEFAULT '{"men": 88, "women": 12}'::"jsonb",
    "age_groups" "jsonb" DEFAULT '[{"range": "25-34", "percentage": 31}, {"range": "18-24", "percentage": 22}, {"range": "35-44", "percentage": 21}, {"range": "45-54", "percentage": 16}]'::"jsonb",
    "countries" "jsonb" DEFAULT '[{"country": "Australia", "percentage": 51}, {"country": "USA", "percentage": 10}, {"country": "Japan", "percentage": 6}, {"country": "Brazil", "percentage": 5}]'::"jsonb",
    "cities" "jsonb" DEFAULT '["Sydney", "Gold Coast", "Melbourne", "Sunshine Coast"]'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."platform_audience" REPLICA IDENTITY FULL;


ALTER TABLE "public"."platform_audience" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "platform" "text" NOT NULL,
    "follower_count" integer DEFAULT 0,
    "monthly_views" integer DEFAULT 0,
    "engagement_rate" numeric(5,2) DEFAULT 0,
    "additional_metrics" "jsonb" DEFAULT '{}'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_urls" "jsonb" DEFAULT '[]'::"jsonb"
);

ALTER TABLE ONLY "public"."platform_stats" REPLICA IDENTITY FULL;


ALTER TABLE "public"."platform_stats" OWNER TO "postgres";


COMMENT ON COLUMN "public"."platform_stats"."additional_metrics" IS 'Contains Instagram post URLs and other metrics';



COMMENT ON COLUMN "public"."platform_stats"."image_urls" IS 'Array of direct image URLs for thumbnails';



CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "platform" "text" NOT NULL,
    "external_id" "text" NOT NULL,
    "url" "text" NOT NULL,
    "published_at" timestamp with time zone,
    "thumbnail_url" "text"
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "role" "text" DEFAULT 'athlete'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_roles" CHECK (("role" = ANY (ARRAY['admin'::"text", 'athlete'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'User profile data. Email addresses are stored in auth.users for security.';



CREATE TABLE IF NOT EXISTS "public"."role_change_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "old_role" "text",
    "new_role" "text" NOT NULL,
    "changed_by" "uuid" NOT NULL,
    "changed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."role_change_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_media_assets" (
    "source" "text" NOT NULL,
    "thumb_path" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."social_media_assets" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_post_latest" AS
 SELECT DISTINCT ON ("m"."post_id") "m"."post_id",
    "m"."date",
    "m"."views",
    "m"."likes",
    "m"."comments",
    "m"."engagement_rate",
    "p"."platform",
    "p"."url",
    "p"."thumbnail_url"
   FROM ("public"."metrics_daily" "m"
     JOIN "public"."posts" "p" ON (("p"."id" = "m"."post_id")))
  ORDER BY "m"."post_id", "m"."date" DESC;


ALTER VIEW "public"."v_post_latest" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."youtube_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "channel_id" "text" NOT NULL,
    "subscriber_count" bigint,
    "view_count" bigint,
    "video_count" integer,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE ONLY "public"."youtube_stats" REPLICA IDENTITY FULL;


ALTER TABLE "public"."youtube_stats" OWNER TO "postgres";


ALTER TABLE ONLY "public"."metrics_daily" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."metrics_daily_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."analytics"
    ADD CONSTRAINT "analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_public"
    ADD CONSTRAINT "analytics_public_pkey" PRIMARY KEY ("source", "metric");



ALTER TABLE ONLY "public"."instagram_posts"
    ADD CONSTRAINT "instagram_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instagram_posts_public"
    ADD CONSTRAINT "instagram_posts_public_pkey" PRIMARY KEY ("media_id");



ALTER TABLE ONLY "public"."metrics_daily"
    ADD CONSTRAINT "metrics_daily_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_accounts"
    ADD CONSTRAINT "platform_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_audience"
    ADD CONSTRAINT "platform_audience_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_audience"
    ADD CONSTRAINT "platform_audience_user_id_platform_key" UNIQUE ("user_id", "platform");



ALTER TABLE ONLY "public"."platform_stats"
    ADD CONSTRAINT "platform_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_stats"
    ADD CONSTRAINT "platform_stats_user_id_platform_key" UNIQUE ("user_id", "platform");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_change_log"
    ADD CONSTRAINT "role_change_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_media_assets"
    ADD CONSTRAINT "social_media_assets_pkey" PRIMARY KEY ("source");



ALTER TABLE ONLY "public"."youtube_stats"
    ADD CONSTRAINT "youtube_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."youtube_stats"
    ADD CONSTRAINT "youtube_stats_user_channel_unique" UNIQUE ("user_id", "channel_id");



CREATE INDEX "idx_instagram_posts_user_engagement" ON "public"."instagram_posts" USING "btree" ("user_id", "engagement_rate" DESC);



CREATE INDEX "idx_youtube_stats_channel_id" ON "public"."youtube_stats" USING "btree" ("channel_id");



CREATE INDEX "idx_youtube_stats_updated_at" ON "public"."youtube_stats" USING "btree" ("updated_at");



CREATE OR REPLACE TRIGGER "role_change_audit" AFTER UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_role_change"();



CREATE OR REPLACE TRIGGER "trg_sync_analytics_public" AFTER INSERT OR UPDATE ON "public"."analytics" FOR EACH ROW EXECUTE FUNCTION "public"."sync_analytics_public"();



CREATE OR REPLACE TRIGGER "trg_sync_instagram_posts_public" AFTER INSERT OR UPDATE ON "public"."instagram_posts" FOR EACH ROW EXECUTE FUNCTION "public"."sync_instagram_posts_public"();



CREATE OR REPLACE TRIGGER "update_analytics_updated_at" BEFORE UPDATE ON "public"."analytics" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_instagram_posts_updated_at" BEFORE UPDATE ON "public"."instagram_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_platform_audience_updated_at" BEFORE UPDATE ON "public"."platform_audience" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_platform_stats_updated_at" BEFORE UPDATE ON "public"."platform_stats" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."metrics_daily"
    ADD CONSTRAINT "metrics_daily_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_stats"
    ADD CONSTRAINT "platform_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."youtube_stats"
    ADD CONSTRAINT "youtube_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can update any profile" ON "public"."profiles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."role" = 'admin'::"text")))));



CREATE POLICY "Deny anonymous access to analytics" ON "public"."analytics" TO "anon" USING (false);



CREATE POLICY "Deny anonymous access to instagram_posts" ON "public"."instagram_posts" TO "anon" USING (false);



CREATE POLICY "Deny anonymous access to platform_audience" ON "public"."platform_audience" TO "anon" USING (false);



CREATE POLICY "Deny anonymous access to platform_stats" ON "public"."platform_stats" TO "anon" USING (false);



CREATE POLICY "Deny anonymous access to profiles" ON "public"."profiles" TO "anon" USING (false);



CREATE POLICY "Deny anonymous access to youtube_stats" ON "public"."youtube_stats" TO "anon" USING (false);



CREATE POLICY "Only admins can delete YouTube stats" ON "public"."youtube_stats" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can delete analytics" ON "public"."analytics" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can insert YouTube stats" ON "public"."youtube_stats" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can insert analytics" ON "public"."analytics" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can update YouTube stats" ON "public"."youtube_stats" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can update analytics" ON "public"."analytics" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can view role changes" ON "public"."role_change_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Users can delete their own audience data" ON "public"."platform_audience" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own platform stats" ON "public"."platform_stats" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own posts" ON "public"."instagram_posts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own audience data" ON "public"."platform_audience" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own platform stats" ON "public"."platform_stats" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own posts" ON "public"."instagram_posts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own audience data" ON "public"."platform_audience" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own platform stats" ON "public"."platform_stats" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own posts" ON "public"."instagram_posts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile (no role changes)" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK ((("auth"."uid"() = "id") AND ("role" = ( SELECT "profiles_1"."role"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own YouTube stats" ON "public"."youtube_stats" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own audience data" ON "public"."platform_audience" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own platform stats" ON "public"."platform_stats" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own posts" ON "public"."instagram_posts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "admin_all_md" ON "public"."metrics_daily" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (true);



CREATE POLICY "admin_all_p" ON "public"."posts" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (true);



CREATE POLICY "admin_all_pa" ON "public"."platform_accounts" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (true);



CREATE POLICY "admins_manage_assets" ON "public"."social_media_assets" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



ALTER TABLE "public"."analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_public" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "anon_read_metrics" ON "public"."metrics_daily" FOR SELECT USING (true);



CREATE POLICY "anon_read_posts" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "delete_audience" ON "public"."platform_audience" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "delete_platform_stats" ON "public"."platform_stats" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "delete_youtube_stats" ON "public"."youtube_stats" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "insert_audience" ON "public"."platform_audience" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "insert_own_profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "insert_platform_stats" ON "public"."platform_stats" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "insert_youtube_stats" ON "public"."youtube_stats" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



ALTER TABLE "public"."instagram_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instagram_posts_public" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."metrics_daily" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_audience" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read_analytics_admin" ON "public"."analytics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "read_analytics_public" ON "public"."analytics_public" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "read_assets" ON "public"."social_media_assets" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "read_instagram_posts_public" ON "public"."instagram_posts_public" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."role_change_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_audience" ON "public"."platform_audience" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "select_platform_stats" ON "public"."platform_stats" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."social_media_assets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_audience" ON "public"."platform_audience" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "update_own_profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "update_platform_stats" ON "public"."platform_stats" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "update_youtube_stats" ON "public"."youtube_stats" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "view_own_profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "view_youtube_stats" ON "public"."youtube_stats" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."youtube_stats" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."instagram_posts_public";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."platform_audience";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."platform_stats";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."youtube_stats";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_role_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_role_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_role_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_analytics_public"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_analytics_public"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_analytics_public"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_instagram_posts_public"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_instagram_posts_public"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_instagram_posts_public"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_asset_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_asset_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_asset_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
























GRANT ALL ON TABLE "public"."analytics" TO "anon";
GRANT ALL ON TABLE "public"."analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_public" TO "anon";
GRANT ALL ON TABLE "public"."analytics_public" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_public" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_posts" TO "anon";
GRANT ALL ON TABLE "public"."instagram_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_posts" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_posts_public" TO "anon";
GRANT ALL ON TABLE "public"."instagram_posts_public" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_posts_public" TO "service_role";



GRANT ALL ON TABLE "public"."metrics_daily" TO "anon";
GRANT ALL ON TABLE "public"."metrics_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."metrics_daily" TO "service_role";



GRANT ALL ON SEQUENCE "public"."metrics_daily_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."metrics_daily_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."metrics_daily_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."platform_accounts" TO "anon";
GRANT ALL ON TABLE "public"."platform_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."platform_audience" TO "anon";
GRANT ALL ON TABLE "public"."platform_audience" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_audience" TO "service_role";



GRANT ALL ON TABLE "public"."platform_stats" TO "anon";
GRANT ALL ON TABLE "public"."platform_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_stats" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."role_change_log" TO "anon";
GRANT ALL ON TABLE "public"."role_change_log" TO "authenticated";
GRANT ALL ON TABLE "public"."role_change_log" TO "service_role";



GRANT ALL ON TABLE "public"."social_media_assets" TO "anon";
GRANT ALL ON TABLE "public"."social_media_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."social_media_assets" TO "service_role";



GRANT ALL ON TABLE "public"."v_post_latest" TO "anon";
GRANT ALL ON TABLE "public"."v_post_latest" TO "authenticated";
GRANT ALL ON TABLE "public"."v_post_latest" TO "service_role";



GRANT ALL ON TABLE "public"."youtube_stats" TO "anon";
GRANT ALL ON TABLE "public"."youtube_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."youtube_stats" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
