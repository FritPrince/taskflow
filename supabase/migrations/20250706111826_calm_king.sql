/*
  # Système de gestion de tâches - Schéma principal

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `owner_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `project_members`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `user_id` (uuid, references auth.users)
      - `role` (text, default 'member')
      - `created_at` (timestamp)
    
    - `task_statuses`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `name` (text)
      - `color` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)
    
    - `tasks`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `status_id` (uuid, references task_statuses)
      - `title` (text)
      - `description` (text)
      - `priority` (text, default 'medium')
      - `assignee_id` (uuid, references auth.users)
      - `creator_id` (uuid, references auth.users)
      - `due_date` (date)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for project-based access control
    - Ensure users can only access projects they're members of
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create task_statuses table
CREATE TABLE IF NOT EXISTS task_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  status_id uuid REFERENCES task_statuses(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  due_date date,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view projects they are members of"
  ON projects FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
    OR owner_id = auth.uid()
  );

CREATE POLICY "Project owners can update their projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners can delete their projects"
  ON projects FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for project_members
CREATE POLICY "Users can view project members for their projects"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage members"
  ON project_members FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for task_statuses
CREATE POLICY "Users can view statuses for their projects"
  ON task_statuses FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage statuses"
  ON task_statuses FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks for their projects"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Insert default statuses function
CREATE OR REPLACE FUNCTION create_default_statuses(project_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO task_statuses (project_id, name, color, order_index) VALUES
    (project_id, 'À faire', '#6B7280', 0),
    (project_id, 'En cours', '#3B82F6', 1),
    (project_id, 'En révision', '#F59E0B', 2),
    (project_id, 'Terminé', '#10B981', 3);
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default statuses when a project is created
CREATE OR REPLACE FUNCTION handle_new_project()
RETURNS trigger AS $$
BEGIN
  -- Add owner as project member
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  
  -- Create default statuses
  PERFORM create_default_statuses(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_new_project();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();