// file: client/src/pages/ConversationHub.tsx
// description: Conversational hub screen with messaging and quick prompts
// reference: client/src/lib/trpc.ts, client/src/_core/hooks/useAuth.ts
'use client';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc';
import { AnimatePresence, motion } from 'framer-motion';
import { Car, Menu, Mic, Scissors, Send, UtensilsCrossed, Wrench, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  messageType?: string;
  createdAt?: Date;
}

interface ConversationHubProps {
  onMenuOpen: () => void;
  onSearchStart: (query: string) => void;
  conversationId?: number;
}

const suggestedPrompts = [
  { icon: Car, text: 'Find a car wash 🚗', query: 'Find me a car wash' },
  { icon: Wrench, text: 'I need a plumber 🔧', query: 'I need a plumber, my sink is leaking' },
  { icon: UtensilsCrossed, text: 'Best sushi nearby 🍣', query: 'Best sushi restaurant nearby' },
  { icon: Scissors, text: 'Book a haircut 💇', query: 'I want to book a haircut' }
];

export default function ConversationHub({ onMenuOpen, onSearchStart, conversationId: initialConversationId }: ConversationHubProps) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [conversationId, setConversationId] = useState<number | undefined>(initialConversationId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const stopRequestedRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create conversation mutation
  const createConversation = trpc.conversation.create.useMutation();

  // Send message mutation
  const sendMessage = trpc.conversation.sendMessage.useMutation();

  // Get messages query
  const { data: existingMessages } = trpc.conversation.getMessages.useQuery({ conversationId: conversationId! }, {
    enabled: !!conversationId
  });

  // Load existing messages
  useEffect(() => {
    if (existingMessages) {
      setMessages(existingMessages.map((m) => {
        const baseMessage: Message = { id: m.id, role: m.role as 'user' | 'assistant', content: m.content };
        const messageType = m.messageType;
        const createdAt = m.createdAt ? new Date(m.createdAt) : null;

        return { ...baseMessage, ...(messageType ? { messageType } : {}), ...(createdAt ? { createdAt } : {}) };
      }));
    }
  }, [existingMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Wire up browser speech recognition for mic button
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((result: SpeechRecognitionResult) => result[0]?.transcript ?? '')
        .join(' ');
      setInputValue(transcript);
    };

    recognition.onend = () => {
      if (stopRequestedRef.current) {
        stopRequestedRef.current = false;
        setIsListening(false);
        return;
      }
      // Keep mic open until user toggles it off
      try {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        }, 150);
      } catch {
        setIsListening(false);
      }
    };

    recognition.onerror = () => {
      stopRequestedRef.current = true;
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      try {
        recognition.stop();
      } catch {
        // ignore cleanup errors
      }
    };
  }, []);

  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      setSpeechSupported(false);
      return;
    }
    if (isListening) {
      stopRequestedRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    try {
      stopRequestedRef.current = false;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Speech recognition start failed', error);
      setSpeechSupported(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Check if this looks like a service request
    const serviceKeywords = ['plumb', 'electric', 'car wash', 'restaurant', 'hair', 'clean', 'fix', 'repair', 'find', 'need', 'book'];
    const isServiceRequest = serviceKeywords.some(kw => content.toLowerCase().includes(kw));

    // Add user message immediately
    const userMessage: Message = { id: Date.now(), role: 'user', content: content.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      let currentConversationId = conversationId;

      // Create conversation if needed
      if (!currentConversationId && isAuthenticated) {
        const newConversation = await createConversation.mutateAsync({ title: content.slice(0, 50) });
        if (newConversation) {
          currentConversationId = newConversation.id;
          setConversationId(currentConversationId);
        }
      }

      // If it's a service request, trigger the search radar
      if (isServiceRequest) {
        // Add a "searching" message
        const searchingMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: "I'm searching for the best options for you...",
          messageType: 'status'
        };
        setMessages(prev => [...prev, searchingMessage]);
        setIsTyping(false);

        // Trigger the search radar animation
        setTimeout(() => {
          onSearchStart(content);
        }, 1000);
        return;
      }

      if (!isAuthenticated) {
        const authMessage: Message = {
          id: Date.now() + 2,
          role: 'assistant',
          content: 'Sign in to chat with your AI agent and save the conversation.'
        };
        setMessages(prev => [...prev, authMessage]);
        return;
      }

      // Send message to AI
      if (currentConversationId) {
        const response = await sendMessage.mutateAsync({ conversationId: currentConversationId, content: content.trim() });

        if (response) {
          const aiMessageBase: Message = { id: response.id, role: 'assistant', content: response.content };
          const messageType = response.messageType;
          setMessages(prev => [...prev, messageType ? { ...aiMessageBase, messageType } : aiMessageBase]);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = (query: string) => {
    handleSendMessage(query);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b border-border'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 yuber-gradient rounded-lg flex items-center justify-center'>
            <Zap className='w-4 h-4 text-white' />
          </div>
          <span className='font-bold text-lg text-foreground'>YUBER</span>
        </div>
        <Button variant='ghost' size='icon' onClick={onMenuOpen}>
          <Menu className='w-5 h-5' />
        </Button>
      </div>

      {/* Chat Area */}
      <ScrollArea className='flex-1 p-4' ref={scrollRef}>
        <div className='max-w-2xl mx-auto'>
          <AnimatePresence mode='popLayout'>
            {/* Welcome Message */}
            {showWelcome && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className='mb-6'>
                <div className='chat-bubble chat-bubble-ai'>
                  <p className='text-base'>
                    Hey{user?.name ? ` ${user.name.split(' ')[0]}` : ''}! 👋 I'm your AI Agent for local services. What are you looking for
                    today?
                  </p>
                </div>
              </motion.div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} ${
                    message.messageType === 'status' ? 'italic text-muted-foreground' : ''
                  }`}>
                  <p className='text-base whitespace-pre-wrap'>{message.content}</p>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex justify-start mb-4'>
                <div className='chat-bubble chat-bubble-ai'>
                  <div className='flex gap-1'>
                    <span className='w-2 h-2 bg-muted-foreground/50 rounded-full typing-dot'></span>
                    <span className='w-2 h-2 bg-muted-foreground/50 rounded-full typing-dot'></span>
                    <span className='w-2 h-2 bg-muted-foreground/50 rounded-full typing-dot'></span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggested Prompts */}
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='flex flex-wrap gap-2 mt-4'>
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant='outline'
                  className='rounded-full text-sm h-9 px-4'
                  onClick={() => handlePromptClick(prompt.query)}>
                  {prompt.text}
                </Button>
              ))}
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className='border-t border-border p-4 bg-background'>
        <div className='max-w-2xl mx-auto flex gap-2'>
          <div className='flex-1 relative'>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }
              }}
              placeholder='Type your message...'
              className='pr-10 h-12 text-base rounded-full' />
            <Button
              variant='ghost'
              size='icon'
              className='absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              onClick={handleToggleMic}
              disabled={!speechSupported}>
              <Mic className={`w-5 h-5 ${isListening ? 'text-red-500' : ''}`} />
            </Button>
          </div>
          <Button
            size='icon'
            className='h-12 w-12 rounded-full'
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim()}>
            <Send className='w-5 h-5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
