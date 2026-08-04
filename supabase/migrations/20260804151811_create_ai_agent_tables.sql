/*
# Create AI Agent tables: sessions, memory, tasks, and action logs

1. New Tables
- `ai_sessions` — stores conversation sessions for the AI Assistant
  - `id` (uuid, primary key)
  - `created_at` (timestamptz)
  - `mode` (text, default 'personal') — active agent mode
  - `title` (text) — optional session title
- `ai_messages` — stores messages within a session (conversation memory)
  - `id` (uuid, primary key)
  - `session_id` (uuid, references ai_sessions)
  - `role` (text) — 'user' or 'assistant'
  - `content` (text)
  - `action_requests` (jsonb) — optional action requests from the AI
  - `created_at` (timestamptz)
- `ai_tasks` — tasks created by the AI agent (to-do, milestones, etc.)
  - `id` (uuid, primary key)
  - `session_id` (uuid, references ai_sessions, nullable)
  - `title` (text, not null)
  - `description` (text)
  - `status` (text, default 'pending') — pending / in_progress / completed
  - `priority` (text, default 'medium') — low / medium / high
  - `due_date` (timestamptz, nullable)
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz, nullable)
- `ai_action_log` — log of agent actions and user confirmations
  - `id` (uuid, primary key)
  - `session_id` (uuid, references ai_sessions, nullable)
  - `action_type` (text, not null)
  - `description` (text)
  - `details` (text)
  - `status` (text, default 'pending') — pending / approved / denied / executed / failed
  - `created_at` (timestamptz)

2. Indexes
- Index on `ai_messages.session_id` for fetching conversation history
- Index on `ai_tasks.status` for filtering active tasks
- Index on `ai_tasks.session_id` for project-scoped tasks
- Index on `ai_action_log.session_id`

3. Security
- Enable RLS on all tables.
- Single-tenant shared intelligence system (no user-scoped isolation).
- Allow anon + authenticated full CRUD on all tables.
*/

CREATE TABLE IF NOT EXISTS ai_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  mode text DEFAULT 'personal',
  title text
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES ai_sessions(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  action_requests jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES ai_sessions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS ai_action_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES ai_sessions(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  description text,
  details text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aimsg_session ON ai_messages (session_id);
CREATE INDEX IF NOT EXISTS idx_aitask_status ON ai_tasks (status);
CREATE INDEX IF NOT EXISTS idx_aitask_session ON ai_tasks (session_id);
CREATE INDEX IF NOT EXISTS idx_ailog_session ON ai_action_log (session_id);

ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_action_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_crud_ai_sessions" ON ai_sessions;
CREATE POLICY "anon_crud_ai_sessions" ON ai_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_ai_sessions" ON ai_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_ai_sessions" ON ai_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_ai_sessions" ON ai_sessions FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_ai_messages" ON ai_messages;
CREATE POLICY "anon_crud_ai_messages" ON ai_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_ai_messages" ON ai_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_ai_messages" ON ai_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_ai_messages" ON ai_messages FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_ai_tasks" ON ai_tasks;
CREATE POLICY "anon_crud_ai_tasks" ON ai_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_ai_tasks" ON ai_tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_ai_tasks" ON ai_tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_ai_tasks" ON ai_tasks FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_ai_action_log" ON ai_action_log;
CREATE POLICY "anon_crud_ai_action_log" ON ai_action_log FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_ai_action_log" ON ai_action_log FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_ai_action_log" ON ai_action_log FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_ai_action_log" ON ai_action_log FOR DELETE TO anon, authenticated USING (true);
