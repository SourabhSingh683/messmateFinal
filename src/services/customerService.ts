
import { supabase } from '@/integrations/supabase/client';
import { fetchFromSupabase } from '@/utils/supabaseRawApi';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  mess_id: string;
  subscription_status: string;
}

export const fetchCustomers = async (messId: string): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      id,
      student_id,
      mess_id,
      status,
      created_at,
      profiles:student_id(
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('mess_id', messId);

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    student_id: item.student_id,
    first_name: item.profiles?.first_name || 'Unknown',
    last_name: item.profiles?.last_name || 'Unknown',
    created_at: item.created_at || new Date().toISOString(),
    mess_id: item.mess_id,
    subscription_status: item.status,
  }));
};

export const addCustomer = async (
  messId: string, 
  firstName: string, 
  lastName: string
): Promise<void> => {
  const randomProfileId = crypto.randomUUID();
  
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert({
      student_id: randomProfileId,
      mess_id: messId,
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    
  if (subscriptionError) {
    throw subscriptionError;
  }

  try {
    await fetchFromSupabase(`/rest/v1/rpc/create_profile_with_id`, {
      method: 'POST',
      body: JSON.stringify({
        profile_id: randomProfileId,
        first_name_val: firstName,
        last_name_val: lastName,
        role_val: 'student'
      })
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create profile');
  }
};

export const deleteCustomer = async (customerId: string): Promise<void> => {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', customerId);

  if (error) throw error;
};
