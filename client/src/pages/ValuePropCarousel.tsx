// file: client/src/pages/ValuePropCarousel.tsx
// description: Onboarding value proposition carousel screen with CTA
// reference: client/src/pages/SplashScreen.tsx, client/src/App.tsx

import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ValuePropCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}

const slides = [{
  icon: MessageCircle,
  headline: "Talk, don't search.",
  body: 'Just ask for what you need in your own words. No more scrolling through endless listings.',
  color: 'bg-primary/10',
  iconColor: 'text-primary'
}, {
  icon: Sparkles,
  headline: 'Get the perfect match.',
  body: "Our AI finds the best pro for you and explains exactly why they're the right choice.",
  color: 'bg-accent',
  iconColor: 'text-accent-foreground'
}, {
  icon: Zap,
  headline: 'Book or dispatch instantly.',
  body: 'No phone calls, no waiting. Help is on the way in seconds.',
  color: 'bg-primary/10',
  iconColor: 'text-primary'
}];

export default function ValuePropCarousel({ onComplete, onSkip }: ValuePropCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev >= slides.length - 1) {
          return prev; // Stay on last slide
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
  };

  const currentSlideData = slides[currentSlide];
  if (!currentSlideData) {
    return null;
  }

  const isLastSlide = currentSlide === slides.length - 1;
  const CurrentIcon = currentSlideData.icon;

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Skip button */}
      <div className='flex justify-end p-4'>
        <Button variant='ghost' onClick={onSkip} className='text-muted-foreground'>Skip</Button>
      </div>

      {/* Slide content */}
      <div className='flex-1 flex flex-col items-center justify-center px-8'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className='flex flex-col items-center text-center'>
            {/* Icon */}
            <div className={`w-24 h-24 rounded-full ${currentSlideData.color} flex items-center justify-center mb-8`}>
              <CurrentIcon className={`w-12 h-12 ${currentSlideData.iconColor}`} />
            </div>

            {/* Headline */}
            <h2 className='text-2xl font-bold text-foreground mb-4'>{currentSlideData.headline}</h2>

            {/* Body */}
            <p className='text-muted-foreground text-lg max-w-sm'>{currentSlideData.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className='p-8 flex flex-col items-center gap-6'>
        {/* Pagination dots */}
        <div className='flex gap-2'>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-6 bg-primary' : 'bg-muted-foreground/30'
              }`} />
          ))}
        </div>

        {/* Get Started button (only on last slide) */}
        <AnimatePresence>
          {isLastSlide && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='w-full'>
              <Button onClick={onComplete} className='w-full h-14 text-lg font-semibold' size='lg'>Get Started</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
