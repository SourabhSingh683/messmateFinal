
import { MessService } from '@/types/database';
import { User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  mess?: MessService;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string, role: 'student' | 'mess_owner') => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUser?: (data: any) => Promise<void>;
}
