import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  Subscription, 
  MessService, 
  Payment, 
  MealSchedule 
} from '@/types/database';
import { MealScheduleApi, PaymentsApi } from '@/utils/supabaseRawApi';
import { Button } from '@/components/ui/button';

const StudentDashboard = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeMessId, setActiveMessId] = useState<string | null>(null);
  const [messServices, setMessServices] = useState<MessService[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<MealSchedule[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchActiveSubscriptions();
      fetchPayments();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch meal schedule when active mess changes
  useEffect(() => {
    if (activeMessId) {
      fetchMealSchedule();
    }
  }, [activeMessId]);

  const fetchActiveSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          mess_services(*)
        `)
        .eq('student_id', user?.id)
        .eq('status', 'active');

      if (error) throw error;
      
      if (data) {
        setSubscriptions(data);
        
        // Extract mess IDs and fetch mess services
        const messIds = data.map(sub => sub.mess_id);
        if (messIds.length > 0) {
          const { data: messData, error: messError } = await supabase
            .from('mess_services')
            .select('*')
            .in('id', messIds);
            
          if (messError) throw messError;
          
          if (messData) {
            setMessServices(messData);
            // Set the first mess as active if there is one
            if (messData.length > 0) {
              setActiveMessId(messData[0].id);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error.message);
      toast({
        title: "Failed to load subscriptions",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!user) return;
    
    try {
      const payments = await PaymentsApi.getByStudentId(user.id);
      setPayments(payments);
    } catch (error: any) {
      console.error("Error fetching payments:", error.message);
      toast({
        title: "Failed to load payments",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchMealSchedule = async () => {
    if (!activeMessId) return;
    
    try {
      const schedule = await MealScheduleApi.getByMessId(activeMessId);
      setSchedule(schedule);
      
      // Create a map for mess names
      const messNameMap: Record<string, string> = {};
      messServices.forEach(mess => {
        messNameMap[mess.id] = mess.name;
      });
      
      // Augment schedule with mess names
      const augmentedSchedule = schedule.map(item => ({
        ...item,
        mess_name: messNameMap[item.mess_id] || 'Unknown Mess'
      }));
      
      setSchedule(augmentedSchedule);
    } catch (error: any) {
      console.error("Error fetching meal schedule:", error.message);
      toast({
        title: "Failed to load meal schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-messmate-brown"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

        {subscriptions.length > 0 ? (
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Active Subscriptions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((sub) => {
                  const mess = messServices.find(mess => mess.id === sub.mess_id);
                  return mess ? (
                    <div key={sub.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{mess.name}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Subscription Status: {sub.status}
                        </p>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Start Date: {new Date(sub.start_date).toLocaleDateString()}
                        </p>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          End Date: {new Date(sub.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </section>

            {activeMessId && schedule.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Meal Schedule</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {schedule.map((meal) => (
                    <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{meal.meal_type}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Day: {meal.day_of_week}
                        </p>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Time: {meal.start_time} - {meal.end_time}
                        </p>
                        {meal.description && (
                          <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Description: {meal.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          ₹{payment.amount}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {payment.payment_method}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {payment.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No Active Subscriptions</h2>
            <p className="text-muted-foreground">
              You are not currently subscribed to any mess services.
            </p>
            <Button onClick={() => navigate('/discover')} className="mt-4">
              Discover Mess Services
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
