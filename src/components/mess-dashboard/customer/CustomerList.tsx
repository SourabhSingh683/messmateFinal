
import React from 'react';
import { Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCustomers } from '@/context/CustomerContext';

interface CustomerListProps {
  onDeleteClick: (customerId: string) => void;
}

const CustomerList = ({ onDeleteClick }: CustomerListProps) => {
  const { customers, loading, error, refetchCustomers } = useCustomers();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 border border-destructive/20 rounded-lg">
        <AlertCircle className="h-10 w-10 mx-auto mb-2 text-destructive" />
        <p className="text-destructive font-medium">Error loading customers</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={() => refetchCustomers()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No customers found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first customer to get started.
        </p>
      </div>
    );
  }

  return (
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
                  onClick={() => onDeleteClick(customer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CustomerList;
