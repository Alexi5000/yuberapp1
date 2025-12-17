// file: client/src/pages/ShareExperience.tsx
// description: Share experience screen with social share actions and copy link
// reference: client/src/pages/RateAndReview.tsx, client/src/components/ui/button.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Check, Copy, MessageCircle, Share2, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import type React from 'react';
import { siMeta, siX } from 'simple-icons';
import { toast } from 'sonner';

type SimpleIconData = { title: string, path: string };

function createSimpleIcon(icon: SimpleIconData) {
  const Icon = ({ className }: { className?: string }) => (
    <svg
      role='img'
      aria-label={icon.title}
      viewBox='0 0 24 24'
      className={className}
      fill='currentColor'
      xmlns='http://www.w3.org/2000/svg'>
      <path d={icon.path} />
    </svg>
  );

  Icon.displayName = `${icon.title}Icon`;
  return Icon;
}

interface Provider {
  id: number;
  name: string;
  imageUrl?: string | null;
}

interface ShareExperienceProps {
  provider: Provider;
  rating: number;
  serviceName: string;
  onShare: (platform: string) => void;
  onSkip: () => void;
}

export default function ShareExperience({ provider, rating, serviceName, onShare, onSkip }: ShareExperienceProps) {
  const [copied, setCopied] = useState(false);
  const XIcon = useMemo(() => createSimpleIcon(siX), []);
  const MetaIcon = useMemo(() => createSimpleIcon(siMeta), []);

  const shareMessage =
    `Just had an amazing experience with ${provider.name} on YUBER! ⭐️ ${rating}/5 for ${serviceName}. Try YUBER for all your local service needs!`;
  const shareUrl = `https://yuber.app/provider/${provider.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMessage}\n\n${shareUrl}`);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${provider.name} on YUBER`, text: shareMessage, url: shareUrl });
        onShare('native');
      } catch (error) {
        // User cancelled or error
      }
    }
  };

  const socialPlatforms = [{
    name: 'Messages',
    icon: MessageCircle,
    color: 'bg-green-500',
    action: () => {
      window.open(`sms:?body=${encodeURIComponent(shareMessage + '\n\n' + shareUrl)}`);
      onShare('sms');
    }
  }, {
    name: 'X',
    icon: XIcon,
    color: 'bg-sky-500',
    action: () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`);
      onShare('twitter');
    }
  }, {
    name: 'Meta',
    icon: MetaIcon,
    color: 'bg-blue-600',
    action: () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`);
      onShare('facebook');
    }
  }];

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <div className='flex-1 flex flex-col items-center justify-center p-6'>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='text-center mb-8'>
          <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Share2 className='w-8 h-8 text-primary' />
          </div>
          <h1 className='text-2xl font-bold text-foreground mb-2'>Share Your Experience</h1>
          <p className='text-muted-foreground'>Help others discover great service providers</p>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='w-full max-w-sm mb-8'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3 mb-3'>
                <Avatar className='w-12 h-12'>
                  <AvatarImage src={provider.imageUrl || undefined} />
                  <AvatarFallback className='bg-primary text-primary-foreground'>
                    {provider.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='font-semibold text-foreground'>{provider.name}</h3>
                  <div className='flex items-center gap-1'>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className='text-sm text-muted-foreground'>"{serviceName}" - Excellent service! Highly recommend.</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Share Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='w-full max-w-sm space-y-4'>
          {/* Native Share (if available) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button className='w-full h-12' onClick={handleNativeShare}>
              <Share2 className='w-5 h-5 mr-2' />
              Share
            </Button>
          )}

          {/* Social Platforms */}
          <div className='flex justify-center gap-4'>
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon as React.ComponentType<{ className?: string }>;
              return (
                <button
                  key={platform.name}
                  onClick={platform.action}
                  className={`w-14 h-14 ${platform.color} rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity`}>
                  <Icon className='w-6 h-6' />
                </button>
              );
            })}
          </div>

          {/* Copy Link */}
          <Button variant='outline' className='w-full h-12' onClick={handleCopyLink}>
            {copied ?
              (
                <>
                  <Check className='w-5 h-5 mr-2 text-green-600' />
                  Copied!
                </>
              ) :
              (
                <>
                  <Copy className='w-5 h-5 mr-2' />
                  Copy Link
                </>
              )}
          </Button>
        </motion.div>
      </div>

      {/* Skip Button */}
      <div className='p-6'>
        <Button variant='ghost' className='w-full' onClick={onSkip}>Maybe Later</Button>
      </div>
    </div>
  );
}
