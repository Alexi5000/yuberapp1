// file: client/src/pages/AISearchRadar.tsx
// description: Animated radar flow that simulates AI provider search
// reference: client/src/App.tsx, client/src/lib/trpc.ts

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Filter, MapPin, Search, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

interface ProviderOption {
  id: number;
  yelpId?: string | null;
  source?: 'yelp' | 'internal';
  name: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  hourlyRate?: number | null;
  callOutFee?: number | null;
  address?: string | null;
  isAvailable?: boolean | null;
  availableIn?: number | null;
  specialties?: string | null;
  ecoFriendly?: boolean | null;
  bannerUrl?: string | null;
  phone?: string | null;
  website?: string | null;
  distance?: number | null;
  servicesOffered?: string[] | null;
}

interface AISearchRadarProps {
  query: string;
  onComplete: (provider: ProviderOption) => void;
  onSkip: () => void;
}

type SearchStep = { text: string, icon: typeof Search };

const buildSearchSteps = (count: number, query: string): SearchStep[] => {
  const label = query ? `"${query}"` : 'your request';
  const foundLabel = count > 0 ? `Found ${count} providers` : 'Searching nearby providers';
  return [
    { text: `Scanning for ${label} near you...`, icon: Search },
    { text: foundLabel, icon: MapPin },
    { text: 'Filtering by rating and availability...', icon: Filter },
    { text: 'Analyzing reviews and specialties...', icon: Star },
    { text: 'Selecting the best match for you...', icon: Check }
  ];
};

export default function AISearchRadar({ query, onComplete, onSkip }: AISearchRadarProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState<{ id: number, x: number, y: number, delay: number, fading: boolean }[]>([]);
  const [deviceLocation, setDeviceLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [searchComplete, setSearchComplete] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const completionFiredRef = useRef(false);

  const locationAllowed = user?.locationEnabled !== false;

  useEffect(() => {
    if (!locationAllowed) return;
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => setDeviceLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setDeviceLocation(null),
      { enableHighAccuracy: true, maximumAge: 60_000 }
    );
  }, [locationAllowed]);

  const { data: providers, isLoading } = trpc.provider.search.useQuery({ query, location: deviceLocation ?? undefined });

  const topProvider = useMemo<ProviderOption | null>(() => {
    if (providers && providers.length > 0) return providers[0] as ProviderOption;
    return null;
  }, [providers]);

  const steps = useMemo<SearchStep[]>(() => buildSearchSteps(providers?.length ?? 0, query), [providers?.length, query]);

  // Generate random dots for the radar
  useEffect(() => {
    const newDots = Array.from(
      { length: 12 },
      (_, i) => ({ id: i, x: Math.random() * 200 - 100, y: Math.random() * 200 - 100, delay: Math.random() * 0.5, fading: false })
    );
    setDots(newDots);
  }, []);

  // Progress through search steps
  useEffect(() => {
    setCurrentStep(0);
    setSearchComplete(false);
    setNoResults(false);
    completionFiredRef.current = false;
  }, [query, steps.length]);

  useEffect(() => {
    const stepDuration = 800;
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(() => setSearchComplete(true), 500);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    // Fade out dots as we filter
    const fadeTimer = setTimeout(() => {
      setDots(prev =>
        prev.map((dot, i) => ({
          ...dot,
          fading: i > 2 // Keep only 3 dots visible
        }))
      );
    }, stepDuration * 2);

    return () => {
      clearInterval(timer);
      clearTimeout(fadeTimer);
    };
  }, [steps.length]);

  useEffect(() => {
    if (!searchComplete || completionFiredRef.current) return;

    if (topProvider) {
      completionFiredRef.current = true;
      setNoResults(false);
      onComplete(topProvider);
      return;
    }

    if (!isLoading) {
      setNoResults(true);
    }
  }, [isLoading, onComplete, searchComplete, topProvider]);

  const fallbackStep = steps[steps.length - 1]!;
  const currentStepData = steps[currentStep] ?? fallbackStep;
  const CurrentIcon = currentStepData.icon;

  return (
    <motion.div
      className='min-h-screen bg-background flex flex-col items-center justify-center p-6'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onSkip}>
      {/* Radar Container */}
      <div className='relative w-72 h-72 mb-12'>
        {/* Radar Circles */}
        <div className='absolute inset-0 flex items-center justify-center'>
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className='absolute rounded-full border border-primary/20'
              style={{ width: `${ring * 33}%`, height: `${ring * 33}%` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: ring * 0.1 }} />
          ))}
        </div>

        {/* Radar Pulse */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <motion.div
            className='w-16 h-16 rounded-full bg-primary/30'
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} />
          <motion.div
            className='absolute w-16 h-16 rounded-full bg-primary/30'
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }} />
          <motion.div
            className='absolute w-16 h-16 rounded-full bg-primary/30'
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }} />
        </div>

        {/* Center Pin (User Location) */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <motion.div
            className='w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg z-10'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}>
            <MapPin className='w-6 h-6 text-white' />
          </motion.div>
        </div>

        {/* Provider Dots */}
        <AnimatePresence>
          {dots.map((dot) => (
            <motion.div
              key={dot.id}
              className={`absolute w-3 h-3 rounded-full ${dot.fading ? 'bg-muted-foreground/30' : 'bg-primary'}`}
              style={{ left: `calc(50% + ${dot.x}px)`, top: `calc(50% + ${dot.y}px)` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: dot.fading ? 0.5 : 1, opacity: dot.fading ? 0.3 : 1 }}
              transition={{ delay: dot.delay + 0.5, duration: 0.3 }} />
          ))}
        </AnimatePresence>

        {/* Selected Provider (appears at the end) */}
        {currentStep >= steps.length - 1 && (
          <motion.div
            className='absolute w-6 h-6 bg-primary rounded-full shadow-lg'
            style={{ left: `calc(50% + ${dots[0]?.x || 30}px)`, top: `calc(50% + ${dots[0]?.y || -40}px)` }}
            initial={{ scale: 1 }}
            animate={{
              scale: [1, 1.5, 1.2],
              boxShadow: ['0 0 0 0 rgba(255,107,107,0.4)', '0 0 0 20px rgba(255,107,107,0)', '0 0 0 0 rgba(255,107,107,0)']
            }}
            transition={{ duration: 0.8 }} />
        )}
      </div>

      {/* Status Text */}
      <div className='text-center'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='flex items-center justify-center gap-2 text-foreground'>
            <CurrentIcon className='w-5 h-5 text-primary' />
            <span className='text-lg'>{currentStepData.text}</span>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className='flex justify-center gap-1 mt-6'>
          {steps.map((_step, index: number) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${index <= currentStep ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {noResults && (
          <p className='mt-6 text-sm text-destructive'>
            We could not find providers for this request. Try refining your query or enabling location access.
          </p>
        )}
      </div>

      {/* Skip hint */}
      <motion.p
        className='absolute bottom-8 text-muted-foreground text-sm'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}>
        Tap anywhere to skip
      </motion.p>
    </motion.div>
  );
}
