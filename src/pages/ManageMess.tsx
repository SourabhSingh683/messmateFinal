import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
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
import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid";
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

const ManageMess = () => {
  const router = useRouter();
  const { user, mess } = useAuth();
  const { toast } = useToast();

  // States
  const [loading, setLoading] = useState(true);
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

  // Fetch Data on Mount
  useEffect(() => {
    if (mess?.id) {
      fetchSubscriptionPlans(mess.id);
      fetchMealSchedules(mess.id);
    }
  }, [mess?.id]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }

    if (user && !mess) {
      setLoading(false);
    }

    if (mess) {
      setLoading(false);
    }
  }, [user, mess, router]);

  // API Calls
  const fetchSubscriptionPlans = async (messId: string) => {
    try {
      const plans = await SubscriptionPlansApi.getByMessId(messId);
      setSubscriptionPlans(plans);
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
      setMealSchedules(schedules);
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
      if (!mess?.id) throw new Error("Mess ID is required");
      await SubscriptionPlansApi.create({ ...data, mess_id: mess.id });
      await fetchSubscriptionPlans(mess.id);
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
      if (!mess?.id) throw new Error("Mess ID is required");
      await SubscriptionPlansApi.update(id, data);
      await fetchSubscriptionPlans(mess.id);
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
      if (!mess?.id) throw new Error("Mess ID is required");
      await SubscriptionPlansApi.delete(id);
      await fetchSubscriptionPlans(mess.id);
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
      if (!mess?.id) throw new Error("Mess ID is required");
      await MealScheduleApi.create({ ...data, mess_id: mess.id });
      await fetchMealSchedules(mess.id);
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
      if (!mess?.id) throw new Error("Mess ID is required");
      await MealScheduleApi.update(id, data);
      await fetchMealSchedules(mess.id);
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
      if (!mess?.id) throw new Error("Mess ID is required");
      await MealScheduleApi.delete(id);
      await fetchMealSchedules(mess.id);
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

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Manage Your Mess Service</h1>
        <p className="text-gray-600">Create and manage your mess service details, subscription plans, and meal schedules.</p>
      </header>
      
      <main className="pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : mess ? (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Mess Details</CardTitle>
                <CardDescription>Your mess service information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{mess.name}</h3>
                    <p className="text-sm text-gray-600">{mess.address}</p>
                    <p className="mt-2">{mess.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mess.is_vegetarian && (
                        <Badge variant="outline" className="bg-green-50">Vegetarian</Badge>
                      )}
                      {mess.is_non_vegetarian && (
                        <Badge variant="outline" className="bg-red-50">Non-Vegetarian</Badge>
                      )}
                    </div>
                    <p className="mt-4">
                      <span className="font-semibold">Price (Monthly): </span>
                      ₹{mess.price_monthly}
                    </p>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full" onClick={() => router.push(`/edit-mess/${mess.id}`)}>
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Mess Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="subscription-plans">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="subscription-plans">Subscription Plans</TabsTrigger>
                <TabsTrigger value="meal-schedule">Meal Schedule</TabsTrigger>
              </TabsList>
              
              <TabsContent value="subscription-plans" className="space-y-6">
                <div className="bg-white rounded-md shadow">
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Plans</CardTitle>
                      <CardDescription>Create and manage subscription plans for your mess</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...subForm}>
                        <form onSubmit={subForm.handleSubmit(onSubmitSubscriptionPlan)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={subForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Plan Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Monthly Basic Plan" {...field} />
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
                                    <Input placeholder="Basic plan with all meals" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={subForm.control}
                              name="duration_days"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration (Days)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="30" 
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
                                      placeholder="1500" 
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={subForm.control}
                              name="is_active"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Active</FormLabel>
                                    <FormDescription>
                                      This plan will be available for students to subscribe
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <Button type="submit" disabled={isSubmittingPlan}>
                            {isSubmittingPlan && <Spinner className="mr-2 h-4 w-4" />}
                            {editingPlan ? 'Update Plan' : 'Add Plan'}
                          </Button>
                          
                          {editingPlan && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              onClick={() => {
                                setEditingPlan(null);
                                subForm.reset({
                                  name: '',
                                  description: '',
                                  duration_days: 30,
                                  price: 0,
                                  is_active: true
                                });
                              }}
                              className="ml-2"
                            >
                              Cancel
                            </Button>
                          )}
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="rounded-lg border bg-card">
                  <div className="p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan Name</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptionPlans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">
                              <div>
                                {plan.name}
                                {plan.description && (
                                  <p className="text-xs text-gray-500">{plan.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{plan.duration_days} days</TableCell>
                            <TableCell>₹{plan.price}</TableCell>
                            <TableCell>
                              <Badge variant={plan.is_active ? "success" : "secondary"}>
                                {plan.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditPlan(plan)}
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePlan(plan.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {subscriptionPlans.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                              No subscription plans added yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="meal-schedule" className="space-y-6">
                <div className="bg-white rounded-md shadow">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meal Schedule</CardTitle>
                      <CardDescription>Set up meal timings for your mess service</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...mealForm}>
                        <form onSubmit={mealForm.handleSubmit(onSubmitMealSchedule)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={mealForm.control}
                              name="day_of_week"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Day of Week</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select day" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Monday">Monday</SelectItem>
                                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                                      <SelectItem value="Thursday">Thursday</SelectItem>
                                      <SelectItem value="Friday">Friday</SelectItem>
                                      <SelectItem value="Saturday">Saturday</SelectItem>
                                      <SelectItem value="Sunday">Sunday</SelectItem>
                                      <SelectItem value="All Days">All Days</SelectItem>
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
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select meal type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                                      <SelectItem value="Lunch">Lunch</SelectItem>
                                      <SelectItem value="Dinner">Dinner</SelectItem>
                                      <SelectItem value="Snacks">Snacks</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
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
                            
                            <FormField
                              control={mealForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel>Description (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Special items or menu details"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <Button type="submit" disabled={isSubmittingMeal}>
                            {isSubmittingMeal && <Spinner className="mr-2 h-4 w-4" />}
                            {editingMeal ? 'Update Meal Schedule' : 'Add Meal Schedule'}
                          </Button>
                          
                          {editingMeal && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              onClick={() => {
                                setEditingMeal(null);
                                mealForm.reset({
                                  day_of_week: '',
                                  meal_type: '',
                                  start_time: '',
                                  end_time: '',
                                  description: ''
                                });
                              }}
                              className="ml-2"
                            >
                              Cancel
                            </Button>
                          )}
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="rounded-lg border bg-card">
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-4">Current Meal Schedule</h3>
                    
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All Days'].map(day => {
                      const dayMeals = mealSchedules.filter(m => m.day_of_week === day);
                      if (dayMeals.length === 0) return null;
                      
                      return (
                        <div key={day} className="mb-6">
                          <h4 className="font-medium mb-2">{day}</h4>
                          <div className="space-y-3">
                            {dayMeals.map(meal => (
                              <div key={meal.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                <div>
                                  <span className="font-medium">{meal.meal_type}</span>
                                  <div className="text-sm text-gray-500">
                                    {formatTime(meal.start_time)} - {formatTime(meal.end_time)}
                                  </div>
                                  {meal.description && (
                                    <p className="text-xs mt-1 text-gray-600">{meal.description}</p>
                                  )}
                                </div>
                                <div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditMeal(meal)}
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteMeal(meal.id)}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    
                    {mealSchedules.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        No meal schedules added yet
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold">You haven't created a mess service yet</h2>
            <p>Create your first mess service to start getting subscriptions from students.</p>
            <Button onClick={() => router.push("/create-mess")}>Create a Mess Service</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageMess;
