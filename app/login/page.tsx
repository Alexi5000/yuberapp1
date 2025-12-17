// file: app/login/page.tsx
// description: Simple email-based account creation/login that issues session cookies via API
// reference: app/api/auth/login/route.ts, server/_core/oauth.ts

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Cookie is set by the route; redirect to app
      if (typeof window !== 'undefined') {
        localStorage.setItem('yuber_onboarding_complete', 'true');
        if (data.user) {
          localStorage.setItem('yuber-runtime-user-info', JSON.stringify(data.user));
        }
      }
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-6'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardContent className='p-6 space-y-6'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>Create your account</h1>
            <p className='text-muted-foreground mt-2'>Use your email to create an account and continue.</p>
          </div>

          <form className='space-y-4' onSubmit={handleSubmit}>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                required
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='name'>Name (optional)</Label>
              <Input
                id='name'
                type='text'
                placeholder='Your name'
                value={name}
                onChange={(e) => setName(e.target.value)} />
            </div>

            {error && <p className='text-sm text-destructive'>{error}</p>}

            <Button type='submit' className='w-full h-11' disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Continue'}
            </Button>
          </form>

          <p className='text-xs text-muted-foreground text-center'>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
