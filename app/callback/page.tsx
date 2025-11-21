'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Loader from '../../components/Loader';
import { apiPost } from '../../lib/api';
import { storeSessionToken } from '../api/client';

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('Missing authorization code from Spotify.');
      return;
    }

    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      setError('Backend URL is not configured. Set NEXT_PUBLIC_BACKEND_URL.');
      return;
    }

    const exchange = async () => {
      try {
        setError(null);
        const data = await apiPost('/auth/exchange', { code });
        const sessionToken =
          data?.token || data?.sessionToken || data?.access_token;
        if (!sessionToken) {
          throw new Error('No session token returned from backend.');
        }
        storeSessionToken(sessionToken);
        router.replace('/generate');
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to complete login. Please try again.'
        );
      }
    };

    exchange();
  }, [router, searchParams]);

  return (
    <div className="page-shell">
      <div className="card stack" style={{ textAlign: 'center' }}>
        <Loader label="Finalizing your login..." />
        <p className="muted">
          Completing Spotify authentication and preparing your session.
        </p>
        {error ? <p className="error">{error}</p> : null}
        {error ? (
          <button className="btn" onClick={() => router.push('/login')}>
            Back to login
          </button>
        ) : null}
      </div>
    </div>
  );
}
