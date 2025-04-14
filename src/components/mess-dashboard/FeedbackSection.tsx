
import { useState, useEffect } from "react";
import { FeedbackApi } from "@/utils/supabaseRawApi";
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
import { Search, MessageSquare, Star, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
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
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [messId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await FeedbackApi.getByMessId(messId);
      setReviews(data as Review[] || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? "fill-yellow-400 text-yellow-400" 
            : "fill-none text-gray-400 dark:text-gray-600"
        }`}
      />
    ));
  };

  const filteredReviews = reviews.filter(
    (review) =>
      review.profiles.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.profiles.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.comment && review.comment.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold dark:text-white">Customer Feedback</h2>
        </div>
        <Button 
          onClick={fetchReviews}
          variant="outline"
          size="icon"
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search feedback..."
            className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredReviews.length > 0 ? (
        <div className="rounded-md border dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50 dark:bg-gray-700">
              <TableRow>
                <TableHead className="dark:text-gray-300">Customer</TableHead>
                <TableHead className="dark:text-gray-300">Rating</TableHead>
                <TableHead className="dark:text-gray-300">Comment</TableHead>
                <TableHead className="dark:text-gray-300">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="dark:bg-gray-800">
              {filteredReviews.map((review) => (
                <TableRow key={review.id} className="dark:border-gray-700 dark:hover:bg-gray-700">
                  <TableCell className="dark:text-gray-300 font-medium">
                    {review.profiles.first_name} {review.profiles.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300 max-w-md">
                    {review.comment || "No comment"}
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {new Date(review.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800/50">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="font-medium">No feedback yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            When customers leave reviews, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;
