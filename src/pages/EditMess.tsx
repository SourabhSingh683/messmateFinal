import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

const messSchema = z.object({
  name: z.string().min(2, {
    message: "Mess name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  price_monthly: z.number().min(1, {
    message: "Monthly price must be greater than 0.",
  }),
  is_vegetarian: z.boolean().default(false),
  is_non_vegetarian: z.boolean().default(false),
  latitude: z.number().default(0),
  longitude: z.number().default(0),
});

const EditMess = () => {
  const { messId } = useParams<{ messId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof messSchema>>({
    resolver: zodResolver(messSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      price_monthly: 0,
      is_vegetarian: false,
      is_non_vegetarian: false,
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    const fetchMessDetails = async () => {
      if (!user || !messId) return;

      try {
        const { data, error } = await supabase
          .from("mess_services")
          .select("*")
          .eq("id", messId)
          .single();

        if (error) throw error;

        if (data) {
          // Populate form with existing data
          form.reset({
            name: data.name,
            description: data.description,
            address: data.address,
            price_monthly: data.price_monthly,
            is_vegetarian: data.is_vegetarian,
            is_non_vegetarian: data.is_non_vegetarian,
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
          });
        }
      } catch (error: any) {
        toast({
          title: "Error fetching mess details",
          description: error.message,
          variant: "destructive",
        });
        navigate("/manage-mess");
      } finally {
        setLoading(false);
      }
    };

    fetchMessDetails();
  }, [user, messId, form, navigate, toast]);

  const onSubmit = async (data: z.infer<typeof messSchema>) => {
    if (!user || !messId) {
      toast({
        title: "Authentication required",
        description: "Please log in to edit your mess service.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("mess_services")
        .update({
          name: data.name,
          description: data.description,
          address: data.address,
          price_monthly: data.price_monthly,
          is_vegetarian: data.is_vegetarian,
          is_non_vegetarian: data.is_non_vegetarian,
          latitude: data.latitude,
          longitude: data.longitude,
        })
        .eq("id", messId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your mess service has been updated successfully.",
      });

      navigate("/manage-mess");
    } catch (error: any) {
      toast({
        title: "Error updating mess service",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-[#FDF6E3]">
      <Card className="max-w-2xl mx-auto bg-white shadow-lg border-[#C4A484]">
        <CardHeader className="border-b border-[#C4A484]/20 bg-gradient-to-r from-[#8B4513]/5 to-transparent">
          <CardTitle className="text-[#5C2C0C] text-3xl font-bold">Edit Your Mess Service</CardTitle>
          <CardDescription className="text-[#5C2C0C] text-lg font-medium">
            Update your mess service details below
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-[#FDF6E3] p-6 rounded-lg border border-[#C4A484]/20">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#5C2C0C] text-lg font-semibold">Mess Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your mess name" 
                          {...field} 
                          className="border-[#C4A484] focus-visible:ring-[#8B4513] bg-white text-[#5C2C0C] text-lg font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-red-700 font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-[#FDF6E3] p-6 rounded-lg border border-[#C4A484]/20">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#5C2C0C] text-lg font-semibold">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your mess service, specialties, and facilities"
                          {...field}
                          className="border-[#C4A484] focus-visible:ring-[#8B4513] bg-white text-[#5C2C0C] min-h-[120px] text-lg font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-red-700 font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-[#FDF6E3] p-6 rounded-lg border border-[#C4A484]/20">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#5C2C0C] text-lg font-semibold">Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Full address of your mess" 
                          {...field} 
                          className="border-[#C4A484] focus-visible:ring-[#8B4513] bg-white text-[#5C2C0C] text-lg font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-red-700 font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-[#FDF6E3] p-6 rounded-lg border border-[#C4A484]/20">
                <FormField
                  control={form.control}
                  name="price_monthly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#5C2C0C] text-lg font-semibold">Monthly Base Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className="border-[#C4A484] focus-visible:ring-[#8B4513] bg-white text-[#5C2C0C] text-lg font-medium"
                        />
                      </FormControl>
                      <FormDescription className="text-[#5C2C0C] text-base font-medium">
                        This is the starting price for your mess service
                      </FormDescription>
                      <FormMessage className="text-red-700 font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-[#FDF6E3] p-6 rounded-lg border border-[#C4A484]/20">
                <h3 className="text-[#5C2C0C] text-lg font-semibold mb-4">Food Type</h3>
                <div className="flex gap-8">
                  <FormField
                    control={form.control}
                    name="is_vegetarian"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="w-5 h-5 border-[#C4A484] data-[state=checked]:bg-[#8B4513] data-[state=checked]:border-[#8B4513]"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-[#5C2C0C] text-lg font-medium cursor-pointer">Vegetarian</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_non_vegetarian"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="w-5 h-5 border-[#C4A484] data-[state=checked]:bg-[#8B4513] data-[state=checked]:border-[#8B4513]"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-[#5C2C0C] text-lg font-medium cursor-pointer">Non-Vegetarian</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white font-semibold px-8 py-3 text-lg transition-colors duration-200 rounded-lg"
                >
                  {isSubmitting && <Spinner className="mr-2 h-5 w-5" />}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/manage-mess")}
                  className="border-[#8B4513] text-[#5C2C0C] hover:bg-[#8B4513]/10 font-semibold px-8 py-3 text-lg rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMess;
