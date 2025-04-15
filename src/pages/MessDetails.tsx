import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { MessService, SubscriptionPlan, MealSchedule } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Star, ChevronLeft, AlertCircle } from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";

const MessDetails = () => {
  const { messId } = useParams<{ messId: string }>();
  const [mess, setMess] = useState<MessService | null>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [schedule, setSchedule] = useState<MealSchedule[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (messId) {
      fetchMessDetails();
    }
  }, [messId]);

  const fetchMessDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching mess with ID:", messId);
      
      const { data, error } = await supabase
        .from('mess_services')
        .select('*')
        .eq('id', messId)
        .single();

      if (error) {
        console.error("Error fetching mess details:", error.message);
        setError(error.message);
        throw error;
      }
      
      if (data) {
        console.log("Mess data received:", data);
        setMess(data);
        
        await Promise.all([
          fetchPlans(data.id),
          fetchSchedule(data.id),
          fetchImages(data.id)
        ]);
      } else {
        console.log("No mess data found");
        setError("Mess service not found");
      }
    } catch (error: any) {
      console.error("Error fetching mess details:", error.message);
      toast({
        title: "Failed to load mess details",
        description: error.message,
        variant: "destructive"
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async (id: string) => {
    try {
      console.log("Fetching plans for mess ID:", id);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('mess_id', id)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error("Error fetching subscription plans:", error.message);
        throw error;
      }
      
      if (data) {
        console.log("Plans data received:", data.length);
        setPlans(data);
      }
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error.message);
    }
  };

  const fetchSchedule = async (id: string) => {
    try {
      console.log("Fetching schedule for mess ID:", id);
      const { data, error } = await supabase
        .from('meal_schedule')
        .select('*')
        .eq('mess_id', id)
        .order('day_of_week', { ascending: true });

      if (error) {
        console.error("Error fetching meal schedule:", error.message);
        throw error;
      }
      
      if (data) {
        console.log("Schedule data received:", data.length);
        setSchedule(data);
      }
    } catch (error: any) {
      console.error("Error fetching meal schedule:", error.message);
    }
  };

  const fetchImages = async (id: string) => {
    try {
      console.log("Fetching images for mess ID:", id);
      const { data, error } = await supabase
        .from('mess_images')
        .select('image_url')
        .eq('mess_id', id);

      if (error) {
        console.error("Error fetching mess images:", error.message);
        throw error;
      }
      
      if (data) {
        console.log("Images data received:", data.length);
        setImages(data.map(img => img.image_url));
      }
    } catch (error: any) {
      console.error("Error fetching mess images:", error.message);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to subscribe to this mess.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (profile?.role !== 'student') {
      toast({
        title: "Not allowed",
        description: "Only students can subscribe to mess services.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!mess) return;
      
      const selectedPlan = plans.find(p => p.id === planId);
      if (!selectedPlan) return;

      const { data: existingSub, error: subCheckError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('mess_id', mess.id)
        .eq('student_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subCheckError) throw subCheckError;
      
      if (existingSub) {
        toast({
          title: "Already subscribed",
          description: "You already have an active subscription with this mess.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          mess_id: mess.id,
          student_id: user.id,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + selectedPlan.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active'
        })
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            subscription_id: data[0].id,
            student_id: user.id,
            mess_id: mess.id,
            amount: selectedPlan.price,
            payment_method: 'Online Payment',
            status: 'completed',
            transaction_id: `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
          });
        
        if (paymentError) {
          throw paymentError;
        }
      }

      toast({
        title: "Subscription successful!",
        description: `You have successfully subscribed to ${mess.name}`,
      });
      
      navigate('/student-dashboard');
    } catch (error: any) {
      console.error("Error subscribing to mess:", error.message);
      toast({
        title: "Subscription failed",
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
          <div className="flex flex-col items-center">
            <Spinner className="h-12 w-12 mb-4" />
            <p className="text-muted-foreground">Loading mess details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <div className="max-w-lg mx-auto bg-card p-6 rounded-lg shadow-md border">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-3xl font-bold mb-4">Error Loading Mess Details</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/discover')}>
              Back to Discover
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!mess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <div className="max-w-lg mx-auto bg-card p-6 rounded-lg shadow-md border">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-3xl font-bold mb-4">Mess Not Found</h1>
            <p className="text-muted-foreground mb-6">The mess service you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/discover')}>
              Back to Discover
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const scheduleByDay: Record<string, MealSchedule[]> = {};
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  schedule.forEach(item => {
    if (!scheduleByDay[item.day_of_week]) {
      scheduleByDay[item.day_of_week] = [];
    }
    scheduleByDay[item.day_of_week].push(item);
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/discover')}
            className="mb-4 flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Discover
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="rounded-lg overflow-hidden mb-6 h-64 md:h-96 bg-muted">
                {images.length > 0 ? (
                  <img
                    src={images[0]}
                    alt={mess.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {images.slice(0, 4).map((img, index) => (
                    <div key={index} className="rounded-lg overflow-hidden h-20 bg-muted">
                      <img
                        src={img}
                        alt={`${mess.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <h1 className="text-3xl font-bold mb-2">{mess.name}</h1>
              <p className="text-muted-foreground mb-4 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {mess.address}
              </p>
              
              <div className="flex gap-2 mb-4">
                {mess.is_vegetarian && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Vegetarian</span>
                )}
                {mess.is_non_vegetarian && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Non-Vegetarian</span>
                )}
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  ₹{mess.price_monthly}/month base price
                </span>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">About This Mess</h2>
                <p className="text-muted-foreground">
                  {mess.description || "No description available for this mess service."}
                </p>
              </div>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>Choose a plan that suits your needs</CardDescription>
                </CardHeader>
                <CardContent>
                  {plans.length > 0 ? (
                    <div className="space-y-4">
                      {plans.map((plan) => (
                        <div key={plan.id} className="border rounded-lg p-4">
                          <h3 className="font-semibold">{plan.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{plan.description}</p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-lg font-bold">₹{plan.price}</span>
                            <span className="text-sm text-muted-foreground">{plan.duration_days} days</span>
                          </div>
                          <Button 
                            onClick={() => handleSubscribe(plan.id)} 
                            className="w-full mt-4"
                          >
                            Subscribe
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p>No subscription plans available.</p>
                      <p className="text-sm text-muted-foreground mt-2">Please contact the mess owner for more information.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6">Meal Schedule</h2>
            {Object.keys(scheduleByDay).length > 0 ? (
              <Tabs defaultValue={daysOrder.find(day => scheduleByDay[day]) || daysOrder[0]}>
                <TabsList className="mb-4 flex-wrap">
                  {daysOrder.map(day => scheduleByDay[day] && (
                    <TabsTrigger key={day} value={day}>
                      {day}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {daysOrder.map(day => scheduleByDay[day] && (
                  <TabsContent key={day} value={day}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {scheduleByDay[day]
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .map((meal) => (
                          <Card key={meal.id}>
                            <CardHeader>
                              <CardTitle>{meal.meal_type}</CardTitle>
                              <CardDescription>
                                {new Date(`2000-01-01T${meal.start_time}`).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} - {new Date(`2000-01-01T${meal.end_time}`).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">
                                {meal.description || "No menu details available"}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      }
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <p>No meal schedule available for this mess.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MessDetails;
