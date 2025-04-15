
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Megaphone, Trash2, Edit, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';

interface Announcement {
  id: string;
  title: string;
  content: string;
  start_date: string;
  end_date: string;
  created_at: string;
  mess_id: string;
}

interface AnnouncementSectionProps {
  messId: string;
}

const AnnouncementSection = ({ messId }: AnnouncementSectionProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [messId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('mess_id', messId)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        throw error;
      }

      setAnnouncements(data || []);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load announcements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const announcementData = {
        title,
        content,
        start_date: startDate,
        end_date: endDate,
        mess_id: messId,
      };

      if (editingId) {
        // Update existing announcement
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingId)
          .eq('mess_id', messId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Announcement updated successfully',
        });
      } else {
        // Create new announcement
        const { error } = await supabase
          .from('announcements')
          .insert(announcementData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Announcement created successfully',
        });
      }

      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error saving announcement:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to save announcement: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setTitle(announcement.title);
    setContent(announcement.content);
    setStartDate(announcement.start_date);
    setEndDate(announcement.end_date);
    setEditingId(announcement.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        setError(null);
        
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id)
          .eq('mess_id', messId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Announcement deleted successfully',
        });
        
        fetchAnnouncements();
      } catch (error: any) {
        console.error('Error deleting announcement:', error);
        setError(error.message);
        toast({
          title: 'Error',
          description: 'Failed to delete announcement: ' + error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setEditingId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Megaphone className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Announcements</h2>
        </div>
        <Button onClick={handleAddNew}>
          Create Announcement
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 p-4 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
          <div className="flex flex-col">
            <div className="text-sm font-medium text-destructive">Error loading announcements</div>
            <div className="text-sm text-destructive/80">{error}</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 self-start"
              onClick={() => fetchAnnouncements()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : announcements.length > 0 ? (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(announcement)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(announcement.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Active: {new Date(announcement.start_date).toLocaleDateString()} to {new Date(announcement.end_date).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="font-medium">No announcements found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first announcement to notify your customers about important updates.
          </p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Announcement' : 'Create Announcement'}
            </DialogTitle>
            <DialogDescription>
              Create announcements for your customers
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title">Title</label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="content">Content</label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="start-date">Start Date</label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="end-date">End Date</label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
                {isSubmitting 
                  ? (editingId ? 'Updating...' : 'Creating...') 
                  : (editingId ? 'Update Announcement' : 'Create Announcement')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementSection;
