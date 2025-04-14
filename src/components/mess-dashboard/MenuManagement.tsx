
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MenuItemsApi } from '@/utils/supabaseRawApi';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from "@/components/ui/spinner";

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  day_of_week: string;
  meal_type: string;
  is_vegetarian: boolean;
  mess_id: string;
}

interface MenuManagementProps {
  messId: string;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ messId }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(DAYS_OF_WEEK[0]);
  const [mealType, setMealType] = useState(MEAL_TYPES[0]);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, [messId, selectedDay, selectedMeal]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      let { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('mess_id', messId);

      if (error) throw error;

      // Filter by day and meal type if selected
      if (selectedDay) {
        data = data.filter(item => item.day_of_week === selectedDay);
      }
      if (selectedMeal) {
        data = data.filter(item => item.meal_type === selectedMeal);
      }

      // Group by day and meal type
      const groupedData = data.sort((a, b) => {
        const dayDiff = DAYS_OF_WEEK.indexOf(a.day_of_week) - DAYS_OF_WEEK.indexOf(b.day_of_week);
        if (dayDiff !== 0) return dayDiff;
        return MEAL_TYPES.indexOf(a.meal_type) - MEAL_TYPES.indexOf(b.meal_type);
      });

      setMenuItems(groupedData);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a menu item name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const menuItem = {
        name,
        description: description || null,
        day_of_week: dayOfWeek,
        meal_type: mealType,
        is_vegetarian: isVegetarian,
        mess_id: messId,
      };

      let response;
      
      if (editId) {
        const { data, error } = await supabase
          .from('menu_items')
          .update(menuItem)
          .eq('id', editId)
          .eq('mess_id', messId)
          .select();
        
        if (error) throw error;
        response = data;
        
        toast({
          title: 'Success',
          description: 'Menu item updated successfully.',
        });
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert(menuItem)
          .select();
        
        if (error) throw error;
        response = data;
        
        toast({
          title: 'Success',
          description: 'Menu item added successfully.',
        });
      }

      // Reset form
      setName('');
      setDescription('');
      setDayOfWeek(DAYS_OF_WEEK[0]);
      setMealType(MEAL_TYPES[0]);
      setIsVegetarian(false);
      setEditId(null);
      setIsOpen(false);
      
      await fetchMenuItems();
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save menu item. ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setName(item.name);
    setDescription(item.description || '');
    setDayOfWeek(item.day_of_week);
    setMealType(item.meal_type);
    setIsVegetarian(item.is_vegetarian);
    setEditId(item.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
        .eq('mess_id', messId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully.',
      });
      
      await fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete menu item.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setName('');
    setDescription('');
    setDayOfWeek(DAYS_OF_WEEK[0]);
    setMealType(MEAL_TYPES[0]);
    setIsVegetarian(false);
    setEditId(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Menu Management</h2>
          <p className="text-muted-foreground">
            Manage your mess menu for different days and meal times
          </p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Add Menu Item</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <Select
            value={selectedDay || ""}
            onValueChange={(value) => setSelectedDay(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All days</SelectItem>
              {DAYS_OF_WEEK.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={selectedMeal || ""}
            onValueChange={(value) => setSelectedMeal(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by meal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All meals</SelectItem>
              {MEAL_TYPES.map((meal) => (
                <SelectItem key={meal} value={meal}>
                  {meal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : menuItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vegetarian</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.day_of_week}</TableCell>
                    <TableCell>{item.meal_type}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.description || '-'}
                    </TableCell>
                    <TableCell>
                      {item.is_vegetarian ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Yes
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No menu items found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first menu item to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription>
              Enter the details for the menu item
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name">Item Name</label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description">Description (optional)</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="day">Day of Week</label>
                  <Select
                    value={dayOfWeek}
                    onValueChange={setDayOfWeek}
                  >
                    <SelectTrigger id="day">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="meal">Meal Type</label>
                  <Select
                    value={mealType}
                    onValueChange={setMealType}
                  >
                    <SelectTrigger id="meal">
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map((meal) => (
                        <SelectItem key={meal} value={meal}>
                          {meal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vegetarian"
                  checked={isVegetarian}
                  onCheckedChange={(checked) => setIsVegetarian(checked === true)}
                />
                <label
                  htmlFor="vegetarian"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mark this item as vegetarian
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                {isSubmitting
                  ? editId
                    ? 'Updating...'
                    : 'Adding...'
                  : editId
                    ? 'Update Item'
                    : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;
