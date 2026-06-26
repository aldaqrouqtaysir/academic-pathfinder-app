import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface SupabaseDatabase {
  public: {
    Tables: {
      student_plans: {
        Row: {
          id: string;
          student_id: string;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          answers: Json;
          scenario: Json;
          outputs: Json | null;
        };
        Insert: {
          id: string;
          student_id: string;
          created_at: string;
          updated_at: string;
          is_active?: boolean;
          answers: Json;
          scenario: Json;
          outputs?: Json | null;
        };
        Update: {
          updated_at?: string;
          is_active?: boolean;
          answers?: Json;
          scenario?: Json;
          outputs?: Json | null;
        };
        Relationships: [];
      };
      counselor_notes: {
        Row: {
          id: string;
          student_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id: string;
          student_id: string;
          body: string;
          created_at: string;
        };
        Update: {
          body?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

let cachedClient: SupabaseClient<SupabaseDatabase> | null | undefined;
let warnedPartialConfig = false;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return { url, serviceRoleKey };
}

export function isSupabasePersistenceConfigured() {
  const { url, serviceRoleKey } = getSupabaseConfig();
  return Boolean(url && serviceRoleKey);
}

export function getSupabaseAdminClient(): SupabaseClient<SupabaseDatabase> | null {
  const { url, serviceRoleKey } = getSupabaseConfig();

  if (!url || !serviceRoleKey) {
    if ((url || serviceRoleKey) && !warnedPartialConfig) {
      warnedPartialConfig = true;
      console.warn("[supabasePersistence] Supabase persistence is partially configured; using file-based fallback.");
    }
    cachedClient = null;
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient<SupabaseDatabase>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  return cachedClient;
}

export function summarizeSupabaseError(error: { code?: string; message?: string; details?: string; hint?: string }) {
  return {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  };
}
