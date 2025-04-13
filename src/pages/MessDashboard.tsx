
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CustomerManagement from "@/components/mess-dashboard/CustomerManagement";
import InventoryManagement from "@/components/mess-dashboard/InventoryManagement";
import MenuManagement from "@/components/mess-dashboard/MenuManagement";
import FeedbackSection from "@/components/mess-dashboard/FeedbackSection";
import AnnouncementSection from "@/components/mess-dashboard/AnnouncementSection";
import SubscriptionPlansSection from "@/components/mess-dashboard/SubscriptionPlansSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Users, 
  Package, 
  Utensils, 
  MessageSquare, 
  Megaphone, 
  BadgePlus
} from "lucide-react";

const MessDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messService, setMessService] = useState(null);

  useEffect(() => {
    const fetchMessService = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("mess_services")
          .select("*")
          .eq("owner_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching mess service:", error);
        } else {
          setMessService(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessService();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-900">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!messService) {
    return (
      <div className="container mx-auto p-8 text-center dark:bg-gray-900 dark:text-white min-h-screen">
        <h1 className="text-2xl font-bold mb-4">You don't have a mess service yet</h1>
        <p className="mb-8">Create your mess service to access the dashboard features.</p>
        <button
          onClick={() => navigate("/create-mess")}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Create Mess Service
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Mess Owner Dashboard</h1>
        <ThemeToggle />
      </div>
      
      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Menu</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Announcements</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <BadgePlus className="h-4 w-4" />
            <span className="hidden sm:inline">Subscriptions</span>
          </TabsTrigger>
        </TabsList>

        <Card className="border border-muted shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold dark:text-white flex items-center gap-2">
              {messService.name}
              <span className="text-sm font-normal text-muted-foreground dark:text-gray-400">Mess Management</span>
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Manage your mess services, inventory, menu, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="customers">
              <CustomerManagement messId={messService.id} />
            </TabsContent>
            
            <TabsContent value="inventory">
              <InventoryManagement messId={messService.id} />
            </TabsContent>
            
            <TabsContent value="menu">
              <MenuManagement messId={messService.id} />
            </TabsContent>
            
            <TabsContent value="feedback">
              <FeedbackSection messId={messService.id} />
            </TabsContent>
            
            <TabsContent value="announcements">
              <AnnouncementSection messId={messService.id} />
            </TabsContent>
            
            <TabsContent value="subscriptions">
              <SubscriptionPlansSection messId={messService.id} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default MessDashboard;
