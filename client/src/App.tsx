// file: client/src/App.tsx
// description: Client-only “phone UI” app that drives screen navigation and orchestrates API-backed flows
// reference: shared/lib/brand.ts, client/src/hooks/useScreenNavigation.ts, client/src/lib/trpc.ts

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SCREENS, type ScreenId } from '@shared/lib/brand';
import { PhoneFrame } from '@/components/shared';
import { useScreenNavigation } from '@/hooks/useScreenNavigation';
import type { Message, Provider, BookingDetails } from '@/lib/types';
import { generateId } from '@/lib/types';
import { trpc } from '@/lib/trpc';

// Import all screens
import {
  S01Splash,
  S02ValueCarousel,
  S03Permissions,
  S04Signup,
  S05ConversationHub,
  S07AISearchRadar,
  S09AIRecommendation,
  S10MultipleOptions,
  S11ProviderDetails,
  S12ConversationHistory,
  S13BookingConfirm,
  S14AddPayment,
  S15PaymentSuccess,
  S17LiveTracking,
  S18JobInProgress,
  S19JobComplete,
  S20ProblemResolution,
  S21RateReview,
  S22ShareExperience,
  S23ReferralRewards,
  S29NotificationSettings,
  S30HelpSupport,
} from '@/components/screens';
import FavoriteProviders from '@/pages/FavoriteProviders';
import BookingHistory from '@/pages/BookingHistory';
import ManagePaymentMethods from '@/pages/ManagePaymentMethods';
import NotificationSettings from '@/pages/NotificationSettings';
import RebookingPrompt from '@/pages/RebookingPrompt';
import ProfileSettings from '@/pages/ProfileSettings';
import HelpSupportCenter from '@/pages/HelpSupportCenter';

// Screen wrapper for animations
function ScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

function App() {
  const { screen, navigate } = useScreenNavigation(SCREENS.S01_SPLASH);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [currentBooking, setCurrentBooking] = useState<BookingDetails | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Provider[]>([]);
  const [user, setUser] = useState<any>(null);

  const utils = trpc.useUtils();
  const createBooking = trpc.booking.create.useMutation();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Store current query and service type for flow
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [currentServiceType, setCurrentServiceType] = useState<string>('Service');
  const [previousScreen, setPreviousScreen] = useState<ScreenId | null>(null); // For S11 back navigation
  const [needsClarification, setNeedsClarification] = useState<boolean>(false);
  const [clarificationQuestion, setClarificationQuestion] = useState<string>('');
  const [clarificationOptions, setClarificationOptions] = useState<string[]>([]);
  
  // Add state for quick replies on S05
  const [pendingQuickReplies, setPendingQuickReplies] = useState<string[]>([]);
  const [showRebookingPrompt, setShowRebookingPrompt] = useState(false);

  // Check onboarding status
  useEffect(() => {
    const completed = localStorage.getItem('yuber_onboarding_complete');
    if (completed === 'true') {
      navigate(SCREENS.S05_CONVERSATION_HUB);
      // Simulate rebooking prompt appearance - REMOVE THIS LINE FOR DEMO
      // setTimeout(() => setShowRebookingPrompt(true), 5000);
    }
  }, []);

  // Helper function to convert API provider to Provider type
  const convertToProvider = (provider: any, index: number = 0): Provider => {
    // Rating comes as integer (e.g., 45 for 4.5 stars) or as decimal
    const rating = provider.rating 
      ? (provider.rating > 10 ? provider.rating / 10 : provider.rating)
      : 0;
    
    return {
      id: provider.id?.toString() || `provider-${index}`,
      name: provider.name || 'Unknown Provider',
      photo: provider.imageUrl || provider.bannerUrl || '',
      rating: rating,
      reviewCount: provider.reviewCount || 0,
      distance: provider.distance || 0,
      eta: provider.availableIn || 0,
      hourlyRate: provider.hourlyRate || 0,
      callOutFee: provider.callOutFee || 0,
      specialties: provider.specialties?.split(',') || [provider.category || 'Service'],
      available: provider.isAvailable !== false,
      whyChosen: [
        index === 0 ? 'Highest-rated in your area' : 'Great option for you',
        provider.availableIn ? `Available in ${provider.availableIn} minutes` : 'Available now',
        provider.reviewCount ? `${provider.reviewCount} verified reviews` : 'Great reviews',
        provider.distance ? `Only ${provider.distance} miles away` : 'Nearby location',
      ],
      yelpId: provider.yelpId || null, // Preserve yelpId for fetching real data
    };
  };

  // Perform API search
  const performSearch = async (query: string): Promise<any[]> => {
    try {
      const results = await utils.provider.search.fetch({
        query: query,
        location: { lat: 37.7749, lng: -122.4194 }, // San Francisco coordinates
      });
      return results || [];
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  };

  // Handle message sending - ALL conversation stays on S05
  const handleSendMessage = async (content: string) => {
    // Store query and service type
    setCurrentQuery(content);
    const serviceType = extractServiceType(content);
    const serviceTypeLabel = serviceType || 'service';
    setCurrentServiceType(serviceTypeLabel.charAt(0).toUpperCase() + serviceTypeLabel.slice(1));

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Clear any pending quick replies
    setPendingQuickReplies([]);

    // Handle navigation via text commands (debug/demo)
    if (content.toLowerCase() === 'profile') {
      navigate(SCREENS.S26_PROFILE_SETTINGS);
      return;
    }

    // DON'T navigate away - stay on S05
    // Ensure we're on conversation hub
    if (screen !== SCREENS.S05_CONVERSATION_HUB) {
      navigate(SCREENS.S05_CONVERSATION_HUB);
    }

    // Create personalized conversation messages based on user's actual query
    const conversationMessages = createPersonalizedResponses(content);

    // Add messages with delays to create natural conversation flow
    conversationMessages.forEach((message, index) => {
      setTimeout(() => {
        const aiMessage: Message = {
          id: generateId(),
          role: 'ai',
          content: message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        
        // After the last message, navigate to search radar
        if (index === conversationMessages.length - 1) {
          setTimeout(() => {
            navigate(SCREENS.S07_AI_SEARCH_RADAR);
          }, 1500);
        }
      }, 1000 + (index * 2000)); // 1s, 3s, 5s delays
    });
  };

  // Helper to extract service type from user message
  const extractServiceType = (message: string): string | null => {
    const lower = message.toLowerCase();
    if (lower.includes('plumber') || lower.includes('plumbing')) return 'plumber';
    if (lower.includes('locksmith') || lower.includes('lock')) return 'locksmith';
    if (lower.includes('car wash') || lower.includes('carwash')) return 'car wash';
    if (lower.includes('haircut') || lower.includes('hair') || lower.includes('salon')) return 'haircut';
    if (lower.includes('electrician') || lower.includes('electric')) return 'electrician';
    if (lower.includes('clean') || lower.includes('cleaning')) return 'cleaning service';
    return null;
  };

  // Helper to extract the main search term from user message
  const extractSearchTerm = (message: string): string => {
    const lower = message.toLowerCase();
    
    // Remove common filler words and phrases
    let cleaned = lower
      .replace(/\b(near me|nearby|close to me|in my area|around here|around me|near|close)\b/g, '')
      .replace(/\b(i need|i want|i'm looking for|find me|looking for|need|want|get|find|search for|show me)\b/g, '')
      .replace(/\b(a|an|the|some|best|good|great|top|cheap|affordable|please|can you)\b/g, '')
      .trim();
    
    // Extract key phrases (2-3 words that make sense)
    const words = cleaned.split(/\s+/).filter(w => w.length > 2);
    
    // Look for common service patterns (2-word combinations)
    if (words.length >= 2) {
      // Try to find meaningful 2-word combinations
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        // Check if it's a meaningful phrase
        if (phrase.length > 5) {
          return phrase;
        }
      }
    }
    
    // Fall back to first meaningful word
    const firstWord = words.find(w => w.length > 3);
    return firstWord || cleaned || 'that';
  };

  // Helper to create personalized AI responses based on user query
  const createPersonalizedResponses = (userQuery: string): string[] => {
    const searchTerm = extractSearchTerm(userQuery);
    const lowerQuery = userQuery.toLowerCase();
    
    // Create natural, personalized responses
    const responses: string[] = [];
    
    // First message - acknowledge what they're looking for
    if (lowerQuery.includes('food') || lowerQuery.includes('restaurant') || lowerQuery.includes('cuisine') || lowerQuery.includes('chinese') || lowerQuery.includes('italian') || lowerQuery.includes('mexican') || lowerQuery.includes('japanese')) {
      responses.push(`${searchTerm} sounds amazing! Let me find the best options near you.`);
    } else if (lowerQuery.includes('need') || lowerQuery.includes('help') || lowerQuery.includes('emergency')) {
      responses.push(`I understand you need ${searchTerm}. Let me see what I can do.`);
    } else if (lowerQuery.includes('book') || lowerQuery.includes('appointment') || lowerQuery.includes('schedule')) {
      responses.push(`Looking to book ${searchTerm}? Let me find the best options for you.`);
    } else {
      responses.push(`Looking for ${searchTerm}? Great choice! Let me find the best options near you.`);
    }
    
    // Second message - show we're actively searching
    if (searchTerm.includes('food') || searchTerm.includes('restaurant') || searchTerm.includes('chinese') || searchTerm.includes('italian') || searchTerm.includes('mexican') || searchTerm.includes('japanese')) {
      responses.push(`Searching for ${searchTerm} restaurants in your area...`);
    } else if (searchTerm.includes('near') || searchTerm.includes('close')) {
      responses.push(`Finding the closest ${searchTerm.replace(/near|close/g, '').trim()} options...`);
    } else {
      responses.push(`Searching for ${searchTerm} in your area...`);
    }
    
    // Third message - show we're filtering
    responses.push(`Checking ratings, availability, and reviews nearby...`);
    
    return responses;
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleBook = () => {
    if (!selectedProvider) return;
    navigate(SCREENS.S13_BOOKING_CONFIRM);
  };

  const handleConfirmBooking = () => {
    navigate(SCREENS.S14_ADD_PAYMENT);
  };

  const handlePaymentComplete = () => {
    navigate(SCREENS.S15_PAYMENT_SUCCESS);
  };

  const handlePaymentSuccessContinue = () => {
    navigate(SCREENS.S17_LIVE_TRACKING);
  };

  const handleViewMap = () => {
    navigate(SCREENS.S17_LIVE_TRACKING);
  };

  const handleProviderArrived = () => {
    navigate(SCREENS.S19_JOB_COMPLETE);
  };

  const handleJobComplete = () => {
    if (!selectedProvider) return;
    navigate(SCREENS.S19_JOB_COMPLETE);
  };

  const handleRateComplete = () => {
    navigate(SCREENS.S22_SHARE_EXPERIENCE);
  };

  const renderScreen = () => {
    switch (screen) {
      // Onboarding
      case SCREENS.S01_SPLASH:
        return (
          <ScreenWrapper>
            <S01Splash onContinue={() => navigate(SCREENS.S02_VALUE_CAROUSEL)} />
          </ScreenWrapper>
        );
      case SCREENS.S02_VALUE_CAROUSEL:
        return (
          <ScreenWrapper>
            <S02ValueCarousel
              onComplete={() => navigate(SCREENS.S03_PERMISSIONS)}
              onSkip={() => navigate(SCREENS.S03_PERMISSIONS)}
            />
          </ScreenWrapper>
        );
      case SCREENS.S03_PERMISSIONS:
        return (
          <ScreenWrapper>
            <S03Permissions
              onComplete={() => navigate(SCREENS.S04_SIGNUP)}
            />
          </ScreenWrapper>
        );
      case SCREENS.S04_SIGNUP:
        return (
          <ScreenWrapper>
            <S04Signup
              onCreateAccount={() => {
                localStorage.setItem('yuber_onboarding_complete', 'true');
                navigate(SCREENS.S05_CONVERSATION_HUB);
              }}
              onSkip={() => {
                localStorage.setItem('yuber_onboarding_complete', 'true');
                navigate(SCREENS.S05_CONVERSATION_HUB);
              }}
            />
          </ScreenWrapper>
        );

      // Conversation
      case SCREENS.S05_CONVERSATION_HUB:
        return (
          <ScreenWrapper>
            <S05ConversationHub
              onNavigate={navigate}
              onSendMessage={handleSendMessage}
              messages={messages}
              quickReplies={pendingQuickReplies}
              onQuickReply={(reply) => {
                setPendingQuickReplies([]);
                handleSendMessage(reply);
              }}
            />
            {showRebookingPrompt && (
              <RebookingPrompt 
                serviceName="Cleaning" 
                lastProviderName="Maria" 
                lastDate="2 weeks ago"
                onRebook={() => {
                  setShowRebookingPrompt(false);
                  handleSendMessage("Book cleaning with Maria again");
                }}
                onDismiss={() => setShowRebookingPrompt(false)}
              />
            )}
          </ScreenWrapper>
        );
      case SCREENS.S07_AI_SEARCH_RADAR:
        return (
          <ScreenWrapper>
            <S07AISearchRadar
              query={currentQuery}
              onSearch={async (query: string) => {
                const results = await performSearch(query);
                // Store all results for S10 (Multiple Options)
                setSearchResults(results);
                return results;
              }}
              onComplete={(topResult) => {
                if (topResult) {
                  // Convert and set the top result
                  const topProvider = convertToProvider(topResult, 0);
                  setSelectedProvider(topProvider);
                  navigate(SCREENS.S09_AI_RECOMMENDATION);
                } else {
                  // If no provider found, show error message and go back
                  const errorMessage: Message = {
                    id: generateId(),
                    role: 'ai',
                    content: "I couldn't find any providers matching your request. Could you try rephrasing or being more specific?",
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, errorMessage]);
                  navigate(SCREENS.S05_CONVERSATION_HUB);
                }
              }}
            />
          </ScreenWrapper>
        );
      case SCREENS.S09_AI_RECOMMENDATION:
        return selectedProvider ? (
          <ScreenWrapper>
            <S09AIRecommendation
              provider={selectedProvider}
              onBook={handleBook}
              onSeeOthers={() => navigate(SCREENS.S10_MULTIPLE_OPTIONS)}
              onViewDetails={() => {
                setPreviousScreen(SCREENS.S09_AI_RECOMMENDATION);
                navigate(SCREENS.S11_PROVIDER_DETAILS);
              }}
              onBack={() => navigate(SCREENS.S05_CONVERSATION_HUB)}
            />
          </ScreenWrapper>
        ) : null;
      case SCREENS.S10_MULTIPLE_OPTIONS:
        // Convert search results to Provider format - NO MOCK DATA
        const multipleOptionsProviders = searchResults.length > 1
          ? searchResults.slice(1).map((result, idx) => convertToProvider(result, idx + 1))
          : [];
        
        return (
          <ScreenWrapper>
            <S10MultipleOptions
              providers={multipleOptionsProviders}
              onSelectProvider={(provider) => {
                setSelectedProvider(provider);
                setPreviousScreen(SCREENS.S10_MULTIPLE_OPTIONS);
                navigate(SCREENS.S11_PROVIDER_DETAILS);
              }}
              onBack={() => navigate(SCREENS.S09_AI_RECOMMENDATION)}
            />
          </ScreenWrapper>
        );
      case SCREENS.S11_PROVIDER_DETAILS:
        return selectedProvider ? (
          <ScreenWrapper>
            <S11ProviderDetails
              provider={selectedProvider}
              onBook={handleBook}
              onBack={() => {
                // Context-aware back navigation
                if (previousScreen === SCREENS.S10_MULTIPLE_OPTIONS) {
                  navigate(SCREENS.S10_MULTIPLE_OPTIONS);
                } else {
                  navigate(SCREENS.S09_AI_RECOMMENDATION);
                }
                setPreviousScreen(null);
              }}
            />
          </ScreenWrapper>
        ) : null;
      case SCREENS.S12_CONVERSATION_HISTORY:
        return (
          <ScreenWrapper>
            <S12ConversationHistory
              conversations={conversations}
              onOpen={(conv) => {
                setMessages(conv.messages);
                navigate(SCREENS.S05_CONVERSATION_HUB);
              }}
              onBack={() => navigate(SCREENS.S05_CONVERSATION_HUB)}
            />
          </ScreenWrapper>
        );

      // Booking
      case SCREENS.S13_BOOKING_CONFIRM:
        return selectedProvider ? (
          <ScreenWrapper>
            <S13BookingConfirm
              provider={selectedProvider}
              serviceType={currentServiceType}
              estimatedCost={{ min: selectedProvider.hourlyRate, max: selectedProvider.hourlyRate * 2 }}
              onConfirm={handleConfirmBooking}
              onCancel={() => navigate(SCREENS.S09_AI_RECOMMENDATION)}
              onBack={() => navigate(SCREENS.S11_PROVIDER_DETAILS)}
            />
          </ScreenWrapper>
        ) : null;
      case SCREENS.S14_ADD_PAYMENT:
        return (
          <ScreenWrapper>
            <S14AddPayment
              amount={selectedProvider ? selectedProvider.hourlyRate + 5 : 90}
              onPaymentComplete={handlePaymentComplete}
              onBack={() => navigate(SCREENS.S13_BOOKING_CONFIRM)}
            />
          </ScreenWrapper>
        );
      case SCREENS.S15_PAYMENT_SUCCESS:
        return (
          <ScreenWrapper>
            <S15PaymentSuccess
              amount={selectedProvider ? selectedProvider.hourlyRate + 5 : 90}
              serviceName={currentServiceType}
              providerName={selectedProvider?.name || 'Provider'}
              onContinue={handlePaymentSuccessContinue}
            />
          </ScreenWrapper>
        );
      case SCREENS.S17_LIVE_TRACKING:
        return selectedProvider ? (
          <ScreenWrapper>
            <S17LiveTracking
              provider={selectedProvider}
              onCall={() => {}}
              onMessage={() => {}}
              onArrived={handleProviderArrived}
            />
          </ScreenWrapper>
        ) : null;
      case SCREENS.S19_JOB_COMPLETE:
        return selectedProvider ? (
          <ScreenWrapper>
            <S19JobComplete
              provider={selectedProvider}
              serviceType={currentServiceType}
              duration="1h 15m"
              breakdown={{
                service: selectedProvider.hourlyRate * 1.25,
                parts: 25,
                tax: (selectedProvider.hourlyRate * 1.25 + 25) * 0.1,
                total: (selectedProvider.hourlyRate * 1.25 + 25) * 1.1,
              }}
              onRate={() => navigate(SCREENS.S21_RATE_REVIEW)}
              onDownloadReceipt={() => {}}
            />
          </ScreenWrapper>
        ) : null;
      case SCREENS.S20_PROBLEM_RESOLUTION:
        // Context-aware back navigation - go back to previous screen
        const getProblemResolutionBackScreen = (): ScreenId => {
          // Determine where to go back based on current context
          if (screen === SCREENS.S20_PROBLEM_RESOLUTION) {
            // Try to infer from previous screen or default to S05
            return previousScreen || SCREENS.S05_CONVERSATION_HUB;
          }
          return SCREENS.S05_CONVERSATION_HUB;
        };
        
        return (
          <ScreenWrapper>
            <S20ProblemResolution
              onSelectIssue={(issue) => {
                console.log('Issue reported:', issue);
                // Go back to previous screen after reporting issue
                navigate(getProblemResolutionBackScreen());
              }}
              onBack={() => navigate(getProblemResolutionBackScreen())}
            />
          </ScreenWrapper>
        );

      // Retention
      case SCREENS.S21_RATE_REVIEW:
        return selectedProvider ? (
          <ScreenWrapper>
            <S21RateReview
              provider={selectedProvider}
              onSubmit={handleRateComplete}
              onSkip={() => navigate(SCREENS.S22_SHARE_EXPERIENCE)}
            />
          </ScreenWrapper>
        ) : null;
      case SCREENS.S22_SHARE_EXPERIENCE:
        return selectedProvider ? (
          <ScreenWrapper>
            <S22ShareExperience
              providerName={selectedProvider.name}
              onShare={(platform) => {
                console.log('Share on:', platform);
                navigate(SCREENS.S23_REFERRAL_REWARDS);
              }}
              onSkip={() => navigate(SCREENS.S23_REFERRAL_REWARDS)}
            />
          </ScreenWrapper>
        ) : null;
      case SCREENS.S23_REFERRAL_REWARDS:
        return (
          <ScreenWrapper>
            <S23ReferralRewards
              referralCode="YUBER2024"
              onCopy={() => {}}
              onBack={() => navigate(SCREENS.S05_CONVERSATION_HUB)}
            />
          </ScreenWrapper>
        );

      // Account & Settings
      case SCREENS.S26_PROFILE_SETTINGS:
        return (
          <ScreenWrapper>
            <ProfileSettings
              onNavigate={navigate}
              onBack={() => navigate(SCREENS.S05_CONVERSATION_HUB)}
            />
          </ScreenWrapper>
        );
      case SCREENS.S24_FAVORITE_PROVIDERS:
        return (
          <ScreenWrapper>
            <FavoriteProviders
              onSelectProvider={(p) => {
                // Mock selection
                const provider = convertToProvider(p);
                setSelectedProvider(provider);
                navigate(SCREENS.S11_PROVIDER_DETAILS);
              }}
              onBookProvider={(p) => {
                 const provider = convertToProvider(p);
                 setSelectedProvider(provider);
                 navigate(SCREENS.S11_PROVIDER_DETAILS);
              }}
              onBack={() => navigate(SCREENS.S26_PROFILE_SETTINGS)}
            />
          </ScreenWrapper>
        );
      case SCREENS.S27_BOOKING_HISTORY:
        return (
          <ScreenWrapper>
            <BookingHistory
              onSelectBooking={() => {}}
              onRebook={() => {
                // Mock rebook
                navigate(SCREENS.S13_BOOKING_CONFIRM);
              }}
              onBack={() => navigate(SCREENS.S26_PROFILE_SETTINGS)}
            />
          </ScreenWrapper>
        );
      case SCREENS.S28_MANAGE_PAYMENTS:
        return (
          <ScreenWrapper>
            <ManagePaymentMethods
              onAddPayment={() => navigate(SCREENS.S14_ADD_PAYMENT)}
              onBack={() => navigate(SCREENS.S26_PROFILE_SETTINGS)}
            />
          </ScreenWrapper>
        );
      case SCREENS.S29_NOTIFICATION_SETTINGS:
        return (
          <ScreenWrapper>
            <S29NotificationSettings
              onBack={() => navigate(SCREENS.S26_PROFILE_SETTINGS)}
            />
          </ScreenWrapper>
        );
      case SCREENS.S30_HELP_SUPPORT:
        return (
          <ScreenWrapper>
            <S30HelpSupport
              onBack={() => navigate(SCREENS.S26_PROFILE_SETTINGS)}
            />
          </ScreenWrapper>
        );

      default:
        return (
          <ScreenWrapper>
            <S01Splash onContinue={() => navigate(SCREENS.S02_VALUE_CAROUSEL)} />
          </ScreenWrapper>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <PhoneFrame>
        <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>
      </PhoneFrame>
    </div>
  );
}

export default App;

