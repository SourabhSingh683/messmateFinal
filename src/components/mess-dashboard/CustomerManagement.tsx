
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

const CustomerManagement = ({ messId }: CustomerManagementProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

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
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          onClick={fetchCustomers}
          variant="outline"
          size="icon"
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => 
            toast({
              title: "Subscription Feature",
              description: "Students can subscribe from the student interface. This button will be for manual additions in a future update.",
            })
          }
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {filteredCustomers.length > 0 ? (
        <div className="rounded-md border dark:border-gray-700 overflow-hidden">
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
        <div className="text-center p-8 border rounded-md dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800/50">
          <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="font-medium">No customers found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            When students subscribe to your mess, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
