
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  Subscription, 
  MessService, 
  Payment, 
  MealSchedule 
} from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, CalendarDays, CreditCard, Clock, MapPin, Coffee, MessageSquare } from 'lucide-react';
import RateFeedbackForm from '@/components/student-dashboard/RateFeedbackForm';
import MessReviews from '@/components/student-dashboard/MessReviews';
import { Spinner } from '@/components/ui/spinner';

const StudentDashboard = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeMessId, setActiveMessId] = useState<string | null>(null);
  const [activeMessName, setActiveMessName] = useState<string>('');
  const [messServices, setMessServices] = useState<MessService[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<MealSchedule[]>([]);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          mess_services(*)
        `)
        .eq('student_id', user?.id)
        .eq('status', 'active');

      if (error) {
        setError(error.message);
        throw error;
      }
      
      if (data) {
        console.log("Fetched subscriptions:", data);
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
              setActiveMessName(messData[0].name);
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
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', user.id)
        .order('payment_date', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setPayments(data);
      }
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
      const { data, error } = await supabase
        .from('meal_schedule')
        .select('*')
        .eq('mess_id', activeMessId)
        .order('day_of_week', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setSchedule(data);
      }
    } catch (error: any) {
      console.error("Error fetching meal schedule:", error.message);
      toast({
        title: "Failed to load meal schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hourNum = parseInt(hours);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const formattedHours = hourNum % 12 || 12;
      return `${formattedHours}:${minutes} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  const handleMessChange = (messId: string) => {
    const mess = messServices.find(m => m.id === messId);
    setActiveMessId(messId);
    setActiveMessName(mess?.name || '');
  };

  const handleFeedbackSubmitted = () => {
    // Re-fetch subscriptions to update any ratings
    fetchActiveSubscriptions();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto flex justify-center items-center py-16">
          <Spinner className="h-12 w-12" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6 flex-wrap gap-2">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1">Back</span>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#5C2C0C]">Student Dashboard</h1>
          <div className="ml-auto">
            <Button 
              onClick={() => navigate('/discover')} 
              className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white"
            >
              Find Mess Services
            </Button>
          </div>
        </div>

        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="subscriptions" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>Subscriptions</span>
            </TabsTrigger>
            <TabsTrigger value="mealSchedule" className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>Meal Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>Rate & Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>Payments</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscriptions">
            <Card className="border border-[#C4A484]/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-[#5C2C0C]">Your Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptions.map((sub) => {
                      const mess = messServices.find(mess => mess.id === sub.mess_id);
                      return mess ? (
                        <div key={sub.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-[#C4A484]/20 hover:shadow-lg transition-shadow">
                          <div className="h-32 bg-gradient-to-r from-[#8B4513]/10 to-[#E67E22]/5 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-[#5C2C0C] font-bold text-lg">
                                {mess.name}
                              </div>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                sub.status === 'active' ? 'bg-green-100 text-green-800' : 
                                sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {sub.status}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-[#8B4513]">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{mess.address}</span>
                              </div>
                              <div className="flex items-center text-sm text-[#8B4513]">
                                <CalendarDays className="h-4 w-4 mr-1" />
                                <span>Start: {new Date(sub.start_date).toLocaleDateString()}</span>
                              </div>
                              {sub.end_date && (
                                <div className="flex items-center text-sm text-[#8B4513]">
                                  <CalendarDays className="h-4 w-4 mr-1" />
                                  <span>End: {new Date(sub.end_date).toLocaleDateString()}</span>
                                </div>
                              )}
                              <div className="pt-2">
                                <Button 
                                  size="sm" 
                                  className="w-full bg-[#8B4513] hover:bg-[#5C2C0C] text-white"
                                  onClick={() => navigate(`/mess/${mess.id}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#FDF6E3]/50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2 text-[#5C2C0C]">No Active Subscriptions</h2>
                    <p className="text-[#8B4513] mb-4">
                      You are not currently subscribed to any mess services.
                    </p>
                    <Button 
                      onClick={() => navigate('/discover')} 
                      className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white"
                    >
                      Discover Mess Services
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mealSchedule">
            <Card className="border border-[#C4A484]/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-[#5C2C0C]">Meal Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {activeMessId && schedule.length > 0 ? (
                  <div>
                    {messServices.length > 1 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-[#5C2C0C] mb-2">Select Mess Service:</label>
                        <div className="flex flex-wrap gap-2">
                          {messServices.map(mess => (
                            <Button
                              key={mess.id}
                              variant={activeMessId === mess.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleMessChange(mess.id)}
                              className={activeMessId === mess.id ? 
                                "bg-[#8B4513] hover:bg-[#5C2C0C] text-white" : 
                                "border-[#C4A484] text-[#8B4513]"
                              }
                            >
                              {mess.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {schedule.map((meal) => (
                        <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-[#C4A484]/20 hover:shadow-lg transition-shadow">
                          <div className="h-12 bg-gradient-to-r from-[#8B4513]/10 to-[#E67E22]/5 flex items-center px-4">
                            <Coffee className="h-5 w-5 mr-2 text-[#5C2C0C]" />
                            <h3 className="text-lg font-medium text-[#5C2C0C] capitalize">{meal.meal_type}</h3>
                          </div>
                          <div className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center text-sm text-[#8B4513]">
                                <CalendarDays className="h-4 w-4 mr-1" />
                                <span className="capitalize">{meal.day_of_week}</span>
                              </div>
                              <div className="flex items-center text-sm text-[#8B4513]">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{formatTime(meal.start_time)} - {formatTime(meal.end_time)}</span>
                              </div>
                              {meal.description && (
                                <div className="text-sm text-[#8B4513] mt-2 italic">
                                  {meal.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#FDF6E3]/50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2 text-[#5C2C0C]">No Meal Schedule Available</h2>
                    <p className="text-[#8B4513]">
                      {subscriptions.length === 0 
                        ? "Subscribe to a mess service to view meal schedules." 
                        : "This mess service hasn't published a meal schedule yet."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="feedback">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.length > 0 ? (
                <>
                  <div>
                    {messServices.length > 1 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-[#5C2C0C] mb-2">Select Mess Service:</label>
                        <div className="flex flex-wrap gap-2">
                          {messServices.map(mess => (
                            <Button
                              key={mess.id}
                              variant={activeMessId === mess.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleMessChange(mess.id)}
                              className={activeMessId === mess.id ? 
                                "bg-[#8B4513] hover:bg-[#5C2C0C] text-white" : 
                                "border-[#C4A484] text-[#8B4513]"
                              }
                            >
                              {mess.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {user && activeMessId && (
                      <RateFeedbackForm 
                        messId={activeMessId}
                        messName={activeMessName}
                        userId={user.id}
                        onFeedbackSubmitted={handleFeedbackSubmitted}
                      />
                    )}
                  </div>
                  
                  <div>
                    {activeMessId && (
                      <MessReviews 
                        messId={activeMessId}
                        messName={activeMessName}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="col-span-2 text-center py-8 bg-[#FDF6E3]/50 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2 text-[#5C2C0C]">No Active Subscriptions</h2>
                  <p className="text-[#8B4513] mb-4">
                    You need to subscribe to a mess service before you can leave a review.
                  </p>
                  <Button 
                    onClick={() => navigate('/discover')} 
                    className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white"
                  >
                    Discover Mess Services
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card className="border border-[#C4A484]/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-[#5C2C0C]">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-[#FDF6E3] text-[#5C2C0C]">
                        <tr>
                          <th className="px-5 py-3 border-b border-[#C4A484]/20 text-left text-xs font-semibold uppercase">
                            Date
                          </th>
                          <th className="px-5 py-3 border-b border-[#C4A484]/20 text-left text-xs font-semibold uppercase">
                            Amount
                          </th>
                          <th className="px-5 py-3 border-b border-[#C4A484]/20 text-left text-xs font-semibold uppercase">
                            Method
                          </th>
                          <th className="px-5 py-3 border-b border-[#C4A484]/20 text-left text-xs font-semibold uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C4A484]/10">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-[#FDF6E3]/30">
                            <td className="px-5 py-4 text-sm text-[#5C2C0C]">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-[#5C2C0C]">
                              ₹{payment.amount}
                            </td>
                            <td className="px-5 py-4 text-sm text-[#5C2C0C] capitalize">
                              {payment.payment_method}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#FDF6E3]/50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2 text-[#5C2C0C]">No Payment History</h2>
                    <p className="text-[#8B4513]">
                      You haven't made any payments yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
