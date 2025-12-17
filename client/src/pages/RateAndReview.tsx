import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Send, Star } from 'lucide-react';
import { useState } from 'react';

interface Provider {
  id: number;
  name: string;
  imageUrl?: string | null;
}

interface RateAndReviewProps {
  provider: Provider;
  bookingId: number;
  onSubmit: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const tipOptions = [{ value: 0, label: 'No tip' }, { value: 5, label: '$5' }, { value: 10, label: '$10' }, { value: 15, label: '$15' }, {
  value: 20,
  label: '$20'
}];

export default function RateAndReview({ provider, bookingId, onSubmit, onSkip, onBack }: RateAndReviewProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = trpc.review.create.useMutation();

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await submitReview.mutateAsync({
        providerId: provider.id,
        bookingId,
        rating,
        comment: comment || undefined,
        tipAmount: tipAmount > 0 ? tipAmount : undefined
      });
      onSubmit();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  const getRatingLabel = (r: number) => {
    if (r === 5) return 'Excellent!';
    if (r === 4) return 'Great';
    if (r === 3) return 'Good';
    if (r === 2) return 'Fair';
    if (r === 1) return 'Poor';
    return 'Tap to rate';
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center justify-between p-4'>
          <Button variant='ghost' size='icon' onClick={onBack}>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <h1 className='text-lg font-semibold text-foreground'>Rate Your Experience</h1>
          <Button variant='ghost' onClick={onSkip} className='text-muted-foreground'>Skip</Button>
        </div>
      </div>

      <div className='p-4 space-y-6'>
        {/* Provider Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='text-center'>
          <Avatar className='w-20 h-20 mx-auto mb-4'>
            <AvatarImage src={provider.imageUrl || undefined} />
            <AvatarFallback className='bg-primary text-primary-foreground text-2xl'>
              {provider.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h2 className='text-xl font-semibold text-foreground'>{provider.name}</h2>
          <p className='text-muted-foreground'>How was your experience?</p>
        </motion.div>

        {/* Star Rating */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='text-center'>
          <div className='flex justify-center gap-2 mb-2'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className='p-1 transition-transform hover:scale-110'>
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= displayRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'
                  }`} />
              </button>
            ))}
          </div>
          <p className='text-sm text-muted-foreground'>{getRatingLabel(displayRating)}</p>
        </motion.div>

        {/* Comment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className='p-4'>
              <Textarea
                placeholder={`Tell others about your experience with ${provider.name.split(' ')[0]}...`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className='min-h-25 border-0 p-0 focus-visible:ring-0' />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tip Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className='font-medium text-foreground mb-3 flex items-center gap-2'>
            <DollarSign className='w-5 h-5 text-accent-foreground' />
            Add a tip for {provider.name.split(' ')[0]}?
          </h3>
          <div className='flex gap-2 flex-wrap'>
            {tipOptions.map((option) => (
              <Button
                key={option.value}
                variant={tipAmount === option.value ? 'default' : 'outline'}
                onClick={() => setTipAmount(option.value)}
                className='flex-1 min-w-15'>
                {option.label}
              </Button>
            ))}
          </div>
          <p className='text-xs text-muted-foreground mt-2'>100% of tips go directly to your service provider</p>
        </motion.div>

        {/* Submit Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button className='w-full h-12' onClick={handleSubmit} disabled={rating === 0 || isSubmitting}>
            {isSubmitting ?
              (
                <span className='flex items-center gap-2'>
                  <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Submitting...
                </span>
              ) :
              (
                <>
                  <Send className='w-5 h-5 mr-2' />
                  Submit Review
                  {tipAmount > 0 && ` & $${tipAmount} Tip`}
                </>
              )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
