import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from "@/components/ui/spinner";
import { fetchFromSupabase } from '@/utils/supabaseRawApi';

interface Customer {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  mess_id: string;
  subscription_status: string;
}

const customerSchema = z.object({
  first_name: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  last_name: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }).optional(),
});

interface CustomerManagementProps {
  messId: string;
}

const CustomerManagement = ({ messId }: CustomerManagementProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
    },
  });

  useEffect(() => {
    fetchCustomers();
  }, [messId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          student_id,
          mess_id,
          status,
          created_at,
          profiles:student_id(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('mess_id', messId);

      if (error) {
        setError(error.message);
        throw error;
      }

      if (!data) {
        setCustomers([]);
        return;
      }

      const formattedCustomers: Customer[] = data.map((item) => ({
        id: item.id,
        student_id: item.student_id,
        first_name: item.profiles?.first_name || 'Unknown',
        last_name: item.profiles?.last_name || 'Unknown',
        created_at: item.created_at || new Date().toISOString(),
        mess_id: item.mess_id,
        subscription_status: item.status,
      }));

      setCustomers(formattedCustomers);
    } catch (error: any) {
      console.error('Error fetching customers:', error.message);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load customers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof customerSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const randomProfileId = crypto.randomUUID();
      
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          student_id: randomProfileId,
          mess_id: messId,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
        .select();
        
      if (subscriptionError) {
        throw subscriptionError;
      }

      try {
        await fetchFromSupabase(`/rest/v1/rpc/create_profile_with_id`, {
          method: 'POST',
          body: JSON.stringify({
            profile_id: randomProfileId,
            first_name_val: values.first_name,
            last_name_val: values.last_name,
            role_val: 'student'
          })
        });
      } catch (error: any) {
        throw new Error(error.message || 'Failed to create profile');
      }
      
      toast({
        title: 'Success',
        description: 'Customer added successfully',
      });
      
      setOpenDialog(false);
      form.reset();
      fetchCustomers();
    } catch (error: any) {
      console.error('Error adding customer:', error.message);
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add customer',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomerId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', selectedCustomerId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Customer removed successfully',
      });
      
      setOpenAlertDialog(false);
      setSelectedCustomerId(null);
      fetchCustomers();
    } catch (error: any) {
      console.error('Error deleting customer:', error.message);
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete customer',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Add Customer</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Fill in the customer details below. This will create a new customer account.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <div className="bg-destructive/10 p-3 rounded-md mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
                <div className="text-sm text-destructive">{error}</div>
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used for sending notifications (optional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                    {isSubmitting ? 'Adding...' : 'Add Customer'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <div className="text-center py-6 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 text-destructive" />
              <p className="text-destructive font-medium">Error loading customers</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => fetchCustomers()}
              >
                Try Again
              </Button>
            </div>
          ) : customers.length > 0 ? (
            <Table>
              <TableCaption>A list of your customers.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        customer.subscription_status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : customer.subscription_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.subscription_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(customer.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            setSelectedCustomerId(customer.id);
                            setOpenAlertDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No customers found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first customer to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the customer from your mess service. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCustomer}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerManagement;
