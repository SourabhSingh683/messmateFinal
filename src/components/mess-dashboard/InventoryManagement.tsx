
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  mess_id: string;
  created_at: string;
}

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
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("mess_id", messId)
        .order("name");

      if (error) {
        throw error;
      }

      // Use type assertion to tell TypeScript this data matches our interface
      setInventory(data as InventoryItem[] || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
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
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from("inventory_items")
          .update({
            name: values.name,
            quantity: values.quantity,
            unit: values.unit,
          })
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Inventory item updated successfully",
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from("inventory_items")
          .insert({
            name: values.name,
            quantity: values.quantity,
            unit: values.unit,
            mess_id: messId,
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
    } catch (error) {
      console.error("Error saving inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to save inventory item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const { error } = await supabase
          .from("inventory_items")
          .delete()
          .eq("id", id);

        if (error) throw error;
        fetchInventory();
        toast({
          title: "Success",
          description: "Inventory item deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting inventory item:", error);
        toast({
          title: "Error",
          description: "Failed to delete inventory item",
          variant: "destructive",
        });
      }
    }
  };

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
        <h2 className="text-xl font-semibold">Inventory Items</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
              </DialogTitle>
              <DialogDescription>
                Enter the details for the inventory item
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Rice, Flour, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          {...field}
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
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="kg, liters, pieces"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    {editingItem ? "Update" : "Add"} Item
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {inventory.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingItem(item);
                      setOpenDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-4 border rounded-md">
          <p>No inventory items found. Add your first item to get started.</p>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
