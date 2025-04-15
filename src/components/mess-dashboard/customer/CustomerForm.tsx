
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DialogFooter,
} from '@/components/ui/dialog';
import { useCustomers } from '@/context/CustomerContext';
import { addCustomer } from '@/services/customerService';
import { useToast } from '@/hooks/use-toast';

const customerSchema = z.object({
  first_name: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  last_name: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }).optional(),
});

interface CustomerFormProps {
  onSuccess: () => void;
}

const CustomerForm = ({ onSuccess }: CustomerFormProps) => {
  const { messId, setError, isSubmitting, setIsSubmitting, refetchCustomers } = useCustomers();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof customerSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await addCustomer(messId, values.first_name, values.last_name);
      
      toast({
        title: 'Success',
        description: 'Customer added successfully',
      });
      
      form.reset();
      refetchCustomers();
      onSuccess();
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

  return (
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
  );
};

export default CustomerForm;
