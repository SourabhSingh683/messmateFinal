
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2,
  CalendarDays
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  day_of_week: string;
  meal_type: string;
  is_vegetarian: boolean;
  mess_id: string;
  created_at: string;
}

interface MenuManagementProps {
  messId: string;
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const formSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters"),
  description: z.string().optional(),
  day_of_week: z.string().min(1, "Day of week is required"),
  meal_type: z.string().min(1, "Meal type is required"),
  is_vegetarian: z.boolean().default(false),
});

const MenuManagement = ({ messId }: MenuManagementProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [currentView, setCurrentView] = useState<{
    day: string;
    meal: string;
  }>({
    day: "Monday",
    meal: "Breakfast",
  });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      day_of_week: "Monday",
      meal_type: "Breakfast",
      is_vegetarian: false,
    },
  });

  useEffect(() => {
    fetchMenuItems();
  }, [messId]);

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        description: editingItem.description || "",
        day_of_week: editingItem.day_of_week,
        meal_type: editingItem.meal_type,
        is_vegetarian: editingItem.is_vegetarian,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        day_of_week: currentView.day,
        meal_type: currentView.meal,
        is_vegetarian: false,
      });
    }
  }, [editingItem, form, currentView]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("mess_id", messId);

      if (error) {
        throw error;
      }

      // Use type assertion to tell TypeScript this data matches our interface
      setMenuItems(data as MenuItem[] || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
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
          .from("menu_items")
          .update({
            name: values.name,
            description: values.description,
            day_of_week: values.day_of_week,
            meal_type: values.meal_type,
            is_vegetarian: values.is_vegetarian,
          })
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Menu item updated successfully",
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from("menu_items")
          .insert({
            name: values.name,
            description: values.description,
            day_of_week: values.day_of_week,
            meal_type: values.meal_type,
            is_vegetarian: values.is_vegetarian,
            mess_id: messId,
          });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Menu item added successfully",
        });
      }

      setOpenDialog(false);
      setEditingItem(null);
      form.reset();
      fetchMenuItems();
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      try {
        const { error } = await supabase
          .from("menu_items")
          .delete()
          .eq("id", id);

        if (error) throw error;
        fetchMenuItems();
        toast({
          title: "Success",
          description: "Menu item deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting menu item:", error);
        toast({
          title: "Error",
          description: "Failed to delete menu item",
          variant: "destructive",
        });
      }
    }
  };

  const filteredItems = menuItems.filter(
    (item) =>
      item.day_of_week === currentView.day && 
      item.meal_type === currentView.meal
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
          <CalendarDays className="h-5 w-5" />
          <div className="flex items-center space-x-2">
            <Select 
              value={currentView.day} 
              onValueChange={(day) => setCurrentView({...currentView, day})}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={currentView.meal} 
              onValueChange={(meal) => setCurrentView({...currentView, meal})}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Meal" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((meal) => (
                  <SelectItem key={meal} value={meal}>
                    {meal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </DialogTitle>
              <DialogDescription>
                Enter the details for the menu item
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
                        <Input placeholder="Paneer Butter Masala, Dal, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any special notes about the dish"
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="day_of_week"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meal_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select meal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mealTypes.map((meal) => (
                              <SelectItem key={meal} value={meal}>
                                {meal}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="is_vegetarian"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vegetarian</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    {editingItem ? "Update" : "Add"} Menu Item
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">
          {currentView.day} - {currentView.meal}
        </h3>
        {filteredItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.is_vegetarian
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.is_vegetarian ? "Veg" : "Non-Veg"}
                    </span>
                  </TableCell>
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
          <div className="text-center p-8 border rounded-md">
            <p>No menu items found for {currentView.day} - {currentView.meal}.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click "Add Menu Item" to create your first item.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManagement;
