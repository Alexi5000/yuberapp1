// file: client/src/pages/JobHistoryScreen.tsx
// description: Booking history list screen backed by tRPC booking.list
// reference: server/routers.ts (booking.list), drizzle/schema.ts (bookings)

'use client';

import { trpc } from '@/lib/trpc';

interface JobHistoryScreenProps {
  onBack: () => void;
  onJobSelect: (jobId: number) => void;
}

export default function JobHistoryScreen({ onBack, onJobSelect }: JobHistoryScreenProps) {
  const { data: bookings, isLoading } = trpc.booking.list.useQuery();

  return (
    <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative flex flex-col">
      <div className="p-6 pt-12 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-[#0A2540]">History</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-[#64748B] py-8">Loading...</div>
        ) : bookings && bookings.length > 0 ? (
          bookings.map((booking) => {
            const amount = booking.finalCost ?? booking.estimatedCostMax ?? booking.estimatedCostMin ?? 0;
            const durationMinutes = booking.durationMinutes ?? null;

            return (
              <div
                key={booking.id}
                onClick={() => onJobSelect(booking.id)}
                className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <span
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md tracking-wide ${
                      booking.status === 'completed'
                        ? 'bg-green-50 text-green-600'
                        : booking.status === 'cancelled'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
                    {booking.status}
                  </span>
                  <span className="text-sm font-bold text-[#0A2540]">
                    ${Number(amount).toFixed(2)}
                  </span>
                </div>
                <h3 className="font-semibold text-[#0A2540]">{booking.serviceType || 'Service'}</h3>
                <p className="text-xs text-[#64748B] mb-3">
                  {booking.createdAt
                    ? new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'N/A'}
                  {durationMinutes !== null && ` • ${durationMinutes}m`}
                </p>
                <div className="pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-500">Provider #{booking.providerId}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-[#64748B] py-8">No booking history</div>
        )}
      </div>
    </div>
  );
}

