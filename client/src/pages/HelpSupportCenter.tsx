import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, ChevronRight, CreditCard, ExternalLink, HelpCircle, Mail, MessageCircle, Phone, Search, Shield } from 'lucide-react';
import { useState } from 'react';

interface HelpSupportCenterProps {
  onBack: () => void;
}

const faqCategories = [{
  id: 'booking',
  icon: Calendar,
  title: 'Booking & Services',
  faqs: [{
    question: 'How do I book a service?',
    answer:
      "Simply tell our AI assistant what you need in natural language. For example, 'I need a plumber for a leaky faucet.' YUBER will find the best provider and guide you through the booking process."
  }, {
    question: 'Can I cancel or reschedule a booking?',
    answer:
      'Yes, you can cancel or reschedule up to 2 hours before your scheduled appointment without any fees. Go to your Booking History and select the booking you want to modify.'
  }, {
    question: "What if the provider doesn't show up?",
    answer:
      "If a provider doesn't arrive within 15 minutes of the scheduled time, you can cancel the booking for a full refund. Contact our support team for immediate assistance."
  }]
}, {
  id: 'payment',
  icon: CreditCard,
  title: 'Payments & Pricing',
  faqs: [{
    question: 'How am I charged for services?',
    answer:
      "You're charged after the service is completed. The final amount is based on the actual time spent and any materials used, within the estimated range provided before booking."
  }, {
    question: 'What payment methods are accepted?',
    answer:
      'We accept all major credit cards, debit cards, Apple Pay, and Google Pay. You can manage your payment methods in your Profile settings.'
  }, {
    question: 'How do tips work?',
    answer:
      'Tips are optional and 100% go to your service provider. You can add a tip during the rating process after your service is complete.'
  }]
}, {
  id: 'safety',
  icon: Shield,
  title: 'Safety & Trust',
  faqs: [{
    question: 'Are service providers verified?',
    answer:
      'Yes, all providers on YUBER undergo background checks, license verification, and must maintain a minimum rating to stay on the platform.'
  }, {
    question: 'What if I have an issue with a provider?',
    answer:
      'You can report any issues through the Problem Resolution Center accessible from your booking details. Our team reviews all reports within 24 hours.'
  }, {
    question: 'Is my payment information secure?',
    answer:
      'Absolutely. We use industry-standard encryption and never store your full card details. All transactions are processed through secure payment partners.'
  }]
}, {
  id: 'account',
  icon: HelpCircle,
  title: 'Account & App',
  faqs: [{
    question: 'How do I update my profile?',
    answer: "Go to Profile & Settings from the menu, then tap 'Edit Profile' to update your name, email, phone number, and default address."
  }, {
    question: 'How do referrals work?',
    answer:
      'Share your unique referral code with friends. When they complete their first booking, you both get $10 credit. Find your code in the Referral & Rewards section.'
  }, {
    question: 'How do I delete my account?',
    answer: 'Contact our support team to request account deletion. Please note this action is permanent and cannot be undone.'
  }]
}];

export default function HelpSupportCenter({ onBack }: HelpSupportCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = searchQuery ?
    faqCategories.flatMap(cat =>
      cat.faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(faq => ({ ...faq, category: cat.title }))
    ) :
    [];

  return (
    <div className='min-h-screen bg-background pb-8'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center p-4'>
          <Button variant='ghost' size='icon' onClick={onBack} className='mr-3'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <h1 className='text-xl font-semibold text-foreground'>Help & Support</h1>
        </div>
      </div>

      <div className='p-4 space-y-6'>
        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
            <Input
              placeholder='Search for help...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 h-12' />
          </div>
        </motion.div>

        {/* Search Results */}
        {searchQuery && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {filteredFaqs.length > 0 ?
              (
                <div className='space-y-3'>
                  <p className='text-sm text-muted-foreground'>{filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} found</p>
                  <Accordion type='single' collapsible>
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`search-${index}`}>
                        <AccordionTrigger className='text-left'>
                          <div>
                            <p className='font-medium'>{faq.question}</p>
                            <p className='text-xs text-muted-foreground'>{faq.category}</p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className='text-muted-foreground'>{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ) :
              (
                <Card className='bg-muted/50'>
                  <CardContent className='p-6 text-center'>
                    <HelpCircle className='w-10 h-10 text-muted-foreground mx-auto mb-3' />
                    <p className='text-muted-foreground'>No results found. Try a different search or contact support.</p>
                  </CardContent>
                </Card>
              )}
          </motion.div>
        )}

        {/* FAQ Categories */}
        {!searchQuery && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3'>Browse by Topic</h3>
              <div className='grid grid-cols-2 gap-3'>
                {faqCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card
                      key={category.id}
                      className='cursor-pointer hover:shadow-md transition-shadow'
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}>
                      <CardContent className='p-4'>
                        <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3'>
                          <Icon className='w-5 h-5 text-primary' />
                        </div>
                        <p className='font-medium text-foreground'>{category.title}</p>
                        <p className='text-xs text-muted-foreground'>{category.faqs.length} articles</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>

            {/* Selected Category FAQs */}
            {selectedCategory && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className='p-4'>
                    <Accordion type='single' collapsible>
                      {faqCategories.find(c => c.id === selectedCategory)?.faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`faq-${index}`}>
                          <AccordionTrigger className='text-left'>{faq.question}</AccordionTrigger>
                          <AccordionContent>
                            <p className='text-muted-foreground'>{faq.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}

        {/* Contact Options */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3'>Contact Us</h3>
          <Card>
            <CardContent className='p-0'>
              <button className='w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left'>
                <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                  <MessageCircle className='w-5 h-5 text-primary' />
                </div>
                <div className='flex-1'>
                  <p className='font-medium text-foreground'>Live Chat</p>
                  <p className='text-sm text-muted-foreground'>Available 24/7</p>
                </div>
                <ChevronRight className='w-5 h-5 text-muted-foreground' />
              </button>

              <div className='border-t border-border' />

              <button className='w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left'>
                <div className='w-10 h-10 bg-muted rounded-full flex items-center justify-center'>
                  <Mail className='w-5 h-5 text-muted-foreground' />
                </div>
                <div className='flex-1'>
                  <p className='font-medium text-foreground'>Email Support</p>
                  <p className='text-sm text-muted-foreground'>support@yuber.app</p>
                </div>
                <ExternalLink className='w-5 h-5 text-muted-foreground' />
              </button>

              <div className='border-t border-border' />

              <button className='w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left'>
                <div className='w-10 h-10 bg-muted rounded-full flex items-center justify-center'>
                  <Phone className='w-5 h-5 text-muted-foreground' />
                </div>
                <div className='flex-1'>
                  <p className='font-medium text-foreground'>Phone Support</p>
                  <p className='text-sm text-muted-foreground'>1-800-YUBER-00</p>
                </div>
                <ExternalLink className='w-5 h-5 text-muted-foreground' />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Legal Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className='flex justify-center gap-4 text-sm text-muted-foreground'>
            <button className='hover:text-foreground transition-colors'>Terms of Service</button>
            <span>•</span>
            <button className='hover:text-foreground transition-colors'>Privacy Policy</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
