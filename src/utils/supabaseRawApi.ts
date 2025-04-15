
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
  "Content-Type": "application/json",
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
};

// Get the session token if available
const getAuthHeaders = () => {
  const storedSession = localStorage.getItem('supabase.auth.token');
  if (storedSession) {
    try {
      const session = JSON.parse(storedSession);
      if (session?.access_token) {
        return {
          ...baseHeaders,
          "Authorization": `Bearer ${session.access_token}`
        };
      }
    } catch (error) {
      console.error("Error parsing session:", error);
    }
  }
  return baseHeaders;
};

// Generic fetch function with proper typing
export async function fetchFromSupabase<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${SUPABASE_URL}${path}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase API error: ${response.status} ${response.statusText} - ${errorText}`);
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
      headers: { "Prefer": "return=representation" }
    }),
  
  update: (id: string, data: any) => 
    fetchFromSupabase<any>(`/rest/v1/subscription_plans?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=representation" }
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
      headers: { "Prefer": "return=representation" }
    }),
  
  update: (id: string, data: any) => 
    fetchFromSupabase<any>(`/rest/v1/meal_schedule?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=representation" }
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
      headers: { "Prefer": "return=representation" }
    })
};

// Direct API for custom tables
export const AnnouncementsApi = {
  getByMessId: (messId: string) => 
    fetchFromSupabase<any[]>(`/rest/v1/announcements?mess_id=eq.${messId}&order=created_at.desc`),
  
  create: (data: any) => 
    fetchFromSupabase<any>(`/rest/v1/announcements`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=representation" }
    }),
  
  update: (id: string, data: any) => 
    fetchFromSupabase<any>(`/rest/v1/announcements?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=representation" }
    }),
  
  delete: (id: string) => 
    fetchFromSupabase<any>(`/rest/v1/announcements?id=eq.${id}`, {
      method: 'DELETE',
      headers: { "Prefer": "return=minimal" }
    })
};

export const InventoryItemsApi = {
  getByMessId: (messId: string) => 
    fetchFromSupabase<any[]>(`/rest/v1/inventory_items?mess_id=eq.${messId}&order=created_at.desc`),
  
  create: (data: any) => 
    fetchFromSupabase<any>(`/rest/v1/inventory_items`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=representation" }
    }),
  
  update: (id: string, data: any) => 
    fetchFromSupabase<any>(`/rest/v1/inventory_items?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=representation" }
    }),
  
  delete: (id: string) => 
    fetchFromSupabase<any>(`/rest/v1/inventory_items?id=eq.${id}`, {
      method: 'DELETE',
      headers: { "Prefer": "return=minimal" }
    })
};

export const MenuItemsApi = {
  getByMessId: (messId: string) => 
    fetchFromSupabase<any[]>(`/rest/v1/menu_items?mess_id=eq.${messId}&order=created_at.desc`),
  
  create: (data: any) => 
    fetchFromSupabase<any>(`/rest/v1/menu_items`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=representation" }
    }),
  
  update: (id: string, data: any) => 
    fetchFromSupabase<any>(`/rest/v1/menu_items?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=representation" }
    }),
  
  delete: (id: string) => 
    fetchFromSupabase<any>(`/rest/v1/menu_items?id=eq.${id}`, {
      method: 'DELETE',
      headers: { "Prefer": "return=minimal" }
    })
};

export const FeedbackApi = {
  getByMessId: (messId: string) => 
    fetchFromSupabase<any[]>(`/rest/v1/reviews?mess_id=eq.${messId}&select=*,profiles(first_name,last_name)&order=created_at.desc`),
};

export const CustomersApi = {
  getByMessId: (messId: string) => 
    fetchFromSupabase<any[]>(`/rest/v1/subscriptions?mess_id=eq.${messId}&select=*,profiles:profiles(id,first_name,last_name)&order=created_at.desc`),

  addCustomer: (data: any) => 
    fetchFromSupabase<any>(`/rest/v1/subscriptions`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { "Prefer": "return=representation" }
    }),
};
