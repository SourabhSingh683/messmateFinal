import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Spinner } from '@/components/ui/spinner';

const messSchema = z.object({
  name: z.string().min(2, {
    message: 'Mess name must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  price_monthly: z.number().min(1, {
    message: 'Monthly price must be greater than 0.',
  }),
  is_vegetarian: z.boolean().default(false),
  is_non_vegetarian: z.boolean().default(false),
  latitude: z.number().default(0),
  longitude: z.number().default(0),
});

const CreateMess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof messSchema>>({
    resolver: zodResolver(messSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      price_monthly: 0,
      is_vegetarian: false,
      is_non_vegetarian: false,
      latitude: 0,
      longitude: 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof messSchema>) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create a mess service.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const latitude = 0;
      const longitude = 0;

      const { data: messData, error } = await supabase
        .from('mess_services')
        .insert({
          owner_id: user.id,
          name: data.name,
          description: data.description,
          address: data.address,
          price_monthly: data.price_monthly,
          is_vegetarian: data.is_vegetarian,
          is_non_vegetarian: data.is_non_vegetarian,
          latitude,
          longitude,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your mess service has been created successfully.',
      });

      // Navigate to the manage mess page
      navigate('/manage-mess');
    } catch (error: any) {
      toast({
        title: 'Error creating mess service',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Your Mess Service</CardTitle>
          <CardDescription>
            Fill in the details below to register your mess service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mess Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your mess name" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your mess service, specialties, and facilities"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full address of your mess" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_monthly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Base Price (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the starting price for your mess service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-8">
                <FormField
                  control={form.control}
                  name="is_vegetarian"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vegetarian</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_non_vegetarian"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Non-Vegetarian</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
                  Create Mess Service
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/manage-mess')}
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

export default CreateMess; 