// src/types/index.ts

export interface Domain {
  id: string;
  url: string;
  is_selected: boolean;
  pages_crawled: number;
  last_crawl_at: string | null;
  status: "idle" | "crawling" | "error";
  created_at: string;
}

export interface CrawlJob {
  job_id: string;
  status: "pending" | "running" | "completed" | "stopped" | "failed";
  pages_crawled: number;
  total_pages: number;
  current_url: string | null;
  speed: number;
  domain_count?: number;
}

export interface CrawlHistory {
  id: string;
  domain_id: string;
  domain_url: string;
  status: string;
  pages_crawled: number;
  started_at: string;
  completed_at: string | null;
  error: string | null;
}

export interface Schedule {
  id: string;
  name: string;
  domain_id: string;
  domain_url: string;
  schedule_type: "hourly" | "12_hours" | "daily" | "weekly" | "monthly" | "custom";
  cron_expression: string | null;
  is_enabled: boolean;
  next_run_at: string | null;
  last_run_at: string | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  name: string;
  domain_id: string;
  domain_url: string;
  created_at: string;
  last_message_at: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ url: string; title: string; similarity: number }>;
  created_at: string;
}

export interface UploadedFile {
  file_id: string;
  filename: string;
  size: number;
  expires_at: string;
}

export interface OpenAIConfig {
  has_key: boolean;
  masked_key: string | null;
  model: string;
  temperature: number;
}

export interface SupabaseConfig {
  is_custom: boolean;
  masked_url: string | null;
  has_anon_key: boolean;
  has_service_key: boolean;
  connection_status: string | null;
  migrated_at: string | null;
}

export interface Subscription {
  tier: string;
  pages_used: number;
  pages_limit: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  crawls_this_month: number;
  team_members_count: number;
  team_members_limit: number;
}

export interface TeamMember {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "pending" | "active";
  invited_at: string;
  joined_at: string | null;
}

export interface WSProgress {
  job_id: string;
  pages_crawled: number;
  total_pages: number;
  current_url: string | null;
  speed: number;
  status: string;
}
