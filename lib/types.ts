export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  mentions?: string[];
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  task_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration: number;
  description?: string;
  created_at: string;
}

export interface TaskTemplate {
  id: string;
  project_id: string;
  name: string;
  title_template: string;
  description_template: string;
  default_priority: string;
  default_tags: string[];
  checklist_items: ChecklistItem[];
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  task_id: string;
  text: string;
  completed: boolean;
  order_index: number;
  created_at: string;
}

export interface ProjectAnalytics {
  velocity: number;
  burndown: BurndownPoint[];
  cycle_time: number;
  lead_time: number;
  throughput: number;
  work_in_progress: number;
}

export interface BurndownPoint {
  date: string;
  remaining_points: number;
  completed_points: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'task_assigned' | 'task_completed' | 'deadline_approaching' | 'mention' | 'comment';
  title: string;
  message: string;
  read: boolean;
  data: any;
  created_at: string;
}

export interface Integration {
  id: string;
  project_id: string;
  type: 'github' | 'slack' | 'discord' | 'email' | 'webhook';
  config: any;
  active: boolean;
  created_at: string;
}