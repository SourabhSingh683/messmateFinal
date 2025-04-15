
import React from 'react';
import { Spinner } from "@/components/ui/spinner";
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
import { useCustomers } from '@/context/CustomerContext';
import { deleteCustomer } from '@/services/customerService';
import { useToast } from '@/hooks/use-toast';

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteCustomerDialog = ({ open, onOpenChange }: DeleteCustomerDialogProps) => {
  const { 
    selectedCustomerId, 
    isSubmitting, 
    setIsSubmitting, 
    setError, 
    refetchCustomers 
  } = useCustomers();
  const { toast } = useToast();

  const handleDeleteCustomer = async () => {
    if (!selectedCustomerId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      await deleteCustomer(selectedCustomerId);

      toast({
        title: 'Success',
        description: 'Customer removed successfully',
      });
      
      onOpenChange(false);
      refetchCustomers();
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
  );
};

export default DeleteCustomerDialog;
