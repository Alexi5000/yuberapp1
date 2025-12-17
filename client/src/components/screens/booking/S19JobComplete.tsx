'use client';

import type { Provider } from '@/lib/types';
import { Icon, Button } from '@/components/ui';

interface S19Props {
  provider: Provider;
  serviceType: string;
  duration: string;
  breakdown: { service: number; parts: number; tax: number; total: number };
  onRate: () => void;
  onDownloadReceipt: () => void;
}

export default function S19JobComplete({ provider, serviceType, duration, breakdown, onRate, onDownloadReceipt }: S19Props) {
  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#2ECC71]">
            <Icon name="check-circle" size="xl" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] mb-2">Job Complete!</h1>
          <p className="text-sm text-gray-600">{serviceType} completed successfully</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">BREAKDOWN</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service ({duration})</span>
              <span className="font-medium text-[#0A2540]">${breakdown.service.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Parts/Materials</span>
              <span className="font-medium text-[#0A2540]">${breakdown.parts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium text-[#0A2540]">${breakdown.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="font-bold text-[#0A2540]">Total</span>
                <span className="text-xl font-bold text-[#0A2540]">${breakdown.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white space-y-3">
        <Button variant="primary" size="lg" fullWidth onClick={onRate}>
          Rate & Review
        </Button>
        <button onClick={onDownloadReceipt} className="w-full py-2 text-sm text-gray-500 hover:text-[#0A2540]">
          Download Receipt
        </button>
      </div>
    </div>
  );
}

