
import { MessService } from '@/types/database';
import { User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  session: any | null;
  signUp: (email: string, password: string, userData: {
    first_name: string;
    last_name: string;
    role: UserRole;
    messName?: string;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
