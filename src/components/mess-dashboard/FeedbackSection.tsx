
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
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star } from "lucide-react";

interface Review {
  id: string;
  user_id: string;
  mess_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
  };
}

interface FeedbackSectionProps {
  messId: string;
}

const FeedbackSection = ({ messId }: FeedbackSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [messId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          user:user_id (
            first_name,
            last_name
          )
        `)
        .eq("mess_id", messId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
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
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Customer Feedback</h2>
        </div>
        <Button onClick={fetchReviews}>Refresh</Button>
      </div>

      {reviews.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  {review.user.first_name} {review.user.last_name}
                </TableCell>
                <TableCell>{renderStars(review.rating)}</TableCell>
                <TableCell>{review.comment || "No comment provided"}</TableCell>
                <TableCell>
                  {new Date(review.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-8 border rounded-md">
          <p>No reviews yet. Reviews will appear here when customers provide feedback.</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;
