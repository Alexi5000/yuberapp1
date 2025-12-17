'use client';

interface JobTrackingScreenProps {
  providerName: string;
  providerImage?: string;
  eta: string;
  vehicleInfo?: string;
  onMessage: () => void;
  onCall: () => void;
}

export default function JobTrackingScreen({ providerName, providerImage, eta, vehicleInfo, onMessage, onCall }: JobTrackingScreenProps) {
  return (
    <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative flex flex-col">
      {/* Map */}
      <div className="flex-1 bg-gray-100 relative">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: `url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E')`}}></div>
        {/* Route */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M160 150 Q 200 250 160 400" stroke="#0A2540" strokeWidth="4" fill="none" strokeLinecap="round"></path>
        </svg>
        {/* Car Icon */}
        <div className="absolute top-[250px] left-[180px] w-8 h-8 bg-[#FF4742] text-white rounded-full flex items-center justify-center shadow-lg transform rotate-12 z-10">
          <iconify-icon icon="lucide:truck" width="14"></iconify-icon>
        </div>
        {/* Home Pin */}
        <div className="absolute top-[400px] left-[160px] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#0A2540] border-2 border-white rounded-full shadow-lg"></div>
      </div>

      {/* Status Card */}
      <div className="bg-white p-6 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] relative z-20">
        <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-4"></div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#0A2540]">Arriving in {eta}</h3>
            <p className="text-xs text-[#64748B]">{vehicleInfo || 'White Ford Transit • NYC 1234'}</p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100">
            <img src={providerImage || 'https://i.pravatar.cc/150?img=11'} className="w-full h-full object-cover" alt={providerName} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onMessage} className="bg-gray-50 text-[#0A2540] py-3 rounded-xl font-medium text-sm hover:bg-gray-100">
            Message
          </button>
          <button onClick={onCall} className="bg-[#0A2540] text-white py-3 rounded-xl font-medium text-sm">
            Call
          </button>
        </div>
      </div>
    </div>
  );
}

