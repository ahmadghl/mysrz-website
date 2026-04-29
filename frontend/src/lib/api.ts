// src/lib/api.ts
import { supabase } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Domains ────────────────────────────────────────────────────────────────
export const api = {
  domains: {
    list: () => request<any[]>("/api/domains"),
    add: (url: string) => request<any>("/api/domains", { method: "POST", body: JSON.stringify({ url }) }),
    toggleSelect: (id: string) => request<any>(`/api/domains/${id}/select`, { method: "PUT" }),
    delete: (id: string) => request<void>(`/api/domains/${id}`, { method: "DELETE" }),
  },

  crawl: {
    start: (domain_ids?: string[]) =>
      request<any>("/api/crawl/start", { method: "POST", body: JSON.stringify({ domain_ids }) }),
    stop: (jobId: string) => request<any>(`/api/crawl/stop/${jobId}`, { method: "POST" }),
    status: (jobId: string) => request<any>(`/api/crawl/status/${jobId}`),
    history: () => request<any[]>("/api/crawl/history"),
  },

  schedules: {
    list: () => request<any[]>("/api/schedules"),
    create: (data: any) => request<any>("/api/schedules", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/schedules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/schedules/${id}`, { method: "DELETE" }),
    toggle: (id: string) => request<any>(`/api/schedules/${id}/toggle`, { method: "POST" }),
  },

  chat: {
    sessions: {
      list: () => request<any[]>("/api/chat/sessions"),
      create: (domain_id: string, name?: string) =>
        request<any>("/api/chat/sessions", { method: "POST", body: JSON.stringify({ domain_id, name }) }),
      delete: (id: string) => request<void>(`/api/chat/sessions/${id}`, { method: "DELETE" }),
    },
    messages: {
      list: (sessionId: string) => request<any[]>(`/api/chat/sessions/${sessionId}/messages`),
      send: (sessionId: string, content: string, file_ids?: string[]) =>
        request<any>(`/api/chat/sessions/${sessionId}/messages`, {
          method: "POST",
          body: JSON.stringify({ content, file_ids }),
        }),
    },
    upload: async (file: File) => {
      const headers = await getAuthHeaders();
      delete (headers as any)["Content-Type"]; // let browser set multipart boundary
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/api/chat/upload`, {
        method: "POST",
        headers: { Authorization: headers.Authorization },
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
  },

  settings: {
    openai: {
      get: () => request<any>("/api/settings/openai-key"),
      save: (data: any) => request<any>("/api/settings/openai-key", { method: "POST", body: JSON.stringify(data) }),
    },
    prompt: {
      get: () => request<any>("/api/settings/prompt"),
      save: (system_prompt: string) =>
        request<any>("/api/settings/prompt", { method: "POST", body: JSON.stringify({ system_prompt }) }),
    },
    subscription: () => request<any>("/api/settings/subscription"),
    supabase: {
      get: () => request<any>("/api/settings/supabase"),
      test: (data: any) => request<any>("/api/settings/supabase/test", { method: "POST", body: JSON.stringify(data) }),
      save: (data: any) => request<any>("/api/settings/supabase", { method: "POST", body: JSON.stringify(data) }),
      migrate: () => request<any>("/api/settings/supabase/migrate", { method: "POST" }),
      migrateData: () => request<any>("/api/settings/supabase/migrate-data", { method: "POST" }),
      reset: () => request<any>("/api/settings/supabase/reset", { method: "POST" }),
    },
  },

  team: {
    list: () => request<any[]>("/api/team"),
    invite: (email: string, role: string) =>
      request<any>("/api/team/invite", { method: "POST", body: JSON.stringify({ email, role }) }),
    updateRole: (id: string, role: string) =>
      request<any>(`/api/team/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
    remove: (id: string) => request<void>(`/api/team/${id}`, { method: "DELETE" }),
  },
};
