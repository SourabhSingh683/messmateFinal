
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Tables } from '@/integrations/supabase/types';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePicker } from "@/components/utils/TimePicker";

type MessService = Tables['mess_services'];
type SubscriptionPlan = Tables['subscription_plans'];
type MealSchedule = Tables['meal_schedule'];

// Form validation schemas
const messServiceSchema = z.object({
  name: z.string().min(3, { message: "Mess name must be at least 3 characters." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  description: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  price_monthly: z.coerce.number().positive({ message: "Price must be a positive number." }),
  is_vegetarian: z.boolean().default(false),
  is_non_vegetarian: z.boolean().default(false),
});

const subscriptionPlanSchema = z.object({
  name: z.string().min(3, { message: "Plan name must be at least 3 characters." }),
  description: z.string().optional(),
  duration_days: z.coerce.number().positive({ message: "Duration must be a positive number." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  is_active: z.boolean().default(true),
});

const mealScheduleSchema = z.object({
  day_of_week: z.string().min(1, { message: "Please select a day of the week." }),
  meal_type: z.string().min(1, { message: "Please select a meal type." }),
  start_time: z.string().min(1, { message: "Please select a start time." }),
  end_time: z.string().min(1, { message: "Please select an end time." }),
  description: z.string().optional(),
});

// Component for creating or editing a mess service
const ManageMess = () => {
  const { messId } = useParams<{ messId: string }>();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'details';
  const [loading, setLoading] = useState(true);
  const [messDetails, setMessDetails] = useState<MessService | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [schedule, setSchedule] = useState<MealSchedule[]>([]);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [editScheduleId, setEditScheduleId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const messForm = useForm<z.infer<typeof messServiceSchema>>({
    resolver: zodResolver(messServiceSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      latitude: 0,
      longitude: 0,
      price_monthly: 0,
      is_vegetarian: false,
      is_non_vegetarian: false,
    },
  });

  const planForm = useForm<z.infer<typeof subscriptionPlanSchema>>({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: {
      name: "",
      description: "",
      duration_days: 30,
      price: 0,
      is_active: true,
    },
  });

  const scheduleForm = useForm<z.infer<typeof mealScheduleSchema>>({
    resolver: zodResolver(mealScheduleSchema),
    defaultValues: {
      day_of_week: "",
      meal_type: "",
      start_time: "",
      end_time: "",
      description: "",
    },
  });

  useEffect(() => {
    if (messId) {
      setIsEditing(true);
      fetchMessDetails();
      fetchPlans();
      fetchSchedule();
    } else {
      getUserLocation();
      setLoading(false);
    }
  }, [messId]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          messForm.setValue('latitude', latitude);
          messForm.setValue('longitude', longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location access denied",
            description: "Please manually enter your mess location coordinates.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const fetchMessDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mess_services')
        .select('*')
        .eq('id', messId)
        .single();

      if (error) throw error;
      
      if (data) {
        setMessDetails(data);
        // Set form values
        messForm.reset({
          name: data.name,
          address: data.address,
          description: data.description || "",
          latitude: data.latitude,
          longitude: data.longitude,
          price_monthly: data.price_monthly,
          is_vegetarian: data.is_vegetarian,
          is_non_vegetarian: data.is_non_vegetarian,
        });
      }
    } catch (error: any) {
      console.error("Error fetching mess details:", error.message);
      toast({
        title: "Failed to load mess details",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('mess_id', messId)
        .order('price', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setPlans(data);
      }
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error.message);
    }
  };

  const fetchSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_schedule')
        .select('*')
        .eq('mess_id', messId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setSchedule(data);
      }
    } catch (error: any) {
      console.error("Error fetching meal schedule:", error.message);
    }
  };

  const onMessSubmit = async (values: z.infer<typeof messServiceSchema>) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to manage your mess service.",
          variant: "destructive"
        });
        return;
      }

      if (isEditing) {
        // Update existing mess
        const { error } = await supabase
          .from('mess_services')
          .update(values)
          .eq('id', messId);

        if (error) throw error;
        
        toast({
          title: "Mess updated",
          description: "Your mess service has been updated successfully."
        });
      } else {
        // Create new mess
        const { data, error } = await supabase
          .from('mess_services')
          .insert({
            ...values,
            owner_id: user.id
          })
          .select();

        if (error) throw error;
        
        toast({
          title: "Mess created",
          description: "Your mess service has been created successfully."
        });
        
        // Navigate to the edit page for the new mess
        if (data && data[0]) {
          navigate(`/edit-mess/${data[0].id}`);
        } else {
          navigate('/mess-dashboard');
        }
      }
    } catch (error: any) {
      console.error("Error saving mess:", error.message);
      toast({
        title: "Failed to save mess",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const onPlanSubmit = async (values: z.infer<typeof subscriptionPlanSchema>) => {
    try {
      if (!messId) {
        toast({
          title: "Create mess first",
          description: "Please create your mess service before adding subscription plans.",
          variant: "destructive"
        });
        return;
      }

      if (editPlanId) {
        // Update existing plan
        const { error } = await supabase
          .from('subscription_plans')
          .update(values)
          .eq('id', editPlanId);

        if (error) throw error;
        
        toast({
          title: "Plan updated",
          description: "Your subscription plan has been updated successfully."
        });
        
        setEditPlanId(null);
      } else {
        // Create new plan
        const { error } = await supabase
          .from('subscription_plans')
          .insert({
            ...values,
            mess_id: messId
          });

        if (error) throw error;
        
        toast({
          title: "Plan created",
          description: "Your subscription plan has been created successfully."
        });
      }
      
      // Reset form and refresh plans
      planForm.reset({
        name: "",
        description: "",
        duration_days: 30,
        price: 0,
        is_active: true,
      });
      fetchPlans();
    } catch (error: any) {
      console.error("Error saving plan:", error.message);
      toast({
        title: "Failed to save plan",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const onScheduleSubmit = async (values: z.infer<typeof mealScheduleSchema>) => {
    try {
      if (!messId) {
        toast({
          title: "Create mess first",
          description: "Please create your mess service before adding meal schedules.",
          variant: "destructive"
        });
        return;
      }

      if (editScheduleId) {
        // Update existing schedule
        const { error } = await supabase
          .from('meal_schedule')
          .update(values)
          .eq('id', editScheduleId);

        if (error) throw error;
        
        toast({
          title: "Schedule updated",
          description: "Your meal schedule has been updated successfully."
        });
        
        setEditScheduleId(null);
      } else {
        // Create new schedule
        const { error } = await supabase
          .from('meal_schedule')
          .insert({
            ...values,
            mess_id: messId
          });

        if (error) throw error;
        
        toast({
          title: "Schedule created",
          description: "Your meal schedule has been created successfully."
        });
      }
      
      // Reset form and refresh schedule
      scheduleForm.reset({
        day_of_week: "",
        meal_type: "",
        start_time: "",
        end_time: "",
        description: "",
      });
      fetchSchedule();
    } catch (error: any) {
      console.error("Error saving schedule:", error.message);
      toast({
        title: "Failed to save schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const editPlan = (plan: SubscriptionPlan) => {
    setEditPlanId(plan.id);
    planForm.reset({
      name: plan.name,
      description: plan.description || "",
      duration_days: plan.duration_days,
      price: plan.price,
      is_active: plan.is_active,
    });
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      
      toast({
        title: "Plan deleted",
        description: "Your subscription plan has been deleted successfully."
      });
      
      fetchPlans();
    } catch (error: any) {
      console.error("Error deleting plan:", error.message);
      toast({
        title: "Failed to delete plan",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const editSchedule = (schedule: MealSchedule) => {
    setEditScheduleId(schedule.id);
    scheduleForm.reset({
      day_of_week: schedule.day_of_week,
      meal_type: schedule.meal_type,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      description: schedule.description || "",
    });
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('meal_schedule')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
      
      toast({
        title: "Schedule deleted",
        description: "Your meal schedule has been deleted successfully."
      });
      
      fetchSchedule();
    } catch (error: any) {
      console.error("Error deleting schedule:", error.message);
      toast({
        title: "Failed to delete schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Group schedule by day
  const scheduleByDay: Record<string, MealSchedule[]> = {};
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  schedule.forEach(item => {
    if (!scheduleByDay[item.day_of_week]) {
      scheduleByDay[item.day_of_week] = [];
    }
    scheduleByDay[item.day_of_week].push(item);
  });

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
        <div className="mb-6 flex items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate(isEditing ? '/mess-dashboard' : '/')}
            className="mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? `Edit ${messDetails?.name}` : 'Register New Mess'}
          </h1>
        </div>
        
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Mess Details</TabsTrigger>
            {isEditing && (
              <>
                <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                <TabsTrigger value="schedule">Meal Schedule</TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="details">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>{isEditing ? 'Edit Mess Details' : 'Register New Mess'}</CardTitle>
                <CardDescription>
                  {isEditing 
                    ? 'Update the information for your mess service' 
                    : 'Enter the details for your new mess service'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...messForm}>
                  <form onSubmit={messForm.handleSubmit(onMessSubmit)} className="space-y-6">
                    <FormField
                      control={messForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mess Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter mess name" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of your mess service.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={messForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter full address" {...field} />
                          </FormControl>
                          <FormDescription>
                            The physical address of your mess service.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={messForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe your mess service" {...field} />
                          </FormControl>
                          <FormDescription>
                            A detailed description of your mess, what makes it special, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={messForm.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input type="number" step="any" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={messForm.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                              <Input type="number" step="any" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={messForm.control}
                      name="price_monthly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Base Price (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormDescription>
                            The standard monthly price for your mess service.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={messForm.control}
                        name="is_vegetarian"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                              <FormLabel>Vegetarian Food</FormLabel>
                              <FormDescription>
                                Do you serve vegetarian food?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={messForm.control}
                        name="is_non_vegetarian"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                              <FormLabel>Non-Vegetarian Food</FormLabel>
                              <FormDescription>
                                Do you serve non-vegetarian food?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      {isEditing ? 'Update Mess' : 'Register Mess'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {isEditing && (
            <TabsContent value="plans">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{editPlanId ? 'Edit Subscription Plan' : 'Create Subscription Plan'}</CardTitle>
                    <CardDescription>
                      {editPlanId 
                        ? 'Update the subscription plan for your mess service' 
                        : 'Create a new subscription plan for your mess service'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...planForm}>
                      <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="space-y-6">
                        <FormField
                          control={planForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plan Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Basic Plan, Premium Plan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={planForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe what's included in this plan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={planForm.control}
                          name="duration_days"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (days)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>
                                How long this subscription plan lasts in days.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={planForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={planForm.control}
                          name="is_active"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel>Active Plan</FormLabel>
                                <FormDescription>
                                  Is this plan currently available for subscription?
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            {editPlanId ? 'Update Plan' : 'Create Plan'}
                          </Button>
                          
                          {editPlanId && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setEditPlanId(null);
                                planForm.reset({
                                  name: "",
                                  description: "",
                                  duration_days: 30,
                                  price: 0,
                                  is_active: true,
                                });
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Your Subscription Plans</CardTitle>
                    <CardDescription>
                      Manage your existing subscription plans
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {plans.length > 0 ? (
                      <div className="space-y-4">
                        {plans.map((plan) => (
                          <div key={plan.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {plan.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <div>
                                <p className="text-sm"><span className="font-medium">Duration:</span> {plan.duration_days} days</p>
                                <p className="text-sm font-bold mt-1">₹{plan.price}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editPlan(plan)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deletePlan(plan.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p>No subscription plans created yet.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Create your first subscription plan using the form.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
          
          {isEditing && (
            <TabsContent value="schedule">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{editScheduleId ? 'Edit Meal Schedule' : 'Add Meal Schedule'}</CardTitle>
                    <CardDescription>
                      {editScheduleId 
                        ? 'Update a meal schedule for your mess service' 
                        : 'Add a new meal schedule for your mess service'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...scheduleForm}>
                      <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-6">
                        <FormField
                          control={scheduleForm.control}
                          name="day_of_week"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Day of Week</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a day" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={scheduleForm.control}
                          name="meal_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meal Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select meal type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {['Breakfast', 'Lunch', 'Dinner'].map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={scheduleForm.control}
                            name="start_time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                  <TimePicker 
                                    value={field.value} 
                                    onChange={field.onChange} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={scheduleForm.control}
                            name="end_time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                  <TimePicker 
                                    value={field.value} 
                                    onChange={field.onChange} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={scheduleForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Menu details for this meal"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Describe what will be served during this meal.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            {editScheduleId ? 'Update Schedule' : 'Add Schedule'}
                          </Button>
                          
                          {editScheduleId && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setEditScheduleId(null);
                                scheduleForm.reset({
                                  day_of_week: "",
                                  meal_type: "",
                                  start_time: "",
                                  end_time: "",
                                  description: "",
                                });
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Meal Schedule</CardTitle>
                    <CardDescription>
                      Manage your weekly meal schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {schedule.length > 0 ? (
                      <Tabs defaultValue={Object.keys(scheduleByDay)[0] || 'Monday'} className="w-full">
                        <TabsList className="mb-4 w-full justify-start overflow-auto">
                          {daysOrder.map(day => scheduleByDay[day] && (
                            <TabsTrigger key={day} value={day}>
                              {day}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {daysOrder.map(day => scheduleByDay[day] && (
                          <TabsContent key={day} value={day}>
                            <div className="space-y-4">
                              {scheduleByDay[day]
                                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                .map((meal) => (
                                  <div key={meal.id} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start">
                                      <div>
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
                                      <div className="flex gap-2">
                                        <Button 
                                          variant="outline"
                                          size="sm"
                                          onClick={() => editSchedule(meal)}
                                        >
                                          Edit
                                        </Button>
                                        <Button 
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => deleteSchedule(meal.id)}
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    ) : (
                      <div className="text-center py-8">
                        <p>No meal schedule created yet.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Add your first meal schedule using the form.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default ManageMess;
