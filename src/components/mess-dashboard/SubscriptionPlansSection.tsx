
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { BadgePlus, Edit, Trash2, Plus } from "lucide-react";
import { SubscriptionPlan } from "@/types/database";
import { SubscriptionPlansApi } from "@/utils/supabaseRawApi";

interface SubscriptionPlansProps {
  messId: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  duration_days: z.coerce.number().min(1, "Duration must be at least 1 day"),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  is_active: z.boolean().default(true),
});

const SubscriptionPlansSection = ({ messId }: SubscriptionPlansProps) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      duration_days: 30,
      price: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchSubscriptionPlans();
  }, [messId]);

  useEffect(() => {
    if (editingPlan) {
      form.reset({
        name: editingPlan.name,
        description: editingPlan.description || "",
        duration_days: editingPlan.duration_days,
        price: editingPlan.price,
        is_active: editingPlan.is_active,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        duration_days: 30,
        price: 0,
        is_active: true,
      });
    }
  }, [editingPlan, form]);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      const fetchedPlans = await SubscriptionPlansApi.getByMessId(messId);
      setPlans(fetchedPlans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingPlan) {
        // Update existing plan
        await SubscriptionPlansApi.update(editingPlan.id, {
          name: values.name,
          description: values.description,
          duration_days: values.duration_days,
          price: values.price,
          is_active: values.is_active,
        });
        toast({
          title: "Success",
          description: "Subscription plan updated successfully",
        });
      } else {
        // Create new plan
        await SubscriptionPlansApi.create({
          mess_id: messId,
          name: values.name,
          description: values.description,
          duration_days: values.duration_days,
          price: values.price,
          is_active: values.is_active,
        });
        toast({
          title: "Success",
          description: "Subscription plan created successfully",
        });
      }

      setOpenDialog(false);
      setEditingPlan(null);
      form.reset();
      fetchSubscriptionPlans();
    } catch (error) {
      console.error("Error saving subscription plan:", error);
      toast({
        title: "Error",
        description: "Failed to save subscription plan",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscription plan?")) {
      try {
        await SubscriptionPlansApi.delete(id);
        fetchSubscriptionPlans();
        toast({
          title: "Success",
          description: "Subscription plan deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting subscription plan:", error);
        toast({
          title: "Error",
          description: "Failed to delete subscription plan",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BadgePlus className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Subscription Plans</h2>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPlan(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
              </DialogTitle>
              <DialogDescription>
                Set up subscription plans for your mess service
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Monthly, Weekly, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter plan details here..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (days)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Only active plans will be visible to customers
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    {editingPlan ? "Update" : "Create"} Plan
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {plan.description || "-"}
                </TableCell>
                <TableCell>{plan.duration_days} days</TableCell>
                <TableCell>₹{plan.price}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      plan.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {plan.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingPlan(plan);
                      setOpenDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-8 border rounded-md">
          <p>No subscription plans yet. Create your first plan to offer to customers.</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlansSection;
