
import { useState, useEffect } from "react";
import { CustomersApi } from "@/utils/supabaseRawApi";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  subscription: {
    id: string;
    start_date: string;
    end_date: string | null;
    status: string;
  };
}

interface CustomerManagementProps {
  messId: string;
}

const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  status: z.string().default("active")
});

const CustomerManagement = ({ messId }: CustomerManagementProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "active"
    },
  });

  useEffect(() => {
    fetchCustomers();
  }, [messId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await CustomersApi.getByMessId(messId);
      
      if (data) {
        const formattedCustomers = data.map((item) => ({
          id: item.profiles?.id || "",
          first_name: item.profiles?.first_name || "",
          last_name: item.profiles?.last_name || "",
          subscription: {
            id: item.id,
            start_date: item.start_date,
            end_date: item.end_date,
            status: item.status,
          },
        }));
        setCustomers(formattedCustomers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Check if user exists
      const { data: existingUsers, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', values.email)
        .limit(1);
      
      if (userError) throw userError;
      
      let userId;
      
      if (!existingUsers || existingUsers.length === 0) {
        // Create new user
        const { data: newUser, error: createError } = await supabase.auth.signUp({
          email: values.email,
          password: 'Password123', // Default password that user can change later
          options: {
            data: {
              first_name: values.first_name,
              last_name: values.last_name,
              role: 'student'
            }
          }
        });
        
        if (createError) throw createError;
        userId = newUser.user?.id;
      } else {
        userId = existingUsers[0].id;
      }
      
      if (!userId) {
        throw new Error("Failed to get or create user ID");
      }
      
      // Create subscription
      await CustomersApi.addCustomer({
        mess_id: messId,
        student_id: userId,
        start_date: values.start_date,
        end_date: values.end_date || null,
        status: values.status
      });
      
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      
      setOpenDialog(false);
      form.reset();
      fetchCustomers();
    } catch (error: any) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add customer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          onClick={fetchCustomers}
          variant="outline"
          size="icon"
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 transition-colors duration-200 hover:scale-105"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:scale-105"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-800 dark:text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Enter customer details to add them to your mess service
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John" 
                            {...field} 
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Doe" 
                            {...field} 
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="john.doe@example.com" 
                          {...field} 
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Start Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ""}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white transition-colors duration-200"
                  >
                    {isSubmitting ? <Spinner className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    Add Customer
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredCustomers.length > 0 ? (
        <div className="rounded-md border dark:border-gray-700 overflow-hidden glass-card">
          <Table>
            <TableHeader className="bg-muted/50 dark:bg-gray-700">
              <TableRow>
                <TableHead className="dark:text-gray-300">Name</TableHead>
                <TableHead className="dark:text-gray-300">Subscription Status</TableHead>
                <TableHead className="dark:text-gray-300">Start Date</TableHead>
                <TableHead className="dark:text-gray-300">End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="dark:bg-gray-800">
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="dark:border-gray-700 dark:hover:bg-gray-700">
                  <TableCell className="dark:text-gray-300">
                    {customer.first_name} {customer.last_name}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        customer.subscription.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {customer.subscription.status}
                    </span>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {new Date(customer.subscription.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {customer.subscription.end_date
                      ? new Date(customer.subscription.end_date).toLocaleDateString()
                      : "Ongoing"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800/50 glass-card">
          <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="font-medium">No customers found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first customer using the Add Customer button.
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
