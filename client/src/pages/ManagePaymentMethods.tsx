import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, Plus, Smartphone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ManagePaymentMethodsProps {
  onAddPayment: () => void;
  onBack: () => void;
}

export default function ManagePaymentMethods({ onAddPayment, onBack }: ManagePaymentMethodsProps) {
  const { data: paymentMethods, isLoading } = trpc.paymentMethod.list.useQuery();
  const deletePayment = trpc.paymentMethod.delete.useMutation();
  const utils = trpc.useUtils();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deletePayment.mutateAsync({ id });
      utils.paymentMethod.list.invalidate();
      toast.success('Payment method removed');
    } catch (error) {
      toast.error('Failed to remove payment method');
    } finally {
      setDeletingId(null);
    }
  };

  const getCardIcon = (cardType: string) => {
    // In a real app, you'd have proper card brand icons
    return CreditCard;
  };

  const getCardColor = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return 'from-blue-600 to-blue-800';
      case 'mastercard':
        return 'from-red-500 to-orange-500';
      case 'amex':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center'>
            <Button variant='ghost' size='icon' onClick={onBack} className='mr-3'>
              <ArrowLeft className='w-5 h-5' />
            </Button>
            <h1 className='text-xl font-semibold text-foreground'>Payment Methods</h1>
          </div>
          <Button size='sm' onClick={onAddPayment}>
            <Plus className='w-4 h-4 mr-1' />
            Add
          </Button>
        </div>
      </div>

      <div className='p-4 space-y-4'>
        {/* Digital Wallets */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3'>Digital Wallets</h3>
          <div className='grid grid-cols-2 gap-3'>
            <Card className='cursor-pointer hover:shadow-md transition-shadow'>
              <CardContent className='p-4 flex items-center gap-3'>
                <div className='w-10 h-10 bg-black rounded-lg flex items-center justify-center'>
                  <Smartphone className='w-5 h-5 text-white' />
                </div>
                <div>
                  <p className='font-medium text-foreground'>Apple Pay</p>
                  <p className='text-xs text-muted-foreground'>Set up</p>
                </div>
              </CardContent>
            </Card>
            <Card className='cursor-pointer hover:shadow-md transition-shadow'>
              <CardContent className='p-4 flex items-center gap-3'>
                <div className='w-10 h-10 bg-linear-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center'>
                  <span className='text-white font-bold text-sm'>G</span>
                </div>
                <div>
                  <p className='font-medium text-foreground'>Google Pay</p>
                  <p className='text-xs text-muted-foreground'>Set up</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Saved Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3'>Saved Cards</h3>

          {isLoading ?
            (
              <div className='space-y-3'>
                {[1, 2].map((i) => (
                  <Card key={i} className='animate-pulse'>
                    <CardContent className='p-4'>
                      <div className='h-16 bg-muted rounded' />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) :
            paymentMethods && paymentMethods.length > 0 ?
            (
              <AnimatePresence>
                <div className='space-y-3'>
                  {paymentMethods.map((method, index) => {
                    const CardIcon = getCardIcon(method.cardType);
                    return (
                      <motion.div
                        key={method.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}>
                        <Card className={`overflow-hidden ${method.isDefault ? 'ring-2 ring-primary' : ''}`}>
                          <div className={`h-2 bg-linear-to-r ${getCardColor(method.cardType)}`} />
                          <CardContent className='p-4'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-4'>
                                <div
                                  className={`w-12 h-8 bg-linear-to-r ${
                                    getCardColor(method.cardType)
                                  } rounded flex items-center justify-center`}>
                                  <CardIcon className='w-5 h-5 text-white' />
                                </div>
                                <div>
                                  <div className='flex items-center gap-2'>
                                    <p className='font-medium text-foreground capitalize'>{method.cardType}</p>
                                    {method.isDefault && (
                                      <span className='text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full'>Default</span>
                                    )}
                                  </div>
                                  <p className='text-sm text-muted-foreground'>
                                    •••• {method.lastFour} · Expires {method.expiryMonth}/{method.expiryYear}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='text-muted-foreground hover:text-destructive'
                                onClick={() => handleDelete(method.id)}
                                disabled={deletingId === method.id}>
                                {deletingId === method.id ?
                                  (
                                    <span className='w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin' />
                                  ) :
                                  <Trash2 className='w-4 h-4' />}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            ) :
            (
              <Card className='border-dashed'>
                <CardContent className='p-8 text-center'>
                  <CreditCard className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                  <h3 className='font-medium text-foreground mb-2'>No saved cards</h3>
                  <p className='text-sm text-muted-foreground mb-4'>Add a card for faster checkout</p>
                  <Button onClick={onAddPayment}>
                    <Plus className='w-4 h-4 mr-2' />
                    Add Card
                  </Button>
                </CardContent>
              </Card>
            )}
        </motion.div>

        {/* Security Note */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className='bg-muted/50'>
            <CardContent className='p-4'>
              <div className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-accent-foreground mt-0.5' />
                <div>
                  <p className='font-medium text-foreground text-sm'>Your payment info is secure</p>
                  <p className='text-xs text-muted-foreground'>
                    All transactions are encrypted and protected by industry-standard security.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
