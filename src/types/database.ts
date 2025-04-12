
import { Database } from '@/integrations/supabase/types';

// Type-safe table names
export type TableNames = keyof Database['public']['Tables'];

// Helper type for getting row types from a table
export type TableRow<T extends TableNames> = Database['public']['Tables'][T]['Row'];

// Create custom type definitions for all tables used in our application
export type MessService = TableRow<'mess_services'>;
export type Profile = TableRow<'profiles'>;
export type Subscription = TableRow<'subscriptions'>;
export type MessImage = TableRow<'mess_images'>;
export type Review = TableRow<'reviews'>;
export type Payment = TableRow<'payments'>;
export type SubscriptionPlan = TableRow<'subscription_plans'>;
export type MealSchedule = TableRow<'meal_schedule'>;

// Custom joined types for complex queries
export type SubscriptionWithDetails = Subscription & {
  mess_services: MessService;
  subscription_plans: SubscriptionPlan | null;
};

export type PaymentWithDetails = Payment & {
  mess_services: MessService;
  subscriptions: Subscription;
  profiles?: Profile;
};
