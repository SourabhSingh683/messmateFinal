import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { SubscriptionWithDetails, PaymentWithDetails, MealSchedule } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const StudentDashboard = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [mealSchedules, setMealSchedules] = useState<Record<string, MealSchedule[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
      fetchPayments();
    }
  }, [user]);

  useEffect(() => {
    if (subscriptions.length > 0) {
      const messIds = subscriptions.map(sub => sub.mess_id);
      fetchMealSchedules(messIds);
    }
  }, [subscriptions]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          mess_services (*),
          subscription_plans (*)
        `)
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setSubscriptions(data as SubscriptionWithDetails[]);
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
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          mess_services (*),
          subscriptions (*)
        `)
        .eq('student_id', user?.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setPayments(data as PaymentWithDetails[]);
      }
    } catch (error: any) {
      console.error("Error fetching payments:", error.message);
    }
  };

  const fetchMealSchedules = async (messIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('meal_schedule')
        .select('*')
        .in('mess_id', messIds);

      if (error) throw error;
      
      if (data) {
        const scheduleByMess: Record<string, MealSchedule[]> = {};
        data.forEach(item => {
          if (!scheduleByMess[item.mess_id]) {
            scheduleByMess[item.mess_id] = [];
          }
          scheduleByMess[item.mess_id].push(item);
        });
        setMealSchedules(scheduleByMess);
      }
    } catch (error: any) {
      console.error("Error fetching meal schedules:", error.message);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);

      if (error) throw error;
      
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled successfully."
      });
      
      fetchSubscriptions();
    } catch (error: any) {
      console.error("Error cancelling subscription:", error.message);
      toast({
        title: "Failed to cancel subscription",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const isSubscriptionActive = (subscription: SubscriptionWithDetails) => {
    return subscription.status === 'active' && 
           new Date(subscription.end_date as string) > new Date();
  };

  const getSubscriptionTimeLeft = (subscription: SubscriptionWithDetails) => {
    if (!subscription.end_date) return 'No end date';
    
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    
    if (endDate <= now) return 'Expired';
    
    const diffTime = Math.abs(endDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} days left`;
  };

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const activeMessIds = subscriptions
      .filter(isSubscriptionActive)
      .map(sub => sub.mess_id);
    
    const todayMeals: Array<MealSchedule & { mess_name: string }> = [];
    
    activeMessIds.forEach(messId => {
      const messSchedule = mealSchedules[messId] || [];
      const todayMessMeals = messSchedule.filter(meal => meal.day_of_week === today);
      
      const messName = subscriptions.find(sub => sub.mess_id === messId)?.mess_services.name || '';
      
      todayMeals.push(...todayMessMeals.map(meal => ({
        ...meal,
        mess_name: messName
      })));
    });
    
    return todayMeals.sort((a, b) => a.start_time.localeCompare(b.start_time));
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
                      <div className="flex flex-col flex-grow">
                        <div className="flex items-center">
                          <span className="font-medium">{meal.meal_type}</span>
                          <span className="mx-2 text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{meal.mess_name}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-muted-foreground">
                            {new Date(`2000-01-01T${meal.start_time}`).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - {new Date(`2000-01-01T${meal.end_time}`).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
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
                  {subscriptions.length === 0 ? (
                    <div className="mt-4">
                      <p className="mb-4">You haven't subscribed to any mess services yet.</p>
                      <Button onClick={() => navigate('/discover')}>
                        Find Mess Services
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>Your current mess subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.filter(isSubscriptionActive).length > 0 ? (
                <div className="space-y-4">
                  {subscriptions
                    .filter(isSubscriptionActive)
                    .map((subscription) => (
                      <div key={subscription.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{subscription.mess_services.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {subscription.subscription_plans?.name || 'Standard Plan'}
                        </p>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm">
                            {getSubscriptionTimeLeft(subscription)}
                          </span>
                          <span className="text-sm text-green-600 font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No active subscriptions</p>
                  <Button 
                    onClick={() => navigate('/discover')} 
                    className="mt-4"
                  >
                    Find Mess Services
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="subscriptions" className="mt-8">
          <TabsList className="mb-4">
            <TabsTrigger value="subscriptions">All Subscriptions</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="meal-schedule">Meal Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Your Subscriptions</CardTitle>
                <CardDescription>Manage your mess subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <Card key={subscription.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{subscription.mess_services.name}</CardTitle>
                              <CardDescription>
                                {subscription.subscription_plans?.name || 'Standard Plan'}
                              </CardDescription>
                            </div>
                            <span 
                              className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                                isSubscriptionActive(subscription)
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p>{new Date(subscription.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">End Date</p>
                              <p>{subscription.end_date ? new Date(subscription.end_date as string).toLocaleDateString() : 'No end date'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Price</p>
                              <p>₹{subscription.subscription_plans?.price || subscription.mess_services.price_monthly}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Time Left</p>
                              <p>{getSubscriptionTimeLeft(subscription)}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button 
                            variant="outline" 
                            onClick={() => navigate(`/mess-details/${subscription.mess_id}`)}
                          >
                            View Mess
                          </Button>
                          {isSubscriptionActive(subscription) && (
                            <Button 
                              variant="destructive"
                              onClick={() => handleCancelSubscription(subscription.id)}
                            >
                              Cancel Subscription
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>You haven't subscribed to any mess services yet.</p>
                    <Button 
                      onClick={() => navigate('/discover')} 
                      className="mt-4"
                    >
                      Find Mess Services
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your transaction history for mess subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted">
                        <tr>
                          <th scope="col" className="px-6 py-3">Date</th>
                          <th scope="col" className="px-6 py-3">Mess</th>
                          <th scope="col" className="px-6 py-3">Amount</th>
                          <th scope="col" className="px-6 py-3">Method</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="bg-card border-b">
                            <td className="px-6 py-4">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {payment.mess_services.name}
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>You don't have any payment records yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="meal-schedule">
            <Card>
              <CardHeader>
                <CardTitle>Meal Schedule</CardTitle>
                <CardDescription>Weekly meal schedule for your subscribed mess services</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.filter(isSubscriptionActive).length > 0 ? (
                  <Tabs defaultValue="Monday" className="w-full">
                    <TabsList className="mb-4 w-full justify-start overflow-auto">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <TabsTrigger key={day} value={day}>
                          {day}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <TabsContent key={day} value={day}>
                        <div className="space-y-4">
                          {subscriptions
                            .filter(isSubscriptionActive)
                            .map(subscription => {
                              const messSchedule = mealSchedules[subscription.mess_id] || [];
                              const daySchedule = messSchedule.filter(meal => meal.day_of_week === day);
                              
                              if (daySchedule.length === 0) return null;
                              
                              return (
                                <Card key={subscription.mess_id}>
                                  <CardHeader>
                                    <CardTitle className="text-lg">{subscription.mess_services.name}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      {daySchedule
                                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                        .map(meal => (
                                          <div key={meal.id} className="flex p-3 border rounded-lg">
                                            <div className="flex-grow">
                                              <h4 className="font-medium">{meal.meal_type}</h4>
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
                                        ))
                                      }
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })
                            .filter(Boolean)
                          }
                          
                          {subscriptions
                            .filter(isSubscriptionActive)
                            .every(subscription => {
                              const messSchedule = mealSchedules[subscription.mess_id] || [];
                              return messSchedule.filter(meal => meal.day_of_week === day).length === 0;
                            }) && (
                              <div className="text-center py-6">
                                <p>No meals scheduled for {day}</p>
                              </div>
                            )
                          }
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="text-center py-8">
                    <p>You don't have any active subscriptions to view meal schedules.</p>
                    <Button 
                      onClick={() => navigate('/discover')} 
                      className="mt-4"
                    >
                      Find Mess Services
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

export default StudentDashboard;
