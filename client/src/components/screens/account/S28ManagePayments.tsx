'use client';

import { Icon, Button } from '@/components/ui';

interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

interface S28Props {
  paymentMethods: PaymentMethod[];
  onAdd: () => void;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export default function S28ManagePayments({ paymentMethods, onAdd, onSetDefault, onDelete, onBack }: S28Props) {
  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Payment Methods</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="credit-card" size="xl" className="text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-6">No payment methods saved</p>
            <Button variant="primary" size="lg" fullWidth onClick={onAdd}>
              Add Payment Method
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="credit-card" size="md" className="text-gray-400" />
                      <div>
                        <p className="font-medium text-[#0A2540]">
                          {method.type === 'card' ? `${method.brand} •••• ${method.last4}` : method.type}
                        </p>
                        {method.isDefault && (
                          <span className="text-xs text-[#2ECC71]">Default</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => onSetDefault(method.id)}
                          className="text-xs text-[#0A2540] hover:text-[#0A2540]/80"
                        >
                          Set default
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(method.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="lg" fullWidth onClick={onAdd}>
              Add Payment Method
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

