'use client';

import { Icon } from '@/components/ui';

interface Booking {
  id: string;
  providerName: string;
  serviceType: string;
  date: string;
  status: string;
  amount: number;
}

interface S27Props {
  bookings: Booking[];
  onSelect: (booking: Booking) => void;
  onBack: () => void;
}

export default function S27BookingHistory({ bookings, onSelect, onBack }: S27Props) {
  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Booking History</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="clock" size="xl" className="text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No bookings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => onSelect(booking)}
                className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#0A2540]">{booking.providerName}</h3>
                  <span className="text-sm font-bold text-[#0A2540]">${booking.amount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{booking.serviceType}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{booking.date}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{booking.status}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

