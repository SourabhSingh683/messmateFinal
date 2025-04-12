import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { MessService, SubscriptionPlan, MealSchedule } from '@/types/database';
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

interface ManageMessProps {
  messId?: string;
  defaultTab?: string;
}

// Component for creating or editing a mess service
const ManageMess = ({ messId, defaultTab = 'details' }: ManageMessProps) => {
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
    if (!messId) return;
    
    try {
      // Using raw fetch to retrieve data from subscription_plans which isn't in the types
      const response = await fetch(
        `https://wemmsixixuxppkxeluhw.supabase.co/rest/v1/subscription_plans?mess_id=eq.${messId}&order=price.asc`,
        {
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbW1zaXhpeHV4cHBreGVsdWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTQ4NzEsImV4cCI6MjA2MDAzMDg3MX0._3nIUs_l0spO3Fd-d_TjhWW8Vm7yfS7dLAufU1sluFg",
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.ok) {
        const data: SubscriptionPlan[] = await response.json();
        setPlans(data);
      }
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error.message);
    }
  };

  const fetchSchedule = async () => {
    if (!messId) return;
    
    try {
      // Using raw fetch to retrieve data from meal_schedule which isn't in the types
      const response = await fetch(
        `https://wemmsixixuxppkxeluhw.supabase.co/rest/v1/meal_schedule?mess_id=eq.${messId}&order=day_of_week.asc,start_time.asc`,
        {
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbW1zaXhpeHV4cHBreGVsdWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTQ4NzEsImV4cCI6MjA2MDAzMDg3MX0._3nIUs_l0spO3Fd-d_TjhWW8Vm7yfS7dLAufU1sluFg",
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.ok) {
        const data: MealSchedule[] = await response.json();
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
        const { error } = await supabase
          .from('mess_services')
          .update({
            name: values.name,
            address: values.address,
            description: values.description || '',
            latitude: values.latitude,
            longitude: values.longitude,
            price_monthly: values.price_monthly,
            is_vegetarian: values.is_vegetarian,
            is_non_vegetarian: values.is_non_vegetarian
          })
          .eq('id', messId);

        if (error) throw error;
        
        toast({
          title: "Mess updated",
          description: "Your mess service has been updated successfully."
        });
      } else {
        const { data, error } = await supabase
          .from('mess_services')
          .insert({
            name: values.name,
            address: values.address,
            description: values.description || '',
            latitude: values.latitude,
            longitude: values.longitude,
            price_monthly: values.price_monthly,
            is_vegetarian: values.is_vegetarian,
            is_non_vegetarian: values.is_non_vegetarian,
            owner_id: user.id
          })
          .select();

        if (error) throw error;
        
        toast({
          title: "Mess created",
          description: "Your mess service has been created successfully."
        });
        
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

      const planData = {
        mess_id: messId,
        name: values.name,
        description: values.description || '',
        duration_days: values.duration_days,
        price: values.price,
        is_active: values.is_active
      };

      if (editPlanId) {
        // Use raw fetch for update since the table isn't in the typed schema
        const response = await fetch(
          `https://wemmsixixuxppkxeluhw.supabase.co/rest/v1/subscription_plans?id=eq.${editPlanId}`,
          {
            method: 'PATCH',
            headers: {
              "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbW1zaXhpeHV4cHBreGVsdWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTQ4NzEsImV4cCI6MjA2MDAzMDg3MX0._3nIUs_l0spO3Fd-d_TjhWW8Vm7yfS7dLAufU1sluFg",
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(planData)
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to update subscription plan');
        }
        
        toast({
          title: "Plan updated",
          description: "Your subscription plan has been updated successfully."
        });
        
        setEditPlanId(null);
      } else {
        // Use raw fetch for insert since the table isn't in the typed schema
        const response = await fetch(
          `https://wemmsixixuxppkxeluhw.supabase.co/rest/v1/subscription_plans`,
          {
            method: 'POST',
            headers: {
              "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbW1zaXhpeHV4cHBreGVsdWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTQ4NzEsImV4cCI6MjA2MDAzMDg3MX0._3nIUs_l0spO3Fd-d_TjhWW8Vm7yfS7dLAufU1sluFg",
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(planData)
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to create subscription plan');
        }
        
        toast({
          title: "Plan created",
          description: "Your subscription plan has been created successfully."
        });
      }
      
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

      const scheduleData = {
        mess_id: messId,
        day_of_week: values.day_of_week,
        meal_type: values.meal_type,
        start_time: values.start_time,
        end_time: values.end_time,
        description: values.description || ''
      };

      if (editScheduleId) {
        // Use raw fetch for update since the table isn't in the typed schema
        const response = await fetch(
          `https://wemmsixixuxppkxeluhw.supabase.co/rest/v1/meal_schedule?id=eq.${editScheduleId}`,
          {
            method: 'PATCH',
            headers: {
              "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbW1zaXhpeHV4cHBreGVsdWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTQ4NzEsImV4cCI6MjA2MDAzMDg3MX0._3nIUs_l0spO3Fd-d_TjhWW8Vm7yfS7dLAufU1sluFg",
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(scheduleData)
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to update meal schedule');
        }
        
        toast({
          title: "Schedule updated",
          description: "Your meal schedule has been updated successfully."
        });
        
        setEditScheduleId(null);
      } else {
        // Use raw fetch for insert since the table isn't in the typed schema
        const response = await fetch(
          `https://wemmsixixuxppkxeluhw.supabase.co/rest/v1/meal_schedule`,
          {
            method: 'POST',
            headers: {
              "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbW1zaXhpeHV4cHBreGVsdWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTQ4NzEsImV4cCI6MjA2MDAzMDg3MX0._3nIUs_l0spO3Fd-d_TjhWW8Vm7yfS7dLAufU1sluFg",
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(scheduleData)
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to create meal schedule');
        }
        
        toast({
          title: "Schedule created",
          description: "Your meal schedule has been created successfully."
        });
      }
      
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
      // Use raw fetch for delete since the table isn't in the typed schema
      const response = await fetch(
        `https://wemmsixixuxppkxeluhw.supabase.co/rest/v1/subscription_plans?id=eq.${planId}`,
        {
          method: 'DELETE',
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbW1zaXhpeHV4cHBreGVsdWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTQ4NzEsImV4cCI6MjA2MDAzMDg3MX0._3nIUs_l0spO3Fd-d_TjhWW8Vm7yfS7dLAufU1sluFg",
            "Prefer": "return=minimal"
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete subscription plan');
      }
      
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
      // Use raw fetch for delete since the table isn't in the typed schema
      const response = await fetch(
        `https://wemmsixixuxppkxeluhw.supabase.co/rest/v1/meal_schedule?id=eq.${scheduleId}`,
        {
          method: 'DELETE',
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbW1zaXhpeHV4cHBreGVsdWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTQ4NzEsImV4cCI6MjA2MDAzMDg3MX0._3nIUs_l0spO3Fd-d_TjhWW8Vm7yfS7dLAufU1sluFg",
            "Prefer": "return=minimal"
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete meal schedule');
      }
      
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
                        
                        <div className="flex gap-
