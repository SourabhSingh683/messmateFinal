
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search, Package, AlertCircle } from "lucide-react";
import { InventoryItem } from "@/types/database";

interface InventoryManagementProps {
  messId: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters"),
  quantity: z.coerce.number().min(0, "Quantity must be 0 or greater"),
  unit: z.string().min(1, "Unit is required"),
});

const InventoryManagement = ({ messId }: InventoryManagementProps) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      unit: "kg",
    },
  });

  useEffect(() => {
    fetchInventory();
  }, [messId]);

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        quantity: editingItem.quantity,
        unit: editingItem.unit,
      });
    } else {
      form.reset({
        name: "",
        quantity: 0,
        unit: "kg",
      });
    }
  }, [editingItem, form]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('mess_id', messId);
      
      if (error) {
        setError(error.message);
        throw error;
      }
      
      setInventory(data as InventoryItem[] || []);
    } catch (error: any) {
      console.error("Error fetching inventory:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('inventory_items')
          .update({
            name: values.name,
            quantity: values.quantity,
            unit: values.unit,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id)
          .eq('mess_id', messId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Inventory item updated successfully",
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from('inventory_items')
          .insert({
            mess_id: messId,
            name: values.name,
            quantity: values.quantity,
            unit: values.unit
          });
          
        if (error) throw error;

        toast({
          title: "Success",
          description: "Inventory item added successfully",
        });
      }

      setOpenDialog(false);
      setEditingItem(null);
      form.reset();
      fetchInventory();
    } catch (error: any) {
      console.error("Error saving inventory item:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to save inventory item: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        setError(null);
        const { error } = await supabase
          .from('inventory_items')
          .delete()
          .eq('id', id)
          .eq('mess_id', messId);
        
        if (error) throw error;
        
        fetchInventory();
        toast({
          title: "Success",
          description: "Inventory item deleted successfully",
        });
      } catch (error: any) {
        console.error("Error deleting inventory item:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to delete inventory item: " + error.message,
          variant: "destructive",
        });
      }
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.unit.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <h2 className="text-xl font-semibold dark:text-white">Inventory Items</h2>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingItem(null)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-800 dark:text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
              </DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Enter the details for the inventory item
              </DialogDescription>
            </DialogHeader>
            {error && (
              <div className="bg-destructive/10 p-3 rounded-md mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
                <div className="text-sm text-destructive">{error}</div>
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Item Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Rice, Flour, etc." 
                          {...field} 
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            {...field}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Unit</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="kg, liters, pieces"
                            {...field}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white">
                    {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
                    {editingItem ? (isSubmitting ? "Updating..." : "Update") : (isSubmitting ? "Adding..." : "Add")} Item
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory items..."
            className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 p-4 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
          <div className="flex flex-col">
            <div className="text-sm font-medium text-destructive">Error loading inventory</div>
            <div className="text-sm text-destructive/80">{error}</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 self-start"
              onClick={() => fetchInventory()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {!error && filteredInventory.length > 0 ? (
        <div className="rounded-md border dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50 dark:bg-gray-700">
              <TableRow>
                <TableHead className="dark:text-gray-300">Item Name</TableHead>
                <TableHead className="dark:text-gray-300">Quantity</TableHead>
                <TableHead className="dark:text-gray-300">Unit</TableHead>
                <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="dark:bg-gray-800">
              {filteredInventory.map((item) => (
                <TableRow key={item.id} className="dark:border-gray-700 dark:hover:bg-gray-700">
                  <TableCell className="dark:text-gray-300">{item.name}</TableCell>
                  <TableCell className="dark:text-gray-300">{item.quantity}</TableCell>
                  <TableCell className="dark:text-gray-300">{item.unit}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingItem(item);
                        setOpenDialog(true);
                      }}
                      className="dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !error ? (
        <div className="text-center p-8 border rounded-md dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800/50">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="font-medium">No inventory items found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? "Try different search terms or " : ""}
            Add your first item to get started.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default InventoryManagement;
