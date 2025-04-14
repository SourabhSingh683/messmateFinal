
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { SubscriptionPlan, MealSchedule } from "@/types/database";
import { SubscriptionPlansApi, MealScheduleApi } from "@/utils/supabaseRawApi";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { ChevronLeft, Plus, Edit, Trash2, Calendar, Clock, Info, Check } from "lucide-react";

// Form Schemas
const subscriptionPlanSchema = z.object({
  name: z.string().min(2, {
    message: "Plan name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  duration_days: z.number().min(1, {
    message: "Duration must be at least 1 day.",
  }),
  price: z.number().min(1, {
    message: "Price must be greater than 0.",
  }),
  is_active: z.boolean().default(true),
});

const mealScheduleSchema = z.object({
  day_of_week: z.string().min(1, {
    message: "Day of week is required.",
  }),
  meal_type: z.string().min(1, {
    message: "Meal type is required.",
  }),
  start_time: z.string().min(1, {
    message: "Start time is required.",
  }),
  end_time: z.string().min(1, {
    message: "End time is required.",
  }),
  description: z.string().optional(),
});

interface MessService {
  id: string;
  name: string;
  description: string;
  address: string;
  price_monthly: number;
  is_vegetarian: boolean;
  is_non_vegetarian: boolean;
}

const ManageMess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [messService, setMessService] = useState<MessService | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [mealSchedules, setMealSchedules] = useState<MealSchedule[]>([]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editingMeal, setEditingMeal] = useState<MealSchedule | null>(null);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [isSubmittingMeal, setIsSubmittingMeal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // React Hook Form for Subscription Plans
  const subForm = useForm<z.infer<typeof subscriptionPlanSchema>>({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      duration_days: 30,
      price: 0,
      is_active: true
    },
  });

  // React Hook Form for Meal Schedule
  const mealForm = useForm<z.infer<typeof mealScheduleSchema>>({
    resolver: zodResolver(mealScheduleSchema),
    defaultValues: {
      day_of_week: '',
      meal_type: '',
      start_time: '',
      end_time: '',
      description: ''
    },
  });

  useEffect(() => {
    const fetchMessService = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('mess_services')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No mess service found
            setMessService(null);
          } else {
            console.error('Error fetching mess service:', error);
          }
        } else {
          setMessService(data);
          
          // If we have a mess service, fetch subscription plans and meal schedule
          if (data) {
            fetchSubscriptionPlans(data.id);
            fetchMealSchedules(data.id);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessService();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }

    if (user && !messService) {
      setLoading(false);
    }

    if (messService) {
      setLoading(false);
    }
  }, [user, messService, navigate]);

  const fetchSubscriptionPlans = async (messId: string) => {
    try {
      const plans = await SubscriptionPlansApi.getByMessId(messId);
      setSubscriptionPlans(plans as SubscriptionPlan[]);
    } catch (error: any) {
      toast({
        title: "Error fetching subscription plans",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchMealSchedules = async (messId: string) => {
    try {
      const schedules = await MealScheduleApi.getByMessId(messId);
      setMealSchedules(schedules as MealSchedule[]);
    } catch (error: any) {
      toast({
        title: "Error fetching meal schedules",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createSubscriptionPlan = async (data: z.infer<typeof subscriptionPlanSchema>) => {
    try {
      setIsSubmittingPlan(true);
      if (!messService?.id) throw new Error("Mess ID is required");
      
      await SubscriptionPlansApi.create({ 
        mess_id: messService.id,
        name: data.name,
        description: data.description,
        duration_days: data.duration_days,
        price: data.price,
        is_active: data.is_active 
      });
      
      await fetchSubscriptionPlans(messService.id);
      toast({
        title: "Subscription plan created successfully!",
      });
      subForm.reset();
    } catch (error: any) {
      toast({
        title: "Error creating subscription plan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const updateSubscriptionPlan = async (id: string, data: z.infer<typeof subscriptionPlanSchema>) => {
    try {
      setIsSubmittingPlan(true);
      if (!messService?.id) throw new Error("Mess ID is required");
      
      await SubscriptionPlansApi.update(id, {
        name: data.name,
        description: data.description,
        duration_days: data.duration_days,
        price: data.price,
        is_active: data.is_active
      });
      
      await fetchSubscriptionPlans(messService.id);
      toast({
        title: "Subscription plan updated successfully!",
      });
      subForm.reset();
      setEditingPlan(null);
    } catch (error: any) {
      toast({
        title: "Error updating subscription plan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const deleteSubscriptionPlan = async (id: string) => {
    try {
      if (!messService?.id) throw new Error("Mess ID is required");
      await SubscriptionPlansApi.delete(id);
      await fetchSubscriptionPlans(messService.id);
      toast({
        title: "Subscription plan deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting subscription plan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createMealSchedule = async (data: z.infer<typeof mealScheduleSchema>) => {
    try {
      setIsSubmittingMeal(true);
      if (!messService?.id) throw new Error("Mess ID is required");
      
      await MealScheduleApi.create({
        mess_id: messService.id,
        day_of_week: data.day_of_week,
        meal_type: data.meal_type,
        start_time: data.start_time,
        end_time: data.end_time,
        description: data.description
      });
      
      await fetchMealSchedules(messService.id);
      toast({
        title: "Meal schedule created successfully!",
      });
      mealForm.reset();
    } catch (error: any) {
      toast({
        title: "Error creating meal schedule",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingMeal(false);
    }
  };

  const updateMealSchedule = async (id: string, data: z.infer<typeof mealScheduleSchema>) => {
    try {
      setIsSubmittingMeal(true);
      if (!messService?.id) throw new Error("Mess ID is required");
      
      await MealScheduleApi.update(id, {
        day_of_week: data.day_of_week,
        meal_type: data.meal_type,
        start_time: data.start_time,
        end_time: data.end_time,
        description: data.description
      });
      
      await fetchMealSchedules(messService.id);
      toast({
        title: "Meal schedule updated successfully!",
      });
      mealForm.reset();
      setEditingMeal(null);
    } catch (error: any) {
      toast({
        title: "Error updating meal schedule",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingMeal(false);
    }
  };

  const deleteMealSchedule = async (id: string) => {
    try {
      if (!messService?.id) throw new Error("Mess ID is required");
      await MealScheduleApi.delete(id);
      await fetchMealSchedules(messService.id);
      toast({
        title: "Meal schedule deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting meal schedule",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onSubmitSubscriptionPlan = async (data: z.infer<typeof subscriptionPlanSchema>) => {
    if (editingPlan) {
      await updateSubscriptionPlan(editingPlan.id, data);
    } else {
      await createSubscriptionPlan(data);
    }
  };

  const onSubmitMealSchedule = async (data: z.infer<typeof mealScheduleSchema>) => {
    if (editingMeal) {
      await updateMealSchedule(editingMeal.id, data);
    } else {
      await createMealSchedule(data);
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    subForm.setValue("name", plan.name);
    subForm.setValue("description", plan.description || "");
    subForm.setValue("duration_days", plan.duration_days);
    subForm.setValue("price", plan.price);
    subForm.setValue("is_active", plan.is_active);
  };

  const handleDeletePlan = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscription plan?")) {
      await deleteSubscriptionPlan(id);
    }
  };

  const handleEditMeal = (meal: MealSchedule) => {
    setEditingMeal(meal);
    mealForm.setValue("day_of_week", meal.day_of_week);
    mealForm.setValue("meal_type", meal.meal_type);
    mealForm.setValue("start_time", meal.start_time);
    mealForm.setValue("end_time", meal.end_time);
    mealForm.setValue("description", meal.description || "");
  };

  const handleDeleteMeal = async (id: string) => {
    if (confirm("Are you sure you want to delete this meal schedule?")) {
      await deleteMealSchedule(id);
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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner className="h-8 w-8" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 min-h-screen">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1">Back</span>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#5C2C0C]">Manage Your Mess Service</h1>
        </div>

        {messService ? (
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                <span>Subscription Plans</span>
              </TabsTrigger>
              <TabsTrigger value="mealSchedules" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Meal Schedules</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card className="max-w-4xl mx-auto bg-white shadow-lg border-[#C4A484]">
                <CardHeader className="border-b border-[#C4A484]/20 bg-gradient-to-r from-[#8B4513]/5 to-transparent">
                  <CardTitle className="text-[#5C2C0C] text-3xl font-bold">{messService.name}</CardTitle>
                  <CardDescription className="text-[#5C2C0C] text-lg font-medium">
                    Manage your mess service details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-[#FDF6E3] p-8 rounded-lg border border-[#C4A484] shadow-sm">
                    <div className="space-y-6">
                      <p className="text-[#5C2C0C] text-lg leading-relaxed font-medium">{messService.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/80 p-4 rounded-lg border border-[#C4A484]/20">
                          <p className="font-semibold text-[#5C2C0C] text-lg mb-2">Address</p>
                          <p className="text-[#5C2C0C] text-base font-medium">{messService.address}</p>
                        </div>
                        <div className="bg-white/80 p-4 rounded-lg border border-[#C4A484]/20">
                          <p className="font-semibold text-[#5C2C0C] text-lg mb-2">Monthly Price</p>
                          <p className="text-[#5C2C0C] text-base font-medium">₹{messService.price_monthly}</p>
                        </div>
                      </div>
                      <div className="bg-white/80 p-4 rounded-lg border border-[#C4A484]/20">
                        <p className="font-semibold text-[#5C2C0C] text-lg mb-2">Food Type</p>
                        <div className="flex gap-3">
                          {messService.is_vegetarian && (
                            <span className="px-4 py-1.5 bg-green-100 text-green-900 rounded-full text-sm font-semibold">
                              Vegetarian
                            </span>
                          )}
                          {messService.is_non_vegetarian && (
                            <span className="px-4 py-1.5 bg-red-100 text-red-900 rounded-full text-sm font-semibold">
                              Non-Vegetarian
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-8 flex flex-wrap gap-4">
                        <Button 
                          onClick={() => navigate(`/edit-mess/${messService.id}`)}
                          className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white font-semibold px-8 py-3 text-lg transition-colors duration-200 rounded-lg"
                        >
                          <Edit className="mr-2 h-5 w-5" />
                          Edit Mess Service
                        </Button>
                        <Button 
                          onClick={() => navigate(`/mess-dashboard`)}
                          className="bg-[#5C2C0C] hover:bg-[#3A1A08] text-white font-semibold px-8 py-3 text-lg transition-colors duration-200 rounded-lg"
                        >
                          Go to Dashboard
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="subscriptions">
              <Card className="bg-white shadow-lg border-[#C4A484]">
                <CardHeader className="border-b border-[#C4A484]/20 bg-gradient-to-r from-[#8B4513]/5 to-transparent">
                  <CardTitle className="text-[#5C2C0C] text-2xl font-bold">Subscription Plans</CardTitle>
                  <CardDescription className="text-[#5C2C0C] text-lg">
                    Create and manage subscription plans for your mess service
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-[#5C2C0C]">
                        {editingPlan ? "Edit Subscription Plan" : "Create New Subscription Plan"}
                      </h3>
                      <Form {...subForm}>
                        <form onSubmit={subForm.handleSubmit(onSubmitSubscriptionPlan)} className="space-y-4">
                          <FormField
                            control={subForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Plan Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Monthly Basic" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={subForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Basic meal plan with standard menu options." 
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={subForm.control}
                              name="duration_days"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration (Days)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="1" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={subForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price (₹)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="1" 
                                      step="0.01" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={subForm.control}
                            name="is_active"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Active Plan</FormLabel>
                                  <FormDescription>
                                    Make this plan available for new subscriptions
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex space-x-2">
                            <Button 
                              type="submit" 
                              className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white"
                              disabled={isSubmittingPlan}
                            >
                              {isSubmittingPlan && <Spinner className="mr-2 h-4 w-4" />}
                              {editingPlan ? "Update Plan" : "Create Plan"}
                            </Button>
                            
                            {editingPlan && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  setEditingPlan(null);
                                  subForm.reset();
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </form>
                      </Form>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-[#5C2C0C]">Existing Plans</h3>
                      {subscriptionPlans.length > 0 ? (
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader className="bg-[#FDF6E3]">
                              <TableRow>
                                <TableHead className="font-bold text-[#5C2C0C]">Name</TableHead>
                                <TableHead className="font-bold text-[#5C2C0C]">Duration</TableHead>
                                <TableHead className="font-bold text-[#5C2C0C]">Price</TableHead>
                                <TableHead className="font-bold text-[#5C2C0C]">Status</TableHead>
                                <TableHead className="text-right font-bold text-[#5C2C0C]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {subscriptionPlans.map((plan) => (
                                <TableRow key={plan.id}>
                                  <TableCell className="font-medium">{plan.name}</TableCell>
                                  <TableCell>{plan.duration_days} days</TableCell>
                                  <TableCell>₹{plan.price}</TableCell>
                                  <TableCell>
                                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                                      {plan.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditPlan(plan)}
                                      className="mr-1"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeletePlan(plan.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-[#FDF6E3]/50">
                          <p className="text-[#5C2C0C] mb-4">No subscription plans created yet.</p>
                          <p className="text-[#8B4513] text-sm mb-4">Create your first plan to start offering subscriptions.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="mealSchedules">
              <Card className="bg-white shadow-lg border-[#C4A484]">
                <CardHeader className="border-b border-[#C4A484]/20 bg-gradient-to-r from-[#8B4513]/5 to-transparent">
                  <CardTitle className="text-[#5C2C0C] text-2xl font-bold">Meal Schedules</CardTitle>
                  <CardDescription className="text-[#5C2C0C] text-lg">
                    Create and manage meal schedules for your mess service
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-[#5C2C0C]">
                        {editingMeal ? "Edit Meal Schedule" : "Create New Meal Schedule"}
                      </h3>
                      <Form {...mealForm}>
                        <form onSubmit={mealForm.handleSubmit(onSubmitMealSchedule)} className="space-y-4">
                          <FormField
                            control={mealForm.control}
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
                                    <SelectItem value="monday">Monday</SelectItem>
                                    <SelectItem value="tuesday">Tuesday</SelectItem>
                                    <SelectItem value="wednesday">Wednesday</SelectItem>
                                    <SelectItem value="thursday">Thursday</SelectItem>
                                    <SelectItem value="friday">Friday</SelectItem>
                                    <SelectItem value="saturday">Saturday</SelectItem>
                                    <SelectItem value="sunday">Sunday</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={mealForm.control}
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
                                    <SelectItem value="breakfast">Breakfast</SelectItem>
                                    <SelectItem value="lunch">Lunch</SelectItem>
                                    <SelectItem value="dinner">Dinner</SelectItem>
                                    <SelectItem value="snacks">Snacks</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={mealForm.control}
                              name="start_time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={mealForm.control}
                              name="end_time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={mealForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Special menu items or notes for this meal." 
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex space-x-2">
                            <Button 
                              type="submit" 
                              className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white"
                              disabled={isSubmittingMeal}
                            >
                              {isSubmittingMeal && <Spinner className="mr-2 h-4 w-4" />}
                              {editingMeal ? "Update Schedule" : "Create Schedule"}
                            </Button>
                            
                            {editingMeal && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  setEditingMeal(null);
                                  mealForm.reset();
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </form>
                      </Form>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-[#5C2C0C]">Existing Schedules</h3>
                      {mealSchedules.length > 0 ? (
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader className="bg-[#FDF6E3]">
                              <TableRow>
                                <TableHead className="font-bold text-[#5C2C0C]">Day</TableHead>
                                <TableHead className="font-bold text-[#5C2C0C]">Meal</TableHead>
                                <TableHead className="font-bold text-[#5C2C0C]">Time</TableHead>
                                <TableHead className="text-right font-bold text-[#5C2C0C]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mealSchedules.map((meal) => (
                                <TableRow key={meal.id}>
                                  <TableCell className="font-medium capitalize">{meal.day_of_week}</TableCell>
                                  <TableCell className="capitalize">{meal.meal_type}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1 text-[#8B4513]" />
                                      <span>{formatTime(meal.start_time)} - {formatTime(meal.end_time)}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditMeal(meal)}
                                      className="mr-1"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteMeal(meal.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-[#FDF6E3]/50">
                          <p className="text-[#5C2C0C] mb-4">No meal schedules created yet.</p>
                          <p className="text-[#8B4513] text-sm mb-4">Create your first schedule to inform your customers about meal timings.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-16 bg-[#FDF6E3] rounded-lg border border-[#C4A484] max-w-4xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-[#5C2C0C]">You haven't created a mess service yet</h3>
            <p className="text-[#5C2C0C] text-lg mb-8 max-w-md mx-auto font-medium">
              Create your first mess service to start getting subscriptions from students.
            </p>
            <Button 
              onClick={() => navigate('/create-mess')}
              className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white font-semibold px-8 py-3 text-lg transition-colors duration-200 rounded-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create a Mess Service
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageMess;
