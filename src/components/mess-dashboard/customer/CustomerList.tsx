
import React from 'react';
import { Edit, Trash2, AlertCircle, Phone, MapPin, Mail } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
          <TableHead>Contact Info</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id} className="hover:bg-accent/10 transition-colors">
            <TableCell className="font-medium">
              {customer.first_name} {customer.last_name}
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1 text-sm">
                {customer.mobile && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{customer.mobile}</span>
                  </div>
                )}
                {customer.address && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[180px]">{customer.address}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[300px]">{customer.address}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {customer.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[180px]">{customer.email}</span>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                customer.subscription_status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                  : customer.subscription_status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {customer.subscription_status}
              </span>
            </TableCell>
            <TableCell>
              {new Date(customer.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="icon" className="hover:bg-accent/20">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onDeleteClick(customer.id)}
                  className="hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300"
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
