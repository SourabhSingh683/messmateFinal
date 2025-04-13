
import { useState, useEffect } from "react";
import { MenuItemsApi } from "@/utils/supabaseRawApi";
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
  CalendarDays,
  Utensils,
  Search
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MenuItem } from "@/types/database";

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
  const [searchQuery, setSearchQuery] = useState("");
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
      const data = await MenuItemsApi.getByMessId(messId);
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
        await MenuItemsApi.update(editingItem.id, {
          name: values.name,
          description: values.description,
          day_of_week: values.day_of_week,
          meal_type: values.meal_type,
          is_vegetarian: values.is_vegetarian
        });

        toast({
          title: "Success",
          description: "Menu item updated successfully",
        });
      } else {
        // Create new item
        await MenuItemsApi.create({
          mess_id: messId,
          name: values.name,
          description: values.description,
          day_of_week: values.day_of_week,
          meal_type: values.meal_type,
          is_vegetarian: values.is_vegetarian
        });

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
        await MenuItemsApi.delete(id);
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

  const allFilteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredItems = searchQuery 
    ? allFilteredItems 
    : menuItems.filter(
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
          <Utensils className="h-5 w-5" />
          <h2 className="text-xl font-semibold dark:text-white">Menu Management</h2>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingItem(null)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-800 dark:text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </DialogTitle>
              <DialogDescription className="dark:text-gray-400">
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
                      <FormLabel className="dark:text-gray-300">Item Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Paneer Butter Masala, Dal, etc." 
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any special notes about the dish"
                          className="resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          {...field} 
                          value={field.value || ""}
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
                        <FormLabel className="dark:text-gray-300">Day of Week</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day} value={day} className="dark:text-white dark:focus:bg-gray-700">
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
                        <FormLabel className="dark:text-gray-300">Meal Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                              <SelectValue placeholder="Select meal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {mealTypes.map((meal) => (
                              <SelectItem key={meal} value={meal} className="dark:text-white dark:focus:bg-gray-700">
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 dark:border-gray-700 dark:bg-gray-800/50">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="dark:text-gray-300">Vegetarian</FormLabel>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                          Mark this item as vegetarian
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                    {editingItem ? "Update" : "Add"} Menu Item
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search menu items..."
              className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!searchQuery && (
            <div className="grid gap-2">
              <div>
                <h3 className="text-sm font-medium leading-none dark:text-gray-300 mb-2">Day of Week</h3>
                <Select 
                  value={currentView.day} 
                  onValueChange={(day) => setCurrentView({...currentView, day})}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day} className="dark:text-white dark:focus:bg-gray-700">
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h3 className="text-sm font-medium leading-none dark:text-gray-300 mb-2">Meal Type</h3>
                <Select 
                  value={currentView.meal} 
                  onValueChange={(meal) => setCurrentView({...currentView, meal})}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Meal" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    {mealTypes.map((meal) => (
                      <SelectItem key={meal} value={meal} className="dark:text-white dark:focus:bg-gray-700">
                        {meal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3 dark:text-white flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {searchQuery ? "Search Results" : `${currentView.day} - ${currentView.meal}`}
          </h3>
          {filteredItems.length > 0 ? (
            <div className="rounded-md border dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50 dark:bg-gray-700">
                  <TableRow>
                    <TableHead className="dark:text-gray-300">Item Name</TableHead>
                    {searchQuery && (
                      <>
                        <TableHead className="dark:text-gray-300">Day</TableHead>
                        <TableHead className="dark:text-gray-300">Meal</TableHead>
                      </>
                    )}
                    <TableHead className="dark:text-gray-300">Description</TableHead>
                    <TableHead className="dark:text-gray-300">Type</TableHead>
                    <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="dark:bg-gray-800">
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} className="dark:border-gray-700 dark:hover:bg-gray-700">
                      <TableCell className="dark:text-gray-300 font-medium">{item.name}</TableCell>
                      {searchQuery && (
                        <>
                          <TableCell className="dark:text-gray-300">{item.day_of_week}</TableCell>
                          <TableCell className="dark:text-gray-300">{item.meal_type}</TableCell>
                        </>
                      )}
                      <TableCell className="dark:text-gray-300">{item.description || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.is_vegetarian
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
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
          ) : (
            <div className="text-center p-8 border rounded-md dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800/50">
              <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">No menu items found {!searchQuery && `for ${currentView.day} - ${currentView.meal}`}.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try different search terms or " : ""}
                Click "Add Menu Item" to create your first item.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
