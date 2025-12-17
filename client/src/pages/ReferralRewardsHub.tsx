import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Copy, Gift, Share2, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ReferralRewardsHubProps {
  referralCode: string;
  referralCount: number;
  totalEarnings: number;
  pendingEarnings: number;
  onBack: () => void;
}

export default function ReferralRewardsHub(
  { referralCode, referralCount, totalEarnings, pendingEarnings, onBack }: ReferralRewardsHubProps
) {
  const [copied, setCopied] = useState(false);

  const referralLink = `https://yuber.app/invite/${referralCode}`;
  const nextMilestone = Math.ceil((referralCount + 1) / 5) * 5;
  const progress = ((referralCount % 5) / 5) * 100;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleShare = async () => {
    const message = `Get $10 off your first service on YUBER! Use my code: ${referralCode} or sign up here: ${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join YUBER', text: message, url: referralLink });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(message);
      toast.success('Share link copied!');
    }
  };

  const rewards = [
    { milestone: 5, reward: '$25 credit', achieved: referralCount >= 5 },
    { milestone: 10, reward: '$50 credit', achieved: referralCount >= 10 },
    { milestone: 25, reward: '$150 credit', achieved: referralCount >= 25 },
    { milestone: 50, reward: 'VIP Status', achieved: referralCount >= 50 }
  ];

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center p-4'>
          <Button variant='ghost' size='icon' onClick={onBack} className='mr-3'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <h1 className='text-xl font-semibold text-foreground'>Referral & Rewards</h1>
        </div>
      </div>

      <div className='p-4 space-y-6'>
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-linear-to-br from-primary to-primary/80 rounded-2xl p-6 text-white'>
          <div className='flex items-center gap-2 mb-4'>
            <Gift className='w-6 h-6' />
            <span className='font-medium'>Your Referral Rewards</span>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-white/70 text-sm'>Total Earned</p>
              <p className='text-3xl font-bold'>${totalEarnings}</p>
            </div>
            <div>
              <p className='text-white/70 text-sm'>Friends Referred</p>
              <p className='text-3xl font-bold'>{referralCount}</p>
            </div>
          </div>

          {pendingEarnings > 0 && (
            <div className='mt-4 pt-4 border-t border-white/20'>
              <p className='text-white/70 text-sm'>Pending Earnings</p>
              <p className='text-xl font-semibold'>${pendingEarnings}</p>
            </div>
          )}
        </motion.div>

        {/* Referral Code */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className='p-4'>
              <h3 className='font-medium text-foreground mb-3'>Your Referral Code</h3>
              <div className='flex gap-2'>
                <div className='flex-1 relative'>
                  <Input value={referralCode} readOnly className='text-center font-mono text-lg font-bold tracking-wider' />
                </div>
                <Button variant='outline' onClick={handleCopyCode}>
                  {copied ? <Check className='w-5 h-5 text-green-600' /> : <Copy className='w-5 h-5' />}
                </Button>
                <Button onClick={handleShare}>
                  <Share2 className='w-5 h-5' />
                </Button>
              </div>
              <p className='text-sm text-muted-foreground mt-3 text-center'>
                Share your code and earn <span className='font-semibold text-primary'>$10</span> for each friend who books!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress to Next Milestone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='font-medium text-foreground'>Next Milestone</h3>
                <span className='text-sm text-muted-foreground'>{referralCount} / {nextMilestone} referrals</span>
              </div>
              <Progress value={progress} className='h-2 mb-3' />
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Trophy className='w-4 h-4 text-yellow-500' />
                <span>{nextMilestone - referralCount} more referrals to unlock bonus rewards!</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reward Tiers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className='font-medium text-foreground mb-3'>Reward Milestones</h3>
          <div className='space-y-3'>
            {rewards.map((reward, index) => (
              <Card key={reward.milestone} className={reward.achieved ? 'border-accent bg-accent/10' : ''}>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${reward.achieved ? 'bg-accent' : 'bg-muted'}`}>
                      {reward.achieved ?
                        <Check className='w-6 h-6 text-accent-foreground' /> :
                        <Users className='w-6 h-6 text-muted-foreground' />}
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium text-foreground'>{reward.milestone} Referrals</p>
                      <p className='text-sm text-muted-foreground'>{reward.reward}</p>
                    </div>
                    {reward.achieved && (
                      <span className='text-xs font-medium text-accent-foreground bg-accent px-2 py-1 rounded-full'>Unlocked</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className='bg-muted/50'>
            <CardContent className='p-4'>
              <h3 className='font-medium text-foreground mb-3'>How It Works</h3>
              <ol className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex gap-2'>
                  <span className='font-bold text-primary'>1.</span>
                  Share your unique referral code with friends
                </li>
                <li className='flex gap-2'>
                  <span className='font-bold text-primary'>2.</span>
                  They get $10 off their first booking
                </li>
                <li className='flex gap-2'>
                  <span className='font-bold text-primary'>3.</span>
                  You earn $10 credit when they complete a booking
                </li>
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
