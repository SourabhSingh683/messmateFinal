
import { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface AuthState {
  isLoading: boolean;
  session: any | null;
  user: any | null;
  profile: UserProfile | null;
}
