-- Future Supabase PostgreSQL Schema for BAITON BIL ARABIYA
-- Phase 2 Migration Script (Not executed in Phase 1 Local Demo Mode)

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('learner', 'admin')) DEFAULT 'learner',
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  last_active_date DATE,
  daily_goal_xp INTEGER NOT NULL DEFAULT 80,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  level_number INTEGER UNIQUE NOT NULL CHECK (level_number BETWEEN 0 AND 12),
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  estimated_hours INTEGER NOT NULL DEFAULT 2,
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  explanation_ar TEXT NOT NULL,
  example_code TEXT NOT NULL,
  try_it_code TEXT NOT NULL,
  line_by_line JSONB NOT NULL DEFAULT '[]'::jsonb,
  common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
  quiz JSONB NOT NULL DEFAULT '[]'::jsonb,
  xp_reward INTEGER NOT NULL DEFAULT 30,
  estimated_minutes INTEGER NOT NULL DEFAULT 8,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  prompt_ar TEXT NOT NULL,
  code_snippet TEXT,
  options JSONB,
  blocks JSONB,
  correct_answer JSONB NOT NULL,
  validation_code TEXT,
  hint_ar TEXT NOT NULL,
  explanation_ar TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 20,
  difficulty TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  prompt_ar TEXT NOT NULL,
  code_snippet TEXT,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation_ar TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 1,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_score INTEGER,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title_ar TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_bonus INTEGER NOT NULL DEFAULT 25,
  condition_type TEXT NOT NULL,
  condition_target INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS daily_activity (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  exercises_solved INTEGER NOT NULL DEFAULT 0,
  minutes_learned INTEGER NOT NULL DEFAULT 0,
  playground_runs INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  mode TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  level_required INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  goal_ar TEXT NOT NULL,
  requirements_ar JSONB NOT NULL DEFAULT '[]'::jsonb,
  hints_ar JSONB NOT NULL DEFAULT '[]'::jsonb,
  starter_code TEXT NOT NULL,
  test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  xp_reward INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  passed_tests INTEGER NOT NULL,
  total_tests INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
