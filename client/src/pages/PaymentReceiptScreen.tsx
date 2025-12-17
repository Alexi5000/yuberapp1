'use client';

interface PaymentReceiptScreenProps {
  total: number;
  serviceTime: string;
  serviceFee: number;
  materials?: number;
  onDownload: () => void;
  onDone: () => void;
}

export default function PaymentReceiptScreen({
  total,
  serviceTime,
  serviceFee,
  materials = 0,
  onDownload,
  onDone
}: PaymentReceiptScreenProps) {
  return (
    <div className="w-full h-full bg-[#F6F9FC] rounded-[40px] overflow-hidden relative flex flex-col">
      <div className="p-6 pt-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
          <iconify-icon icon="lucide:check" width="32" stroke-width="3"></iconify-icon>
        </div>
        <h2 className="text-2xl font-bold text-[#0A2540] tracking-tight">Payment Success</h2>
        <p className="text-[#64748B] text-sm mt-1">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
      </div>

      <div className="bg-white mx-6 rounded-2xl p-6 shadow-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[radial-gradient(circle,transparent_4px,#fff_5px)] bg-[length:16px_8px] -mt-1 rotate-180"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-[radial-gradient(circle,transparent_4px,#fff_5px)] bg-[length:16px_8px] -mb-1"></div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Service Time ({serviceTime})</span>
            <span className="font-medium text-[#0A2540]">${(total - serviceFee - materials).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Service Fee</span>
            <span className="font-medium text-[#0A2540]">${serviceFee.toFixed(2)}</span>
          </div>
          {materials > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Materials</span>
              <span className="font-medium text-[#0A2540]">${materials.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
          <span className="font-bold text-[#0A2540]">Total Paid</span>
          <span className="text-xl font-bold text-[#0A2540]">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-6 mt-auto">
        <button
          onClick={onDownload}
          className="w-full border border-gray-300 text-[#0A2540] py-3 rounded-xl font-medium hover:bg-gray-50 mb-3">
          Download PDF
        </button>
        <button
          onClick={onDone}
          className="w-full bg-[#0A2540] text-white py-3 rounded-xl font-medium">
          Done
        </button>
      </div>
    </div>
  );
}

