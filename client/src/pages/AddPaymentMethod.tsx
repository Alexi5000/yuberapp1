// file: client/src/pages/AddPaymentMethod.tsx
// description: Add payment form handling card entry, validation, and mock submission
// reference: client/src/App.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { motion } from 'framer-motion';
import { Apple, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { useState } from 'react';

interface AddPaymentMethodProps {
  amount: number;
  onSuccess: (lastFour: string) => void;
  onBack: () => void;
}

export default function AddPaymentMethod({ amount, onSuccess, onBack }: AddPaymentMethodProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardType, setCardType] = useState<string>('');

  const addPaymentMethod = trpc.paymentMethod.add.useMutation();

  // Detect card type from number
  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    return '';
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
    setCardType(detectCardType(formatted));
  };

  const handleSubmit = async () => {
    setIsProcessing(true);

    try {
      // Parse expiry date
      const [month = '', year = ''] = expiryDate.split('/');
      const expiryMonth = parseInt(month || '0', 10);
      const expiryYear = 2000 + parseInt(year || '0', 10);

      // Get last 4 digits
      const lastFour = cardNumber.replace(/\s/g, '').slice(-4);

      if (saveCard) {
        await addPaymentMethod.mutateAsync({ cardType: cardType || 'visa', lastFour, expiryMonth, expiryYear, isDefault: true });
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      onSuccess(lastFour);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = cardNumber.length >= 18 && expiryDate.length === 5 && cvc.length >= 3;

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center p-4'>
          <Button variant='ghost' size='icon' onClick={onBack} className='mr-3'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <h1 className='text-xl font-semibold text-foreground'>Add Payment Method</h1>
        </div>
      </div>

      <div className='p-4 space-y-4'>
        <p className='text-muted-foreground text-center'>Secure payment to complete your booking</p>

        {/* Apple Pay / Google Pay */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='space-y-3'>
          <Button variant='outline' className='w-full h-14 text-base font-medium bg-black text-white hover:bg-black/90 hover:text-white'>
            <Apple className='w-5 h-5 mr-2' />
            Pay with Apple Pay
          </Button>

          <Button variant='outline' className='w-full h-14 text-base font-medium'>
            <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
              <path
                fill='currentColor'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
              <path
                fill='currentColor'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
              <path
                fill='currentColor'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
            </svg>
            Pay with Google Pay
          </Button>
        </motion.div>

        {/* Divider */}
        <div className='relative py-4'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-border'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-background text-muted-foreground'>or pay with card</span>
          </div>
        </div>

        {/* Card Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className='p-4 space-y-4'>
              {/* Card Number */}
              <div className='space-y-2'>
                <Label htmlFor='cardNumber'>Card Number</Label>
                <div className='relative'>
                  <Input
                    id='cardNumber'
                    placeholder='1234 5678 9012 3456'
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    className='pr-12' />
                  <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                    {cardType === 'visa' && <span className='text-blue-600 font-bold text-sm'>VISA</span>}
                    {cardType === 'mastercard' && <span className='text-orange-600 font-bold text-sm'>MC</span>}
                    {cardType === 'amex' && <span className='text-blue-800 font-bold text-sm'>AMEX</span>}
                    {!cardType && <CreditCard className='w-5 h-5 text-muted-foreground' />}
                  </div>
                </div>
              </div>

              {/* Expiry and CVC */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='expiry'>Expiry Date</Label>
                  <Input
                    id='expiry'
                    placeholder='MM/YY'
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5} />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='cvc'>CVC</Label>
                  <Input
                    id='cvc'
                    placeholder='123'
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    type='password' />
                </div>
              </div>

              {/* Save Card Checkbox */}
              <div className='flex items-center space-x-2'>
                <Checkbox id='saveCard' checked={saveCard} onCheckedChange={(checked) => setSaveCard(checked as boolean)} />
                <Label htmlFor='saveCard' className='text-sm text-muted-foreground cursor-pointer'>
                  Save this card for future bookings
                </Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Badge */}
        <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
          <Lock className='w-4 h-4' />
          <span>Secured by 256-bit encryption</span>
        </div>

        {/* Pay Button */}
        <Button className='w-full h-14 text-lg font-semibold' onClick={handleSubmit} disabled={!isFormValid || isProcessing}>
          {isProcessing ?
            (
              <span className='flex items-center gap-2'>
                <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                Processing...
              </span>
            ) :
            (`Pay $${amount.toFixed(2)}`)}
        </Button>
      </div>
    </div>
  );
}
