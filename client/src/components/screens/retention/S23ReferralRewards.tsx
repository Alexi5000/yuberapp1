'use client';

import { Icon, Button } from '@/components/ui';

interface S23Props {
  referralCode: string;
  onCopy: () => void;
  onBack: () => void;
}

export default function S23ReferralRewards({ referralCode, onCopy, onBack }: S23Props) {
  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Referrals & Rewards</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF4742]/10">
            <Icon name="gift" size="xl" className="text-[#FF4742]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0A2540] mb-2">Invite Friends</h2>
          <p className="text-sm text-gray-600">Get $10 credit for each friend you refer!</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Your Referral Code</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-[#F7FAFC] rounded-xl p-4">
              <p className="text-2xl font-mono font-bold text-[#0A2540] text-center">{referralCode}</p>
            </div>
            <Button variant="primary" size="md" onClick={onCopy}>
              Copy
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">Share this code with friends</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-[#0A2540] mb-4">How it works</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A2540] text-white text-xs font-bold flex-shrink-0">
                1
              </div>
              <p className="text-sm text-gray-700">Share your code with friends</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A2540] text-white text-xs font-bold flex-shrink-0">
                2
              </div>
              <p className="text-sm text-gray-700">They sign up and book their first service</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A2540] text-white text-xs font-bold flex-shrink-0">
                3
              </div>
              <p className="text-sm text-gray-700">You both get $10 credit!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

