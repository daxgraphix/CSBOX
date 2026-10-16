-- =============================================================================
-- Csbox Cloud Academy - Production PostgreSQL Schema
-- Includes Full Relational Modeling, RLS Policies, Indexes, and Audit Triggers
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
// 1. IDENTITY & ACCESS MANAGEMENT (IAM)
// ---------------------------------------------------------------------------

CREATE TYPE role_type AS ENUM ('super_admin', 'admin', 'student');

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role role_type NOT NULL DEFAULT 'student',
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspended_at TIMESTAMPTZ,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT,
  language_preference VARCHAR(10) DEFAULT 'en',
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  seat_limit INT NOT NULL DEFAULT 50,
  active_seats INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role role_type NOT NULL,
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ---------------------------------------------------------------------------
// 2. COURSE CATALOG & VERSIONED AUTHORING STUDIO
// ---------------------------------------------------------------------------

CREATE TYPE course_status AS ENUM (
  'draft', 'under_review', 'revision_requested', 'approved', 'published', 'archived'
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  estimated_hours NUMERIC(6, 2) DEFAULT 0,
  price_cents INT DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  instructor_id UUID NOT NULL REFERENCES profiles(id),
  active_version TEXT DEFAULT '1.0',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  status course_status NOT NULL DEFAULT 'draft',
  changelog TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  UNIQUE(course_id, version_number)
);

CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_version_id UUID NOT NULL REFERENCES course_versions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_version_id, display_order)
);

CREATE TYPE lesson_type AS ENUM ('video', 'text', 'document', 'practical', 'quiz', 'assignment');

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lesson_type lesson_type NOT NULL,
  display_order INT NOT NULL,
  duration_minutes INT DEFAULT 10,
  is_optional BOOLEAN DEFAULT FALSE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, display_order)
);

-- ---------------------------------------------------------------------------
// 3. ASSESSMENTS, QUIZZES & SUBMISSIONS
// ---------------------------------------------------------------------------

CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time_limit_minutes INT DEFAULT 20,
  pass_threshold_percent INT DEFAULT 70,
  max_attempts INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INT NOT NULL,
  explanation TEXT,
  points INT DEFAULT 10,
  display_order INT NOT NULL
);

-- NOTE: correct_option_index is NOT exposed in public API - only used server-side for grading

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  submitted_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC(5,2) DEFAULT 0,
  max_score NUMERIC(5,2) DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  is_passed BOOLEAN DEFAULT FALSE,
  UNIQUE(quiz_id, learner_id, attempt_number)
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  rubric JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_score INT DEFAULT 100,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  score NUMERIC(5,2),
  feedback TEXT,
  rubric_evaluation JSONB,
  graded_by UUID REFERENCES profiles(id),
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
// 4. ENROLLMENTS & PROGRESS
// ---------------------------------------------------------------------------

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_version TEXT NOT NULL DEFAULT '1.0',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_lesson_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  progress_percent NUMERIC(5,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  certificate_id UUID REFERENCES certificates(id),
  UNIQUE(learner_id, course_id)
);

-- ---------------------------------------------------------------------------
// 5. CERTIFICATES
// ---------------------------------------------------------------------------

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE NOT NULL,
  learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  learner_name TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_title TEXT NOT NULL,
  course_version TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  verification_hash TEXT UNIQUE NOT NULL,
  issuer_name TEXT NOT NULL,
  issuer_title TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'valid',
  revocation_reason TEXT,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
// 6. SUPPORT TICKETS
// ---------------------------------------------------------------------------

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category VARCHAR(20) NOT NULL DEFAULT 'technical',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_role VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
// 7. AUDIT LOGS (Append-only, immutable)
// ---------------------------------------------------------------------------

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor_id UUID REFERENCES profiles(id),
  actor_name TEXT NOT NULL,
  actor_role role_type NOT NULL,
  action TEXT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Make audit logs append-only (prevent updates/deletes)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable. Cannot modify or delete audit records.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- ---------------------------------------------------------------------------
// 8. ROW-LEVEL SECURITY (RLS) POLICIES
// ---------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY profiles_own_read ON profiles FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY profiles_admin_all ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role = 'super_admin')
);

-- Courses: Published courses readable by all, authors/admins can manage
CREATE POLICY courses_published_read ON courses FOR SELECT USING (is_archived = false);
CREATE POLICY courses_instructor_manage ON courses FOR ALL USING (
  instructor_id = auth.uid()::text OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin'))
);

-- Enrollments: Users can see their own enrollments
CREATE POLICY enrollments_own ON enrollments FOR ALL USING (learner_id = auth.uid()::text);

-- Certificates: Valid certificates readable by all, owners can see their own
CREATE POLICY certificates_valid_read ON certificates FOR SELECT USING (status = 'valid');
CREATE POLICY certificates_own ON certificates FOR ALL USING (learner_id = auth.uid()::text);

-- Audit logs: Only super_admin can read
CREATE POLICY audit_super_admin_read ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role = 'super_admin')
);

-- Support tickets: Users can see their own tickets, admins can see all
CREATE POLICY support_own ON support_tickets FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY support_admin_all ON support_tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin'))
);

-- ---------------------------------------------------------------------------
// 9. INDEXES FOR PERFORMANCE
// ---------------------------------------------------------------------------

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_learner ON enrollments(learner_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_certificates_learner ON certificates(learner_id);
CREATE INDEX idx_certificates_hash ON certificates(verification_hash);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_quiz_attempts_learner ON quiz_attempts(learner_id);
CREATE INDEX idx_assignment_submissions_learner ON assignment_submissions(learner_id);

-- =============================================================================
-- End of Schema
-- =============================================================================
