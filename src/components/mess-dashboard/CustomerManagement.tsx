
import React, { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CustomerProvider } from '@/context/CustomerContext';
import { fetchCustomers } from '@/services/customerService';
import CustomerList from './customer/CustomerList';
import CustomerForm from './customer/CustomerForm';
import DeleteCustomerDialog from './customer/DeleteCustomerDialog';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerManagementProps {
  messId: string;
}

const CustomerManagement = ({ messId }: CustomerManagementProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // This will hide the initial loading state after a timeout
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAddCustomerSuccess = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <CustomerProvider 
      messId={messId}
      fetchCustomersFunction={fetchCustomers}
    >
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 transition-all duration-300 hover:scale-105 bg-[#8B4513] hover:bg-[#5C2C0C]">
                <UserPlus className="h-4 w-4" />
                <span>Add Customer</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="animate-scale-in">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Fill in the customer details below. This will create a new customer account.
                </DialogDescription>
              </DialogHeader>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <CustomerForm onSuccess={handleAddCustomerSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="transition-all duration-300 hover:shadow-md border-t-2 border-t-[#8B4513]/60 dark:border-t-[#8B4513]/80">
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <CustomerList 
                onDeleteClick={(customerId) => {
                  setOpenAlertDialog(true);
                }}
              />
            )}
          </CardContent>
        </Card>

        <DeleteCustomerDialog 
          open={openAlertDialog} 
          onOpenChange={setOpenAlertDialog} 
        />
      </div>
    </CustomerProvider>
  );
};

export default CustomerManagement;
