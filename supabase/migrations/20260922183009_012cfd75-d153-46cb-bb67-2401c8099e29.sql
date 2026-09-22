-- =========================
-- Utilities
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =========================
-- Roles
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'schedule_manager', 'comms_manager', 'photo_manager', 'volunteer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.can_manage(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND (role = _role OR role = 'admin')
  );
$$;

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- =========================
-- Reference content
-- =========================
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE,
  starts_on DATE,
  ends_on DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seasons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seasons TO authenticated;
GRANT ALL ON public.seasons TO service_role;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seasons_public_read" ON public.seasons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "seasons_manage" ON public.seasons FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'schedule_manager')) WITH CHECK (public.can_manage(auth.uid(), 'schedule_manager'));
CREATE TRIGGER trg_seasons_updated BEFORE UPDATE ON public.seasons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories_manage" ON public.categories FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'schedule_manager')) WITH CHECK (public.can_manage(auth.uid(), 'schedule_manager'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL,
  division TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_public_read" ON public.teams FOR SELECT TO anon, authenticated USING (is_visible);
CREATE POLICY "teams_manage" ON public.teams FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'schedule_manager')) WITH CHECK (public.can_manage(auth.uid(), 'schedule_manager'));
CREATE TRIGGER trg_teams_updated BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.arenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  address_verified BOOLEAN NOT NULL DEFAULT false,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  official_url TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.arenas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.arenas TO authenticated;
GRANT ALL ON public.arenas TO service_role;
ALTER TABLE public.arenas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "arenas_public_read" ON public.arenas FOR SELECT TO anon, authenticated USING (is_visible);
CREATE POLICY "arenas_manage" ON public.arenas FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'schedule_manager')) WITH CHECK (public.can_manage(auth.uid(), 'schedule_manager'));
CREATE TRIGGER trg_arenas_updated BEFORE UPDATE ON public.arenas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Imports + schedule
-- =========================
CREATE TABLE public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  rows_accepted INTEGER NOT NULL DEFAULT 0,
  rows_rejected INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_reverted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_batches TO authenticated;
GRANT ALL ON public.import_batches TO service_role;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "import_batches_manage" ON public.import_batches FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'schedule_manager')) WITH CHECK (public.can_manage(auth.uid(), 'schedule_manager'));
CREATE TRIGGER trg_import_batches_updated BEFORE UPDATE ON public.import_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TYPE public.activity_type AS ENUM ('game', 'practice', 'tournament', 'tryout', 'event', 'other');
CREATE TYPE public.activity_status AS ENUM ('confirmed', 'modified', 'cancelled', 'tentative');

CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_date DATE NOT NULL,
  starts_at TIME NOT NULL,
  ends_at TIME,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  opponent TEXT,
  activity_type public.activity_type NOT NULL DEFAULT 'practice',
  arena_id UUID REFERENCES public.arenas(id) ON DELETE SET NULL,
  rink TEXT,
  status public.activity_status NOT NULL DEFAULT 'confirmed',
  note_fr TEXT,
  note_en TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activities_date ON public.activities (activity_date);
CREATE INDEX idx_activities_team ON public.activities (team_id);
CREATE INDEX idx_activities_arena ON public.activities (arena_id);
GRANT SELECT ON public.activities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_public_read" ON public.activities FOR SELECT TO anon USING (is_published);
CREATE POLICY "activities_auth_read" ON public.activities FOR SELECT TO authenticated
  USING (is_published OR public.can_manage(auth.uid(), 'schedule_manager'));
CREATE POLICY "activities_manage" ON public.activities FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'schedule_manager')) WITH CHECK (public.can_manage(auth.uid(), 'schedule_manager'));
CREATE TRIGGER trg_activities_updated BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- News
-- =========================
CREATE TYPE public.content_state AS ENUM ('draft', 'published', 'archived');

CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_fr TEXT NOT NULL,
  title_en TEXT,
  excerpt_fr TEXT,
  excerpt_en TEXT,
  body_fr TEXT,
  body_en TEXT,
  image_url TEXT,
  author TEXT,
  category TEXT,
  published_on DATE,
  season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL,
  state public.content_state NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_public_read" ON public.news FOR SELECT TO anon USING (state = 'published');
CREATE POLICY "news_auth_read" ON public.news FOR SELECT TO authenticated
  USING (state = 'published' OR public.can_manage(auth.uid(), 'comms_manager'));
CREATE POLICY "news_manage" ON public.news FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'comms_manager')) WITH CHECK (public.can_manage(auth.uid(), 'comms_manager'));
CREATE TRIGGER trg_news_updated BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.news_teams (
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  PRIMARY KEY (news_id, team_id)
);
GRANT SELECT ON public.news_teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_teams TO authenticated;
GRANT ALL ON public.news_teams TO service_role;
ALTER TABLE public.news_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_teams_public_read" ON public.news_teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "news_teams_manage" ON public.news_teams FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'comms_manager')) WITH CHECK (public.can_manage(auth.uid(), 'comms_manager'));

-- =========================
-- Gallery
-- =========================
CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_fr TEXT NOT NULL,
  title_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  event_date DATE,
  season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL,
  event_type TEXT,
  cover_url TEXT,
  state public.content_state NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.albums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.albums TO authenticated;
GRANT ALL ON public.albums TO service_role;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "albums_public_read" ON public.albums FOR SELECT TO anon USING (state = 'published');
CREATE POLICY "albums_auth_read" ON public.albums FOR SELECT TO authenticated
  USING (state = 'published' OR public.can_manage(auth.uid(), 'photo_manager'));
CREATE POLICY "albums_manage" ON public.albums FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'photo_manager')) WITH CHECK (public.can_manage(auth.uid(), 'photo_manager'));
CREATE TRIGGER trg_albums_updated BEFORE UPDATE ON public.albums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.album_teams (
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  PRIMARY KEY (album_id, team_id)
);
GRANT SELECT ON public.album_teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_teams TO authenticated;
GRANT ALL ON public.album_teams TO service_role;
ALTER TABLE public.album_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "album_teams_public_read" ON public.album_teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "album_teams_manage" ON public.album_teams FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'photo_manager')) WITH CHECK (public.can_manage(auth.uid(), 'photo_manager'));

CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption_fr TEXT,
  caption_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  consent_obtained BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_photos_album ON public.photos (album_id);
GRANT SELECT ON public.photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photos TO authenticated;
GRANT ALL ON public.photos TO service_role;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_public_read" ON public.photos FOR SELECT TO anon USING (is_published AND consent_obtained);
CREATE POLICY "photos_auth_read" ON public.photos FOR SELECT TO authenticated
  USING ((is_published AND consent_obtained) OR public.can_manage(auth.uid(), 'photo_manager'));
CREATE POLICY "photos_manage" ON public.photos FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'photo_manager')) WITH CHECK (public.can_manage(auth.uid(), 'photo_manager'));
CREATE TRIGGER trg_photos_updated BEFORE UPDATE ON public.photos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- FAQ, documents, sponsors
-- =========================
CREATE TABLE public.faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  question_fr TEXT NOT NULL,
  question_en TEXT,
  answer_fr TEXT,
  answer_en TEXT,
  source_path TEXT,
  is_validated BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faq TO authenticated;
GRANT ALL ON public.faq TO service_role;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faq_public_read" ON public.faq FOR SELECT TO anon USING (is_published);
CREATE POLICY "faq_auth_read" ON public.faq FOR SELECT TO authenticated
  USING (is_published OR public.can_manage(auth.uid(), 'comms_manager'));
CREATE POLICY "faq_manage" ON public.faq FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'comms_manager')) WITH CHECK (public.can_manage(auth.uid(), 'comms_manager'));
CREATE TRIGGER trg_faq_updated BEFORE UPDATE ON public.faq FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fr TEXT NOT NULL,
  title_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  category TEXT,
  external_url TEXT,
  storage_path TEXT,
  is_restricted BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  updated_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.documents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_public_read" ON public.documents FOR SELECT TO anon USING (is_published AND NOT is_restricted);
CREATE POLICY "documents_auth_read" ON public.documents FOR SELECT TO authenticated
  USING ((is_published AND NOT is_restricted) OR public.can_manage(auth.uid(), 'comms_manager'));
CREATE POLICY "documents_manage" ON public.documents FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'comms_manager')) WITH CHECK (public.can_manage(auth.uid(), 'comms_manager'));
CREATE TRIGGER trg_documents_updated BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  logo_authorized BOOLEAN NOT NULL DEFAULT false,
  website_url TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sponsors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsors TO authenticated;
GRANT ALL ON public.sponsors TO service_role;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsors_public_read" ON public.sponsors FOR SELECT TO anon, authenticated USING (is_visible);
CREATE POLICY "sponsors_manage" ON public.sponsors FOR ALL TO authenticated
  USING (public.can_manage(auth.uid(), 'comms_manager')) WITH CHECK (public.can_manage(auth.uid(), 'comms_manager'));
CREATE TRIGGER trg_sponsors_updated BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Contact messages
-- =========================
CREATE TYPE public.message_status AS ENUM ('new', 'in_progress', 'answered', 'closed');

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  team_or_category TEXT,
  message TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  status public.message_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_messages_insert" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (consent_given);
CREATE POLICY "contact_messages_read" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.can_manage(auth.uid(), 'comms_manager'));
CREATE POLICY "contact_messages_update" ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.can_manage(auth.uid(), 'comms_manager')) WITH CHECK (public.can_manage(auth.uid(), 'comms_manager'));
CREATE TRIGGER trg_contact_messages_updated BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Audit log
-- =========================
CREATE TABLE public.change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_change_log_table ON public.change_log (table_name, created_at DESC);
GRANT SELECT, INSERT ON public.change_log TO authenticated;
GRANT ALL ON public.change_log TO service_role;
ALTER TABLE public.change_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "change_log_read" ON public.change_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.can_manage(auth.uid(), 'volunteer'));
CREATE POLICY "change_log_insert" ON public.change_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);