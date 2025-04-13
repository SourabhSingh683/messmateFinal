
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Search } from "lucide-react";
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
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          id,
          start_date,
          end_date,
          status,
          student_id,
          profiles:student_id(id, first_name, last_name)
        `)
        .eq("mess_id", messId);

      if (error) {
        throw error;
      }

      if (data) {
        const formattedCustomers = data.map((item) => ({
          id: item.profiles.id,
          first_name: item.profiles.first_name,
          last_name: item.profiles.last_name,
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
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={fetchCustomers}>Refresh</Button>
      </div>

      {filteredCustomers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Subscription Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  {customer.first_name} {customer.last_name}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      customer.subscription.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {customer.subscription.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(customer.subscription.start_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {customer.subscription.end_date
                    ? new Date(customer.subscription.end_date).toLocaleDateString()
                    : "Ongoing"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-4">
          <p>No customers found. When students subscribe to your mess, they will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
