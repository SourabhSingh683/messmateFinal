
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, CheckCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { MessService } from '@/types/database';

interface RateFeedbackFormProps {
  messId: string;
  messName: string;
  userId: string;
  onFeedbackSubmitted: () => void;
}

const RateFeedbackForm: React.FC<RateFeedbackFormProps> = ({
  messId,
  messName,
  userId,
  onFeedbackSubmitted,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check if user already submitted a review for this mess
      const { data: existingReviews, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('mess_id', messId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // If review exists, update it instead of creating a new one
      if (existingReviews) {
        const { error: updateError } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReviews.id);
          
        if (updateError) throw updateError;
        
        toast({
          title: 'Review Updated',
          description: 'Your review has been updated successfully.',
        });
      } else {
        // Create a new review
        const { error: insertError } = await supabase
          .from('reviews')
          .insert({
            user_id: userId,
            mess_id: messId,
            rating,
            comment: comment.trim() || null,
          });
          
        if (insertError) throw insertError;
        
        toast({
          title: 'Review Submitted',
          description: 'Your review has been submitted successfully.',
        });
      }
      
      setSuccess(true);
      onFeedbackSubmitted();
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setRating(0);
        setComment('');
        setSuccess(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate & Review</CardTitle>
        <CardDescription>Share your experience with {messName}</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-medium">Thank You!</h3>
            <p className="text-center text-muted-foreground mt-1">
              Your feedback helps improve the service.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="comment" className="block text-sm font-medium mb-2">
                Your Review (Optional)
              </label>
              <Textarea
                id="comment"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default RateFeedbackForm;
