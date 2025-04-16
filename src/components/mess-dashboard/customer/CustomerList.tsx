
import React, { useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, UserRound, Mail, Phone, Home } from 'lucide-react';
import { useCustomers } from '@/context/CustomerContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomerListProps {
  onDeleteClick: (customerId: string) => void;
  isRefreshing?: boolean;
  setIsRefreshing?: (value: boolean) => void;
}

const CustomerList = ({ 
  onDeleteClick,
  isRefreshing = false,
  setIsRefreshing = () => {}
}: CustomerListProps) => {
  const { 
    customers, 
    loading, 
    error, 
    selectedCustomerId, 
    setSelectedCustomerId,
    refetchCustomers
  } = useCustomers();

  useEffect(() => {
    if (isRefreshing) {
      const refreshData = async () => {
        await refetchCustomers();
        setIsRefreshing(false);
      };
      refreshData();
    }
  }, [isRefreshing, refetchCustomers, setIsRefreshing]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive">Error: {error}</p>
        <Button 
          variant="outline" 
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
      <div className="py-8 text-center border rounded-md">
        <UserRound className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
        <p className="text-muted-foreground">No customers found.</p>
        <p className="text-sm text-muted-foreground mt-1">Add your first customer to get started.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow 
              key={customer.id}
              className={
                selectedCustomerId === customer.id 
                  ? "bg-muted/50" 
                  : "hover:bg-muted/30"
              }
              onClick={() => setSelectedCustomerId(customer.id)}
            >
              <TableCell className="font-medium">
                {customer.first_name} {customer.last_name}
              </TableCell>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  {customer.mobile && (
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                      {customer.mobile}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                      {customer.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {customer.address ? (
                  <div className="flex items-center text-sm">
                    <Home className="mr-2 h-3 w-3 text-muted-foreground" />
                    {customer.address}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Not provided</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCustomerId(customer.id);
                    onDeleteClick(customer.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default CustomerList;
