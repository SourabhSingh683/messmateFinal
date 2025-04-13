
import { Database } from '@/integrations/supabase/types';

// Type-safe table names
export type TableNames = keyof Database['public']['Tables'];

// Helper type for getting row types from a table
export type TableRow<T extends TableNames> = Database['public']['Tables'][T]['Row'];

// Create custom type definitions for all tables used in our application
export type MessService = TableRow<'mess_services'>;
export type Profile = TableRow<'profiles'> & {
  latitude?: number;
  longitude?: number;
};
export type Subscription = TableRow<'subscriptions'>;
export type MessImage = TableRow<'mess_images'>;
export type Review = TableRow<'reviews'>;

// Define types for the new tables we created
export type Payment = {
  id: string;
  subscription_id: string;
  student_id: string;
  mess_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  transaction_id?: string;
  created_at: string;
};

export type SubscriptionPlan = {
  id: string;
  mess_id: string;
  name: string;
  duration_days: number;
  price: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MealSchedule = {
  id: string;
  mess_id: string;
  day_of_week: string;
  meal_type: string;
  start_time: string;
  end_time: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

// Add types for the new tables
export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  day_of_week: string;
  meal_type: string;
  is_vegetarian: boolean;
  mess_id: string;
  created_at: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  mess_id: string;
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  start_date: string;
  end_date: string;
  mess_id: string;
  created_at: string;
};

// Custom joined types for complex queries
export type SubscriptionWithDetails = Subscription & {
  mess_services: MessService;
  subscription_plans?: SubscriptionPlan | null;
  profiles?: {
    first_name: string;
    last_name: string;
  };
};

export type PaymentWithDetails = Payment & {
  mess_services: MessService;
  subscriptions: Subscription;
  profiles?: {
    first_name: string;
    last_name: string;
  };
};
