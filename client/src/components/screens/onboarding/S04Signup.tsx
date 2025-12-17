'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

interface S04Props {
  onCreateAccount: () => void;
  onSkip: () => void;
}

export default function S04Signup({ onCreateAccount, onSkip }: S04Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canContinue = email.trim().length > 0 && password.trim().length > 0;

  return (
    <div className="flex h-full flex-col bg-white px-6 py-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A2540]/10">
              <iconify-icon icon="lucide:user-plus" width="32" className="text-[#0A2540]"></iconify-icon>
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[#0A2540]">Create an account?</h1>
          <p className="mb-8 text-sm text-gray-600">
            Save your history, payment info, and favorite providers for next time.
          </p>

          <div className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={onCreateAccount}
                className="border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <iconify-icon icon="lucide:chrome" width="20"></iconify-icon>
                  Continue with Google
                </div>
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={onCreateAccount}
                className="border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <iconify-icon icon="lucide:apple" width="20"></iconify-icon>
                  Continue with Apple
                </div>
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onCreateAccount}
              disabled={!canContinue}
              className="mt-4"
            >
              Create Account & Continue
            </Button>

            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={onSkip}
              className="mt-3 border-gray-300"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

