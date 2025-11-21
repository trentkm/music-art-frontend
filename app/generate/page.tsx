'use client';

import { useEffect, useRef, useState } from 'react';
import ImageDisplay from '../../components/ImageDisplay';
import Loader from '../../components/Loader';
import { apiGet, apiPost } from '../../lib/api';
import { authHeaders, getSessionToken } from '../api/client';

type GenerationStatus = 'idle' | 'starting' | 'processing' | 'completed' | 'failed';

export default function GeneratePage() {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimeout = useRef<NodeJS.Timeout | null>(null);
  const sessionToken = getSessionToken();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      setError('Backend URL is not configured. Set NEXT_PUBLIC_BACKEND_URL.');
      return;
    }

    if (!sessionToken) {
      setError('No session found. Please log in with Spotify again.');
      return;
    }

    const startGeneration = async () => {
      try {
        setStatus('starting');
        const response = await apiPost('/image/generate', undefined, {
          headers: authHeaders(sessionToken)
        });
        const newRequestId = response?.requestId || response?.id;
        if (!newRequestId) {
          throw new Error('No request id returned from backend.');
        }
        setRequestId(newRequestId);
        pollGeneration(newRequestId);
      } catch (err) {
        setStatus('failed');
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to start generation. Please try again.'
        );
      }
    };

    const pollGeneration = async (id: string) => {
      try {
        setStatus('processing');
        const response = await apiGet(`/image/status?requestId=${id}`, {
          headers: authHeaders(sessionToken)
        });

        if (response.status === 'completed' || response.status === 'done') {
          setStatus('completed');
          setImageUrl(response.imageUrl || response.url);
          setGalleryId(response.galleryId || response.id || id);
          return;
        }

        if (response.status === 'failed') {
          setStatus('failed');
          setError('Generation failed. Please try again.');
          return;
        }

        pollTimeout.current = setTimeout(() => pollGeneration(id), 2000);
      } catch (err) {
        setStatus('failed');
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong while checking status.'
        );
      }
    };

    startGeneration();

    return () => {
      if (pollTimeout.current) {
        clearTimeout(pollTimeout.current);
      }
    };
  }, [sessionToken]);

  const shareUrl =
    galleryId && appUrl ? `${appUrl}/gallery/${galleryId}` : undefined;

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

        {(status === 'starting' || status === 'processing' || status === 'idle') && (
          <Loader
            label={
              status === 'processing'
                ? 'Generating...'
                : 'Preparing your blend...'
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
            {galleryId ? (
              <a className="btn" href={`/gallery/${galleryId}`}>
                View public page
              </a>
            ) : null}
            {shareUrl ? (
              <p className="muted" style={{ textAlign: 'center' }}>
                Shareable link: <a href={shareUrl}>{shareUrl}</a>
              </p>
            ) : null}
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
