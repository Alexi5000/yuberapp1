import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Clock, DollarSign, MessageCircle, Send, Wrench } from 'lucide-react';
import { useState } from 'react';

interface ProblemResolutionCenterProps {
  bookingId: string;
  providerName: string;
  onSubmit: (issue: { type: string, description: string }) => void;
  onBack: () => void;
}

const issueTypes = [
  { id: 'quality', label: 'Quality of work', icon: Wrench, description: 'Work not completed as expected' },
  { id: 'timing', label: 'Timing issues', icon: Clock, description: 'Provider was late or took too long' },
  { id: 'pricing', label: 'Pricing dispute', icon: DollarSign, description: 'Charged more than quoted' },
  { id: 'behavior', label: 'Provider behavior', icon: MessageCircle, description: 'Unprofessional conduct' },
  { id: 'other', label: 'Other issue', icon: AlertCircle, description: 'Something else went wrong' }
];

export default function ProblemResolutionCenter({ bookingId, providerName, onSubmit, onBack }: ProblemResolutionCenterProps) {
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedIssue) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmit({ type: selectedIssue, description });
    setIsSubmitting(false);
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center p-4'>
          <Button variant='ghost' size='icon' onClick={onBack} className='mr-3'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <div>
            <h1 className='text-xl font-semibold text-foreground'>Report a Problem</h1>
            <p className='text-sm text-muted-foreground'>Booking #{bookingId}</p>
          </div>
        </div>
      </div>

      <div className='p-4 space-y-6'>
        {/* Issue Type Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className='font-medium text-foreground mb-3'>What went wrong?</h3>
          <RadioGroup value={selectedIssue} onValueChange={setSelectedIssue}>
            <div className='space-y-3'>
              {issueTypes.map((issue) => {
                const Icon = issue.icon;
                return (
                  <Card
                    key={issue.id}
                    className={`cursor-pointer transition-all ${
                      selectedIssue === issue.id ? 'border-primary ring-1 ring-primary' : 'hover:border-muted-foreground/30'
                    }`}
                    onClick={() => setSelectedIssue(issue.id)}>
                    <CardContent className='p-4'>
                      <div className='flex items-center gap-3'>
                        <RadioGroupItem value={issue.id} id={issue.id} />
                        <div className='w-10 h-10 bg-muted rounded-full flex items-center justify-center'>
                          <Icon className='w-5 h-5 text-muted-foreground' />
                        </div>
                        <div className='flex-1'>
                          <Label htmlFor={issue.id} className='font-medium text-foreground cursor-pointer'>{issue.label}</Label>
                          <p className='text-sm text-muted-foreground'>{issue.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </RadioGroup>
        </motion.div>

        {/* Description */}
        {selectedIssue && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className='font-medium text-foreground mb-3'>Tell us more</h3>
            <Textarea
              placeholder={`Describe what happened with ${providerName}...`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='min-h-30' />
            <p className='text-xs text-muted-foreground mt-2'>Your feedback helps us improve the YUBER experience for everyone.</p>
          </motion.div>
        )}

        {/* Resolution Options */}
        {selectedIssue && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className='bg-muted/50'>
              <CardContent className='p-4'>
                <h4 className='font-medium text-foreground mb-2'>What happens next?</h4>
                <ul className='text-sm text-muted-foreground space-y-2'>
                  <li>• Our team will review your report within 24 hours</li>
                  <li>• We may reach out for additional details</li>
                  <li>• Eligible issues may qualify for a refund or credit</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Button className='w-full h-12' onClick={handleSubmit} disabled={!selectedIssue || isSubmitting}>
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
                  Submit Report
                </>
              )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
