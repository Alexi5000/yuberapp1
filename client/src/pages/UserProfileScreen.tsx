'use client';

interface UserProfileScreenProps {
  userName?: string;
  userPhone?: string;
  userImage?: string;
  onPaymentMethods: () => void;
  onAddresses: () => void;
  onNotifications: () => void;
  onSupport: () => void;
  onLogout: () => void;
}

export default function UserProfileScreen({
  userName = 'Alex Doe',
  userPhone = '+1 555-019-2834',
  userImage,
  onPaymentMethods,
  onAddresses,
  onNotifications,
  onSupport,
  onLogout
}: UserProfileScreenProps) {
  return (
    <div className="w-full h-full bg-[#F6F9FC] rounded-[40px] overflow-hidden relative flex flex-col">
      <div className="p-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-[#0A2540]">Profile</h1>
      </div>
      
      <div className="bg-white mx-4 p-4 rounded-2xl shadow-card flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden">
          <img src={userImage || 'https://i.pravatar.cc/150?img=33'} className="w-full h-full object-cover" alt={userName} />
        </div>
        <div>
          <h2 className="font-bold text-[#0A2540]">{userName}</h2>
          <p className="text-xs text-[#64748B]">{userPhone}</p>
        </div>
        <button className="ml-auto text-[#FF4742] text-sm font-medium">Edit</button>
      </div>

      <div className="px-4 space-y-3">
        <button
          onClick={onPaymentMethods}
          className="w-full bg-white p-4 rounded-2xl shadow-card flex items-center justify-between text-[#0A2540] hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <iconify-icon icon="lucide:credit-card" className="text-gray-400" width="20"></iconify-icon>
            <span className="text-sm font-medium">Payment Methods</span>
          </div>
          <iconify-icon icon="lucide:chevron-right" className="text-gray-300" width="20"></iconify-icon>
        </button>
        <button
          onClick={onAddresses}
          className="w-full bg-white p-4 rounded-2xl shadow-card flex items-center justify-between text-[#0A2540] hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <iconify-icon icon="lucide:map-pin" className="text-gray-400" width="20"></iconify-icon>
            <span className="text-sm font-medium">Saved Addresses</span>
          </div>
          <iconify-icon icon="lucide:chevron-right" className="text-gray-300" width="20"></iconify-icon>
        </button>
        <button
          onClick={onNotifications}
          className="w-full bg-white p-4 rounded-2xl shadow-card flex items-center justify-between text-[#0A2540] hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <iconify-icon icon="lucide:bell" className="text-gray-400" width="20"></iconify-icon>
            <span className="text-sm font-medium">Notifications</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#FF4742]"></div>
        </button>
        <button
          onClick={onSupport}
          className="w-full bg-white p-4 rounded-2xl shadow-card flex items-center justify-between text-[#0A2540] hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <iconify-icon icon="lucide:help-circle" className="text-gray-400" width="20"></iconify-icon>
            <span className="text-sm font-medium">Support</span>
          </div>
          <iconify-icon icon="lucide:chevron-right" className="text-gray-300" width="20"></iconify-icon>
        </button>
      </div>
      
      <div className="mt-auto p-6">
        <button onClick={onLogout} className="w-full text-red-500 text-sm font-medium">
          Log Out
        </button>
      </div>
    </div>
  );
}

