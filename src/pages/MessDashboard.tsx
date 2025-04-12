import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  MessService, 
  Subscription, 
  SubscriptionPlan, 
  MealSchedule, 
  Payment 
} from '@/types/database';
import { MealScheduleApi, PaymentsApi, SubscriptionPlansApi } from '@/utils/supabaseRawApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const MessDashboard = () => {
  const [messServices, setMessServices] = useState<MessService[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMessId, setActiveMessId] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [schedule, setSchedule] = useState<MealSchedule[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMessServices();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeMessId) {
      fetchActiveSubscriptions();
      fetchPayments();
      fetchPlans();
      fetchSchedule();
    }
  }, [activeMessId]);

  const fetchMessServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mess_services')
        .select('*')
        .eq('owner_id', user?.id);

      if (error) throw error;
      
      if (data) {
        setMessServices(data);
        if (data.length > 0) {
          setActiveMessId(data[0].id);
        }
      }
    } catch (error: any) {
      console.error("Error fetching mess services:", error.message);
      toast({
        title: "Failed to load mess services",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSubscriptions = async () => {
    if (!activeMessId) return;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles (first_name, last_name)
        `)
        .eq('mess_id', activeMessId)
        .eq('status', 'active');

      if (error) throw error;
      
      if (data) {
        setSubscriptions(data);
      }
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error.message);
      toast({
        title: "Failed to load subscriptions",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchPayments = async () => {
    if (!activeMessId) return;
    
    try {
      const payments = await PaymentsApi.getByMessId(activeMessId);
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

  const fetchPlans = async () => {
    if (!activeMessId) return;
    
    try {
      const plans = await SubscriptionPlansApi.getByMessId(activeMessId);
      setPlans(plans);
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error.message);
      toast({
        title: "Failed to load subscription plans",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchSchedule = async () => {
    if (!activeMessId) return;
    
    try {
      const schedule = await MealScheduleApi.getByMessId(activeMessId);
      setSchedule(schedule);
    } catch (error: any) {
      console.error("Error fetching meal schedule:", error.message);
      toast({
        title: "Failed to load meal schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const isSubscriptionActive = (subscription: Subscription) => {
    return subscription.status === 'active' && 
           new Date(subscription.end_date as string) > new Date();
  };

  const calculateTotalRevenue = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getActiveSubscribers = () => {
    return subscriptions.filter(isSubscriptionActive).length;
  };

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return schedule
      .filter(meal => meal.day_of_week === today)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
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

  if (messServices.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">No Mess Services</h1>
            <p className="text-muted-foreground mb-8">
              You don't have any mess services registered yet. Create your first mess service to manage it.
            </p>
            <Button onClick={() => navigate('/manage-mess')}>
              Register a New Mess
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mess Owner Dashboard</h1>
            {messServices.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Select Mess:</span>
                <select
                  value={activeMessId || ''}
                  onChange={(e) => setActiveMessId(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  {messServices.map((mess) => (
                    <option key={mess.id} value={mess.id}>
                      {mess.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={() => navigate('/manage-mess')}>
              Manage Mess
            </Button>
            <Button onClick={() => navigate(`/edit-mess/${activeMessId}`)}>
              Edit Current Mess
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{getActiveSubscribers()}</div>
              <p className="text-sm text-muted-foreground mt-1">Current active subscribers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{calculateTotalRevenue().toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">Lifetime revenue</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{payments.slice(0, 5).length}</div>
              <p className="text-sm text-muted-foreground mt-1">Recent payment transactions</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Today's Meals</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getTodaySchedule().length > 0 ? (
                <div className="space-y-4">
                  {getTodaySchedule().map((meal) => (
                    <div key={meal.id} className="flex items-center p-4 border rounded-lg">
                      <div className="flex-grow">
                        <h3 className="font-medium">{meal.meal_type}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(`2000-01-01T${meal.start_time}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {new Date(`2000-01-01T${meal.end_time}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {meal.description && (
                          <p className="text-sm mt-2">{meal.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No meals scheduled for today</p>
                  <Button 
                    onClick={() => navigate(`/edit-mess/${activeMessId}?tab=schedule`)} 
                    className="mt-4"
                  >
                    Add Meal Schedule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Your current subscription plans</CardDescription>
            </CardHeader>
            <CardContent>
              {plans.length > 0 ? (
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <div key={plan.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{plan.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{plan.duration_days} days</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold">₹{plan.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p>No subscription plans created yet</p>
                  <Button 
                    onClick={() => navigate(`/edit-mess/${activeMessId}?tab=plans`)} 
                    className="mt-4"
                  >
                    Create Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="subscribers" className="mt-8">
          <TabsList className="mb-4">
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="meal-schedule">Meal Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <CardTitle>Subscribers</CardTitle>
                <CardDescription>Students subscribed to your mess service</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.length > 0 ? (
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted">
                        <tr>
                          <th scope="col" className="px-6 py-3">Student</th>
                          <th scope="col" className="px-6 py-3">Plan</th>
                          <th scope="col" className="px-6 py-3">Start Date</th>
                          <th scope="col" className="px-6 py-3">End Date</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((subscription) => (
                          <tr key={subscription.id} className="bg-card border-b">
                            <td className="px-6 py-4">
                              {subscription.profiles.first_name} {subscription.profiles.last_name}
                            </td>
                            <td className="px-6 py-4">
                              {subscription.subscription_plans?.name || 'Standard Plan'}
                            </td>
                            <td className="px-6 py-4">
                              {new Date(subscription.start_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {subscription.end_date ? new Date(subscription.end_date as string).toLocaleDateString() : 'No end date'}
                            </td>
                            <td className="px-6 py-4">
                              <span 
                                className={`px-2 py-1 rounded-full text-xs ${
                                  isSubscriptionActive(subscription) 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No students have subscribed to your mess service yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Transaction history for your mess service</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted">
                        <tr>
                          <th scope="col" className="px-6 py-3">Date</th>
                          <th scope="col" className="px-6 py-3">Student</th>
                          <th scope="col" className="px-6 py-3">Amount</th>
                          <th scope="col" className="px-6 py-3">Method</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                          <th scope="col" className="px-6 py-3">Transaction ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="bg-card border-b">
                            <td className="px-6 py-4">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {payment.profiles.first_name} {payment.profiles.last_name}
                            </td>
                            <td className="px-6 py-4 font-medium">
                              ₹{payment.amount}
                            </td>
                            <td className="px-6 py-4">
                              {payment.payment_method}
                            </td>
                            <td className="px-6 py-4">
                              <span 
                                className={`px-2 py-1 rounded-full text-xs ${
                                  payment.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {payment.transaction_id || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No payment records yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="meal-schedule">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start">
                  <div>
                    <CardTitle>Meal Schedule</CardTitle>
                    <CardDescription>Weekly meal schedule for your mess service</CardDescription>
                  </div>
                  <Button 
                    onClick={() => navigate(`/edit-mess/${activeMessId}?tab=schedule`)}
                    className="mt-2 md:mt-0"
                  >
                    Edit Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {schedule.length > 0 ? (
                  <Tabs defaultValue="Monday" className="w-full">
                    <TabsList className="mb-4 w-full justify-start overflow-auto">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <TabsTrigger key={day} value={day}>
                          {day}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const daySchedule = schedule.filter(meal => meal.day_of_week === day);
                      
                      return (
                        <TabsContent key={day} value={day}>
                          {daySchedule.length > 0 ? (
                            <div className="space-y-4">
                              {daySchedule
                                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                .map(meal => (
                                  <div key={meal.id} className="p-4 border rounded-lg">
                                    <h3 className="font-medium">{meal.meal_type}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {new Date(`2000-01-01T${meal.start_time}`).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })} - {new Date(`2000-01-01T${meal.end_time}`).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                    {meal.description && (
                                      <p className="text-sm mt-2">{meal.description}</p>
                                    )}
                                  </div>
                                ))
                              }
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p>No meals scheduled for {day}</p>
                              <Button 
                                onClick={() => navigate(`/edit-mess/${activeMessId}?tab=schedule`)} 
                                className="mt-4"
                              >
                                Add {day} Schedule
                              </Button>
                            </div>
                          )}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                ) : (
                  <div className="text-center py-8">
                    <p>No meal schedule created yet.</p>
                    <Button 
                      onClick={() => navigate(`/edit-mess/${activeMessId}?tab=schedule`)} 
                      className="mt-4"
                    >
                      Create Meal Schedule
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MessDashboard;
