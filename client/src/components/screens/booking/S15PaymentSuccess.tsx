'use client';

import { Icon, Button } from '@/components/ui';

interface S15Props {
  amount: number;
  serviceName: string;
  providerName: string;
  onContinue: () => void;
}

export default function S15PaymentSuccess({ amount, serviceName, providerName, onContinue }: S15Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#F7FAFC] p-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-sm w-full">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#2ECC71]">
          <Icon name="check-circle" size="xl" className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#0A2540] mb-2">Payment Successful!</h1>
        <p className="text-sm text-gray-600 mb-6">
          Your booking for {serviceName} with {providerName} has been confirmed.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
          <p className="text-2xl font-bold text-[#0A2540]">${amount.toFixed(2)}</p>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

