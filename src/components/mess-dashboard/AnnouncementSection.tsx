
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Megaphone,
  CalendarDays
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  start_date: string;
  end_date: string;
  mess_id: string;
}

interface AnnouncementSectionProps {
  messId: string;
}

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(5, "Content must be at least 5 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
});

const AnnouncementSection = ({ messId }: AnnouncementSectionProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [messId]);

  useEffect(() => {
    if (editingAnnouncement) {
      form.reset({
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
        start_date: new Date(editingAnnouncement.start_date)
          .toISOString()
          .split("T")[0],
        end_date: new Date(editingAnnouncement.end_date)
          .toISOString()
          .split("T")[0],
      });
    } else {
      form.reset({
        title: "",
        content: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });
    }
  }, [editingAnnouncement, form]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("mess_id", messId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingAnnouncement) {
        // Update existing announcement
        const { error } = await supabase
          .from("announcements")
          .update({
            title: values.title,
            content: values.content,
            start_date: values.start_date,
            end_date: values.end_date,
          })
          .eq("id", editingAnnouncement.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
      } else {
        // Create new announcement
        const { error } = await supabase.from("announcements").insert({
          title: values.title,
          content: values.content,
          start_date: values.start_date,
          end_date: values.end_date,
          mess_id: messId,
        });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Announcement created successfully",
        });
      }

      setOpenDialog(false);
      setEditingAnnouncement(null);
      form.reset();
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      try {
        const { error } = await supabase
          .from("announcements")
          .delete()
          .eq("id", id);

        if (error) throw error;
        fetchAnnouncements();
        toast({
          title: "Success",
          description: "Announcement deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast({
          title: "Error",
          description: "Failed to delete announcement",
          variant: "destructive",
        });
      }
    }
  };

  const isActive = (startDate: string, endDate: string) => {
    const now = new Date();
    return (
      new Date(startDate) <= now && new Date(endDate) >= now
    );
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
        <div className="flex items-center space-x-2">
          <Megaphone className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Announcements</h2>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAnnouncement(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
              </DialogTitle>
              <DialogDescription>
                Create announcements for your customers
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Holiday Notice, Special Menu, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter announcement details here..."
                          className="min-h-[100px]"
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
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingAnnouncement ? "Update" : "Create"} Announcement
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {announcements.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell className="font-medium">{announcement.title}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {announcement.content}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <CalendarDays className="h-3 w-3" />
                    <span>
                      {new Date(announcement.start_date).toLocaleDateString()} - {new Date(announcement.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      isActive(announcement.start_date, announcement.end_date)
                        ? "bg-green-100 text-green-800"
                        : new Date(announcement.start_date) > new Date()
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {isActive(announcement.start_date, announcement.end_date)
                      ? "Active"
                      : new Date(announcement.start_date) > new Date()
                      ? "Upcoming"
                      : "Expired"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingAnnouncement(announcement);
                      setOpenDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(announcement.id)}
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
          <p>No announcements yet. Create an announcement to inform your customers.</p>
        </div>
      )}
    </div>
  );
};

export default AnnouncementSection;
