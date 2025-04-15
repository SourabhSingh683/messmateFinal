
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
import { CustomerProvider } from '@/context/CustomerContext';
import { fetchCustomers } from '@/services/customerService';
import CustomerList from './customer/CustomerList';
import CustomerForm from './customer/CustomerForm';
import DeleteCustomerDialog from './customer/DeleteCustomerDialog';

interface CustomerManagementProps {
  messId: string;
}

const CustomerManagement = ({ messId }: CustomerManagementProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <CustomerProvider 
      messId={messId}
      fetchCustomersFunction={fetchCustomers}
    >
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
              <CustomerForm onSuccess={() => setOpenDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerList 
              onDeleteClick={(customerId) => {
                setOpenAlertDialog(true);
              }}
            />
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
