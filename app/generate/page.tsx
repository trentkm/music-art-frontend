'use client';

import { useEffect, useState } from 'react';
import ImageDisplay from '../../components/ImageDisplay';
import Loader from '../../components/Loader';
import { apiGet, apiPost } from '../../lib/api';
import { authHeaders, getSessionToken } from '../api/client';

type GenerationStatus = 'idle' | 'fetching-art' | 'starting' | 'processing' | 'completed' | 'failed';

export default function GeneratePage() {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionToken = getSessionToken();

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        setError('Backend URL is not configured. Set NEXT_PUBLIC_BACKEND_URL.');
        return;
      }

      if (!sessionToken) {
        setError('No session found. Please log in with Spotify again.');
        return;
      }

      try {
        setError(null);
        setStatus('fetching-art');

        const topArt = await apiGet('/spotify/top-art', {
          headers: authHeaders(sessionToken)
        });

        const imageUrls: string[] = (topArt?.images || topArt || [])
          .map((item: any) => item?.imageUrl || item?.url)
          .filter(Boolean);

        if (!imageUrls.length) {
          throw new Error('No album art found to blend. Try listening to more music on Spotify.');
        }

        setStatus('processing');

        const response = await apiPost(
          '/image/generate',
          { imageUrls },
          { headers: authHeaders(sessionToken) }
        );

        const finalUrl = response?.url || response?.imageUrl;
        if (!finalUrl) {
          throw new Error('No image URL returned from backend.');
        }

        if (!cancelled) {
          setImageUrl(finalUrl);
          setStatus('completed');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('failed');
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to generate image. Please try again.'
          );
        }
      }
    };

    start();

    return () => {
      cancelled = true;
    };
  }, [sessionToken]);

  return (
    <div className="page-shell">
      <div className="card stack">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <p className="muted" style={{ letterSpacing: '0.08em' }}>
            GENERATE
          </p>
          <h1 style={{ fontSize: '1.75rem' }}>Building your blended artwork</h1>
          <p className="muted">
            We are blending your favorite albums into a single cover. This can
            take a few seconds; hang tight.
          </p>
        </div>

        {(status === 'fetching-art' || status === 'starting' || status === 'processing' || status === 'idle') && (
          <Loader
            label={
              status === 'fetching-art'
                ? 'Loading your top album art...'
                : 'Generating...'
            }
          />
        )}

        {status === 'completed' && imageUrl ? (
          <div className="stack">
            <ImageDisplay
              src={imageUrl}
              description="Square export, perfect for sharing."
              downloadName="music-artwork"
            />
          </div>
        ) : null}

        {status === 'failed' && error ? <p className="error">{error}</p> : null}
        {!sessionToken ? (
          <a className="btn" href="/login">
            Back to login
          </a>
        ) : null}
      </div>
    </div>
  );
}
