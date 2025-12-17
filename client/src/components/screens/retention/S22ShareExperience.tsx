'use client';

import { Icon, Button } from '@/components/ui';

interface S22Props {
  providerName: string;
  onShare: (platform: string) => void;
  onSkip: () => void;
}

export default function S22ShareExperience({ providerName, onShare, onSkip }: S22Props) {
  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <h2 className="text-lg font-bold text-[#0A2540]">Share your experience</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF4742]/10">
            <Icon name="share" size="xl" className="text-[#FF4742]" />
          </div>
          <h3 className="text-xl font-semibold text-[#0A2540] mb-2">Loved your service?</h3>
          <p className="text-sm text-gray-600">Share {providerName} with friends and help others find great help!</p>
        </div>

        <div className="space-y-3">
          <Button variant="outline" size="lg" fullWidth onClick={() => onShare('twitter')} leftIcon="share">
            Share on Twitter
          </Button>
          <Button variant="outline" size="lg" fullWidth onClick={() => onShare('facebook')} leftIcon="share">
            Share on Facebook
          </Button>
          <Button variant="outline" size="lg" fullWidth onClick={() => onShare('copy')} leftIcon="link">
            Copy Link
          </Button>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <button onClick={onSkip} className="w-full py-2 text-sm text-gray-500 hover:text-[#0A2540]">
          Skip
        </button>
      </div>
    </div>
  );
}

