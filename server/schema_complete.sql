-- =============================================================================
-- Csbox Cloud Academy - Complete Supabase Schema
-- Copy and paste this entire file into Supabase SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 2. CUSTOM TYPES (ENUMs)
-- -----------------------------------------------------------------------------

CREATE TYPE role_type AS ENUM (
  'super_admin',
  'admin',
  'instructor',
  'reviewer',
  'student',
  'organization',
  'support'
);

CREATE TYPE course_status AS ENUM (
  'draft',
  'under_review',
  'revision_requested',
  'approved',
  'published',
  'archived'
);

CREATE TYPE lesson_type AS ENUM (
  'video',
  'text',
  'document',
  'practical',
  'quiz',
  'assignment'
);

CREATE TYPE ticket_category AS ENUM (
  'account',
  'payment',
  'academic',
  'technical'
);

CREATE TYPE ticket_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE ticket_status AS ENUM (
  'open',
  'in_progress',
  'escalated',
  'resolved'
);

CREATE TYPE audit_severity AS ENUM (
  'info',
  'warning',
  'critical'
);

-- -----------------------------------------------------------------------------
-- 3. IDENTITY & ACCESS MANAGEMENT (IAM) TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role role_type NOT NULL DEFAULT 'student',
  organization_id UUID,
  organization_name TEXT,
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

-- -----------------------------------------------------------------------------
-- 4. COURSE CATALOG & VERSIONED AUTHORING
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- 5. ASSESSMENTS, QUIZZES & SUBMISSIONS
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- 6. ENROLLMENTS & PROGRESS
-- -----------------------------------------------------------------------------

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
  certificate_id UUID,
  UNIQUE(learner_id, course_id)
);

-- -----------------------------------------------------------------------------
-- 7. CERTIFICATES
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- 8. SUPPORT TICKETS
-- -----------------------------------------------------------------------------

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category ticket_category NOT NULL DEFAULT 'technical',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'open',
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

-- -----------------------------------------------------------------------------
-- 9. AUDIT LOGS (Append-only, immutable)
-- -----------------------------------------------------------------------------

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
  severity audit_severity NOT NULL DEFAULT 'info',
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

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_update_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();

-- Auto-update updated_at on organizations
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_update_timestamp
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_organizations_updated_at();

-- Auto-update updated_at on courses
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_update_timestamp
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_courses_updated_at();

-- Auto-update updated_at on support_tickets
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_tickets_update_timestamp
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_support_tickets_updated_at();

-- -----------------------------------------------------------------------------
-- 10. ROW-LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY profiles_own_read ON profiles FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY profiles_admin_all ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role = 'super_admin')
);
CREATE POLICY profiles_admin_update ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin'))
);

-- Organizations: Members can read their org, admins can manage
CREATE POLICY org_members_read ON organizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM organization_memberships WHERE organization_id = organizations.id AND user_id = auth.uid()::text)
);
CREATE POLICY org_admin_all ON organizations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin'))
);

-- Organization memberships: Members can read, org admins can manage
CREATE POLICY org_memberships_read ON organization_memberships FOR SELECT USING (
  user_id = auth.uid()::text OR
  EXISTS (SELECT 1 FROM organization_memberships om JOIN profiles p ON p.id = om.user_id WHERE om.organization_id = organization_memberships.organization_id AND p.id = auth.uid()::text AND p.role IN ('super_admin', 'admin'))
);

-- User roles: Users can read their own roles, admins can manage
CREATE POLICY user_roles_own_read ON user_roles FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY user_roles_admin_all ON user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role = 'super_admin')
);

-- Courses: Published courses readable by all, authors/admins can manage
CREATE POLICY courses_published_read ON courses FOR SELECT USING (is_archived = false);
CREATE POLICY courses_instructor_manage ON courses FOR ALL USING (
  instructor_id = auth.uid()::text OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin'))
);

-- Course versions: Same as courses
CREATE POLICY course_versions_read ON course_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = course_versions.course_id AND is_archived = false)
);
CREATE POLICY course_versions_manage ON course_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = course_versions.course_id AND (courses.instructor_id = auth.uid()::text OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin'))))
);

-- Modules: Readable if course version is published
CREATE POLICY modules_read ON modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM course_versions cv
    JOIN courses c ON c.id = cv.course_id
    WHERE cv.id = modules.course_version_id AND c.is_archived = false
  )
);
CREATE POLICY modules_manage ON modules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM course_versions cv
    JOIN courses c ON c.id = cv.course_id
    WHERE cv.id = modules.course_version_id AND (c.instructor_id = auth.uid()::text OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin')))
  )
);

-- Lessons: Readable if module is accessible
CREATE POLICY lessons_read ON lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN course_versions cv ON cv.id = m.course_version_id
    JOIN courses c ON c.id = cv.course_id
    WHERE m.id = lessons.module_id AND c.is_archived = false
  )
);
CREATE POLICY lessons_manage ON lessons FOR ALL USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN course_versions cv ON cv.id = m.course_version_id
    JOIN courses c ON c.id = cv.course_id
    WHERE m.id = lessons.module_id AND (c.instructor_id = auth.uid()::text OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin')))
  )
);

-- Quizzes: Same as lessons
CREATE POLICY quizzes_read ON quizzes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN course_versions cv ON cv.id = m.course_version_id
    JOIN courses c ON c.id = cv.course_id
    WHERE l.id = quizzes.lesson_id AND c.is_archived = false
  )
);
CREATE POLICY quizzes_manage ON quizzes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN course_versions cv ON cv.id = m.course_version_id
    JOIN courses c ON c.id = cv.course_id
    WHERE l.id = quizzes.lesson_id AND (c.instructor_id = auth.uid()::text OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin')))
  )
);

-- Quiz questions: Same as quizzes
CREATE POLICY quiz_questions_read ON quiz_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN lessons l ON l.id = q.quiz_id
    JOIN modules m ON m.id = l.module_id
    JOIN course_versions cv ON cv.id = m.course_version_id
    JOIN courses c ON c.id = cv.course_id
    WHERE q.quiz_id = quiz_questions.quiz_id AND c.is_archived = false
  )
);
CREATE POLICY quiz_questions_manage ON quiz_questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN lessons l ON l.id = q.quiz_id
    JOIN modules m ON m.id = l.module_id
    JOIN course_versions cv ON cv.id = m.course_version_id
    JOIN courses c ON c.id = cv.course_id
    WHERE q.quiz_id = quiz_questions.quiz_id AND (c.instructor_id = auth.uid()::text OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin')))
  )
);

-- Quiz attempts: Users can see their own attempts
CREATE POLICY quiz_attempts_own ON quiz_attempts FOR ALL USING (learner_id = auth.uid()::text);
CREATE POLICY quiz_attempts_admin_read ON quiz_attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin', 'instructor', 'reviewer'))
);

-- Assignments: Same as lessons
CREATE POLICY assignments_read ON assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN course_versions cv ON cv.id = m.course_version_id
    JOIN courses c ON c.id = cv.course_id
    WHERE l.id = assignments.lesson_id AND c.is_archived = false
  )
);
CREATE POLICY assignments_manage ON assignments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN course_versions cv ON cv.id = m.course_version_id
    JOIN courses c ON c.id = cv.course_id
    WHERE l.id = assignments.lesson_id AND (c.instructor_id = auth.uid()::text OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin')))
  )
);

-- Assignment submissions: Users can see their own, instructors/admins can see all
CREATE POLICY assignment_submissions_own ON assignment_submissions FOR ALL USING (learner_id = auth.uid()::text);
CREATE POLICY assignment_submissions_instructor_read ON assignment_submissions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM assignments a
    JOIN lessons l ON l.id = a.lesson_id
    JOIN modules m ON m.id = l.module_id
    JOIN course_versions cv ON cv.id = m.course_version_id
    JOIN courses c ON c.id = cv.course_id
    WHERE a.id = assignment_submissions.assignment_id AND c.instructor_id = auth.uid()::text
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin', 'reviewer'))
);

-- Enrollments: Users can see their own enrollments
CREATE POLICY enrollments_own ON enrollments FOR ALL USING (learner_id = auth.uid()::text);
CREATE POLICY enrollments_admin_read ON enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin', 'instructor'))
);

-- Certificates: Valid certificates readable by all, owners can see their own
CREATE POLICY certificates_valid_read ON certificates FOR SELECT USING (status = 'valid');
CREATE POLICY certificates_own ON certificates FOR ALL USING (learner_id = auth.uid()::text);
CREATE POLICY certificates_admin_all ON certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin'))
);

-- Audit logs: Only super_admin can read
CREATE POLICY audit_super_admin_read ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role = 'super_admin')
);

-- Support tickets: Users can see their own tickets, admins/support can see all
CREATE POLICY support_own ON support_tickets FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY support_admin_all ON support_tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin', 'support'))
);

-- Support messages: Same as tickets
CREATE POLICY support_messages_own ON support_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = support_messages.ticket_id AND support_tickets.user_id = auth.uid()::text)
);
CREATE POLICY support_messages_admin_all ON support_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('super_admin', 'admin', 'support'))
);

-- -----------------------------------------------------------------------------
-- 11. INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_org ON profiles(organization_id);

CREATE INDEX idx_organizations_domain ON organizations(domain);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_archived ON courses(is_archived);

CREATE INDEX idx_course_versions_course ON course_versions(course_id);
CREATE INDEX idx_course_versions_status ON course_versions(status);

CREATE INDEX idx_modules_course_version ON modules(course_version_id);

CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_lessons_type ON lessons(lesson_type);

CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX idx_quiz_attempts_learner ON quiz_attempts(learner_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);

CREATE INDEX idx_assignments_lesson ON assignments(lesson_id);
CREATE INDEX idx_assignment_submissions_learner ON assignment_submissions(learner_id);
CREATE INDEX idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);

CREATE INDEX idx_enrollments_learner ON enrollments(learner_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

CREATE INDEX idx_certificates_learner ON certificates(learner_id);
CREATE INDEX idx_certificates_hash ON certificates(verification_hash);
CREATE INDEX idx_certificates_course ON certificates(course_id);

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_messages_ticket ON support_messages(ticket_id);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- -----------------------------------------------------------------------------
-- 12. SEED DATA - INITIAL USERS
-- -----------------------------------------------------------------------------

-- Insert initial users (passwords are hashed with bcrypt - replace with your own)
INSERT INTO profiles (email, password_hash, full_name, role, is_suspended, mfa_enabled, language_preference, email_notifications, sms_notifications) VALUES
  ('superadmin@csbox.dev', crypt('SuperAdmin123!', gen_salt('bf')), 'Super Administrator', 'super_admin', false, false, 'en', true, false),
  ('admin@csbox.dev', crypt('Admin123!', gen_salt('bf')), 'System Administrator', 'admin', false, false, 'en', true, false),
  ('instructor@csbox.dev', crypt('Instructor123!', gen_salt('bf')), 'Course Instructor', 'instructor', false, false, 'en', true, false),
  ('reviewer@csbox.dev', crypt('Reviewer123!', gen_salt('bf')), 'Course Reviewer', 'reviewer', false, false, 'en', true, false),
  ('student@csbox.dev', crypt('Student123!', gen_salt('bf')), 'Learner Student', 'student', false, false, 'en', true, false),
  ('organization@csbox.dev', crypt('Org123!', gen_salt('bf')), 'Organization Admin', 'organization', false, false, 'en', true, false),
  ('support@csbox.dev', crypt('Support123!', gen_salt('bf')), 'Support Agent', 'support', false, false, 'en', true, false);

-- -----------------------------------------------------------------------------
-- 13. VERIFICATION QUERIES
-- -----------------------------------------------------------------------------

-- Uncomment to verify tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Uncomment to verify RLS is enabled
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- =============================================================================
-- End of Schema - Copy and paste everything above into Supabase SQL Editor
-- =============================================================================