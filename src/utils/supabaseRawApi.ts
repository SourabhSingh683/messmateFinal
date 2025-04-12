
/**
 * Helper utility for making raw API calls to Supabase REST API
 * This is useful for tables that aren't included in the TypeScript types
 */

// Supabase project details
const SUPABASE_URL = "https://wemmsixixuxppkxeluhw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbW1zaXhpeHV4cHBreGVsdWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTQ4NzEsImV4cCI6MjA2MDAzMDg3MX0._3nIUs_l0spO3Fd-d_TjhWW8Vm7yfS7dLAufU1sluFg";

// Base headers for all requests
const baseHeaders = {
  "apikey": SUPABASE_ANON_KEY,
  "Content-Type": "application/json"
};

// Generic fetch function with proper typing
async function fetchFromSupabase<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${SUPABASE_URL}${path}`;
  const headers = {
    ...baseHeaders,
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
  }
  
  // For DELETE requests or other requests that might not return content
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }
  
  return await response.json() as T;
}

// Table-specific functions
export const SubscriptionPlansApi = {
  getByMessId: (messId: string) => 
    fetchFromSupabase<any[]>(`/rest/v1/subscription_plans?mess_id=eq.${messId}&order=price.asc`),
  
  getActiveByMessId: (messId: string) => 
    fetchFromSupabase<any[]>(`/rest/v1/subscription_plans?mess_id=eq.${messId}&is_active=eq.true&order=price.asc`),
  
  create: (data: any) => 
    fetchFromSupabase<any>(`/rest/v1/subscription_plans`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=minimal" }
    }),
  
  update: (id: string, data: any) => 
    fetchFromSupabase<any>(`/rest/v1/subscription_plans?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=minimal" }
    }),
  
  delete: (id: string) => 
    fetchFromSupabase<any>(`/rest/v1/subscription_plans?id=eq.${id}`, {
      method: 'DELETE',
      headers: { "Prefer": "return=minimal" }
    })
};

export const MealScheduleApi = {
  getByMessId: (messId: string) => 
    fetchFromSupabase<any[]>(`/rest/v1/meal_schedule?mess_id=eq.${messId}&order=day_of_week.asc,start_time.asc`),
  
  create: (data: any) => 
    fetchFromSupabase<any>(`/rest/v1/meal_schedule`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=minimal" }
    }),
  
  update: (id: string, data: any) => 
    fetchFromSupabase<any>(`/rest/v1/meal_schedule?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=minimal" }
    }),
  
  delete: (id: string) => 
    fetchFromSupabase<any>(`/rest/v1/meal_schedule?id=eq.${id}`, {
      method: 'DELETE',
      headers: { "Prefer": "return=minimal" }
    })
};

export const PaymentsApi = {
  getByStudentId: (studentId: string) => 
    fetchFromSupabase<any[]>(`/rest/v1/payments?student_id=eq.${studentId}&order=payment_date.desc`),
  
  getByMessId: (messId: string) => 
    fetchFromSupabase<any[]>(`/rest/v1/payments?mess_id=eq.${messId}&order=payment_date.desc`),
  
  create: (data: any) => 
    fetchFromSupabase<any>(`/rest/v1/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=minimal" }
    })
};
