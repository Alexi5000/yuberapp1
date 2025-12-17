import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MessageCircle, Plus } from 'lucide-react';

interface ConversationHistoryProps {
  onSelectConversation: (conversationId: number) => void;
  onNewConversation: () => void;
  onBack: () => void;
}

export default function ConversationHistory({ onSelectConversation, onNewConversation, onBack }: ConversationHistoryProps) {
  const { data: conversations, isLoading } = trpc.conversation.list.useQuery();

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-border'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={onBack}>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <h1 className='text-xl font-semibold text-foreground'>Your Conversations</h1>
        </div>
        <Button size='icon' onClick={onNewConversation}>
          <Plus className='w-5 h-5' />
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className='flex-1'>
        <div className='p-4 space-y-3'>
          {isLoading ?
            (
              <div className='space-y-3'>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className='animate-pulse'>
                    <CardContent className='p-4'>
                      <div className='h-4 bg-muted rounded w-3/4 mb-2' />
                      <div className='h-3 bg-muted rounded w-1/2' />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) :
            conversations && conversations.length > 0 ?
            (conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}>
                <Card className='cursor-pointer hover:shadow-md transition-shadow' onClick={() => onSelectConversation(conversation.id)}>
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0'>
                        <MessageCircle className='w-5 h-5 text-primary' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-medium text-foreground truncate'>{conversation.title || 'New conversation'}</h3>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground mt-1'>
                          <Clock className='w-3.5 h-3.5' />
                          <span>{formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}</span>
                          {conversation.serviceType && (
                            <>
                              <span>•</span>
                              <span className='capitalize'>{conversation.serviceType}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          conversation.status === 'active' ?
                            'bg-accent/50 text-accent-foreground' :
                            conversation.status === 'completed' ?
                            'bg-green-100 text-green-700' :
                            'bg-muted text-muted-foreground'
                        }`}>
                        {conversation.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))) :
            (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4'>
                  <MessageCircle className='w-8 h-8 text-muted-foreground' />
                </div>
                <h3 className='text-lg font-medium text-foreground mb-2'>No conversations yet</h3>
                <p className='text-muted-foreground mb-6'>Start a new conversation to find local services</p>
                <Button onClick={onNewConversation}>
                  <Plus className='w-4 h-4 mr-2' />
                  Start New Conversation
                </Button>
              </div>
            )}
        </div>
      </ScrollArea>
    </div>
  );
}
