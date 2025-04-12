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
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from '@/integrations/supabase/client';

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

  // API Calls
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

  // Form Handlers
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

  // Helper Functions
  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    subForm.setValue("name", plan.name);
    subForm.setValue("description", plan.description || "");
    subForm.setValue("duration_days", plan.duration_days);
    subForm.setValue("price", plan.price);
    subForm.setValue("is_active", plan.is_active);
  };

  const handleDeletePlan = async (id: string) => {
    await deleteSubscriptionPlan(id);
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
    await deleteMealSchedule(id);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const formattedHours = parseInt(hours) % 12 || 12;
    return `${formattedHours}:${minutes} ${period}`;
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-[#FDF6E3]">
      <Card className="max-w-4xl mx-auto bg-white shadow-lg border-[#C4A484]">
        <CardHeader className="border-b border-[#C4A484]/20 bg-gradient-to-r from-[#8B4513]/5 to-transparent">
          <CardTitle className="text-[#5C2C0C] text-3xl font-bold">Manage Your Mess Service</CardTitle>
          <CardDescription className="text-[#5C2C0C] text-lg font-medium">
            Create and manage your mess service details, subscription plans, and meal schedules.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {messService ? (
            <div className="space-y-6">
              <div className="bg-[#FDF6E3] p-8 rounded-lg border border-[#C4A484] shadow-sm">
                <h3 className="text-3xl font-bold mb-6 text-[#5C2C0C]">{messService.name}</h3>
                <div className="space-y-6">
                  <p className="text-[#5C2C0C] text-lg leading-relaxed font-medium">{messService.description}</p>
                  <div className="grid grid-cols-2 gap-6">
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
                  <div className="mt-8">
                    <Button 
                      onClick={() => navigate(`/edit-mess/${messService.id}`)}
                      className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white font-semibold px-8 py-3 text-lg transition-colors duration-200 rounded-lg"
                    >
                      Edit Mess Service
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-[#FDF6E3] rounded-lg border border-[#C4A484]">
              <h3 className="text-2xl font-bold mb-4 text-[#5C2C0C]">You haven't created a mess service yet</h3>
              <p className="text-[#5C2C0C] text-lg mb-8 max-w-md mx-auto font-medium">
                Create your first mess service to start getting subscriptions from students.
              </p>
              <Button 
                onClick={() => navigate('/create-mess')}
                className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white font-semibold px-8 py-3 text-lg transition-colors duration-200 rounded-lg"
              >
                Create a Mess Service
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageMess;
