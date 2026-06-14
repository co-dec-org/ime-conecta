import type {
  AGREEMENT_STATUSES,
  CONFIDENTIALITY_LEVELS,
  GLOBAL_ROLES,
  PRIORITIES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  SOCIX_VISIBILITY,
  TASK_STATUSES,
  TRAFFIC_LIGHTS,
  USER_STATUSES
} from "@/lib/constants";

export type GlobalRole = (typeof GLOBAL_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type ProjectType = (typeof PROJECT_TYPES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type TrafficLight = (typeof TRAFFIC_LIGHTS)[number];
export type ConfidentialityLevel = (typeof CONFIDENTIALITY_LEVELS)[number];
export type SocixVisibility = (typeof SOCIX_VISIBILITY)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number];

export type AuthorizedUser = {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string;
  login_username: string | null;
  rut: string | null;
  email: string;
  phone: string | null;
  position: string | null;
  global_role: GlobalRole;
  status: UserStatus;
  can_view_sensitive_data: boolean;
  force_revalidation: boolean;
  password_changed_at: string | null;
  last_validated_at: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicProfile = Pick<
  AuthorizedUser,
  "id" | "first_name" | "last_name" | "email" | "global_role" | "status"
>;

export type Project = {
  id: string;
  name: string;
  description: string | null;
  record_type: ProjectType;
  strategic_line: string | null;
  status: ProjectStatus;
  closure_status: string | null;
  priority: Priority;
  traffic_light: TrafficLight;
  main_responsible_id: string | null;
  committee_profile: string | null;
  critical_date: string | null;
  review_date: string | null;
  next_step: string | null;
  required_decision: string | null;
  institutional_mandate: string | null;
  confidentiality_level: ConfidentialityLevel;
  socix_visibility: SocixVisibility;
  main_risk: string | null;
  document_backing_type: string | null;
  gmail_thread_url: string | null;
  drive_folder_url: string | null;
  main_document_url: string | null;
  internal_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  main_responsible?: PublicProfile | null;
};

export type ProjectRole = {
  id: string;
  user_id: string;
  project_id: string;
  role: string;
  committee_profile_name: string | null;
};

export type Task = {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  responsible_id: string | null;
  due_date: string | null;
  status: TaskStatus;
  priority: Priority;
  backing_url: string | null;
  observations: string | null;
  created_at: string;
  updated_at: string;
  projects?: Pick<Project, "id" | "name"> | null;
  responsible?: PublicProfile | null;
};

export type Meeting = {
  id: string;
  project_id: string | null;
  date: string;
  institution: string;
  ime_attendees: string | null;
  objective: string | null;
  prior_brief: string | null;
  authorized_topics: string | null;
  unauthorized_topics: string | null;
  post_summary: string | null;
  agreements: string | null;
  next_steps: string | null;
  gmail_url: string | null;
  drive_url: string | null;
  observations: string | null;
  created_at: string;
  projects?: Pick<Project, "id" | "name"> | null;
};

export type Agreement = {
  id: string;
  project_id: string | null;
  decision: string;
  instance: string;
  date: string;
  status: AgreementStatus;
  follow_up_responsible_id: string | null;
  backing_url: string | null;
  observations: string | null;
  created_at: string;
  projects?: Pick<Project, "id" | "name"> | null;
  follow_up_responsible?: PublicProfile | null;
};

export type Stakeholder = {
  id: string;
  project_id: string | null;
  name: string;
  institution: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  actor_type: string;
  notes: string | null;
  created_at: string;
  projects?: Pick<Project, "id" | "name"> | null;
};

export type DocumentLink = {
  id: string;
  project_id: string;
  title: string;
  document_type: string;
  url: string;
  location: string;
  version: string | null;
  document_date: string | null;
  notes: string | null;
  created_at: string;
  projects?: Pick<Project, "id" | "name"> | null;
};

export type ActivityLog = {
  id: string;
  project_id: string | null;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  actor?: PublicProfile | null;
};
