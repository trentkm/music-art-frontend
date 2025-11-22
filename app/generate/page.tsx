'use client';

import { useEffect, useMemo, useState } from 'react';

import ImageDisplay from '../../components/ImageDisplay';
import Loader from '../../components/Loader';
import TopArtShowcase, { TopArtItem } from '../../components/TopArtShowcase';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { apiGet } from '../../lib/api';
import { authHeaders, getSessionToken } from '../api/client';

type GenerationStatus =
  | 'idle'
  | 'fetching-art'
  | 'starting'
  | 'processing'
  | 'completed'
  | 'failed';

const statusCopy: Record<
  GenerationStatus,
  { title: string; description: string }
> = {
  idle: {
    title: 'Initializing your blend',
    description: 'Prepping the canvas and calling in your recent listening.'
  },
  'fetching-art': {
    title: 'Pulling fan-favorite records',
    description: 'Collecting the albums you looped the most for fresh inspiration.'
  },
  starting: {
    title: 'Locking in palettes',
    description: 'Balancing dominant colors, typography, and mood before render.'
  },
  processing: {
    title: 'Blending textures & tone',
    description:
      'Our diffusion model is stitching artwork layers, typography hints, and lightning to feel cohesive.'
  },
  completed: {
    title: 'Artwork ready to share',
    description: 'Save it for Instagram or regenerate for a different vibe.'
  },
  failed: {
    title: 'We hit a snag',
    description: 'See the message below for what happened and try again.'
  }
};

export default function GeneratePage() {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topAlbums, setTopAlbums] = useState<TopArtItem[]>([]);
  const [progress, setProgress] = useState(0);
  const sessionToken = getSessionToken();

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        setStatus('failed');
        setError(
          'Backend URL is not configured. Set NEXT_PUBLIC_BACKEND_URL to continue.'
        );
        return;
      }

      if (!process.env.NEXT_PUBLIC_GENERATE_URL) {
        setStatus('failed');
        setError(
          'Missing NEXT_PUBLIC_GENERATE_URL. Provide your generation endpoint to continue.'
        );
        return;
      }

      if (!sessionToken) {
        setStatus('failed');
        setError('No session found. Please log in with Spotify again.');
        return;
      }

      try {
        setError(null);
        setStatus('fetching-art');

        const topArt = await apiGet('/spotify/top-art', {
          headers: authHeaders(sessionToken)
        });

        const rawItems: any[] = Array.isArray(topArt?.images)
          ? topArt.images
          : Array.isArray(topArt)
            ? topArt
            : [];

        const normalized: TopArtItem[] = rawItems.map((item) => ({
          artistName:
            item?.artistName || item?.artist || item?.artist_name || item?.artistTitle,
          albumName: item?.albumName || item?.name || item?.album,
          imageUrl: item?.imageUrl || item?.url || item?.image,
          releasedAt: item?.releasedAt || item?.released_at || item?.releaseDate
        }));

        const imageUrls = normalized
          .map((item) => item.imageUrl)
          .filter(Boolean) as string[];

        if (!imageUrls.length) {
          throw new Error(
            'No album art found to blend. Try listening to more music on Spotify.'
          );
        }

        if (!cancelled) {
          setTopAlbums(normalized);
          setStatus('processing');
        }

        const response = await fetch(process.env.NEXT_PUBLIC_GENERATE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(sessionToken)
          },
          body: JSON.stringify({ imageUrls })
        }).then((res) => res.json());

        const finalUrl = response?.url || response?.imageUrl;
        if (!finalUrl) {
          throw new Error('No image URL returned from backend.');
        }

        if (!cancelled) {
          setImageUrl(finalUrl);
          setStatus('completed');
          setProgress(100);
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

  useEffect(() => {
    if (status === 'processing') {
      setProgress((prev) => (prev < 40 ? 45 : prev));
      const interval = window.setInterval(() => {
        setProgress((value) =>
          value >= 95 ? value : Math.min(95, value + Math.random() * 5 + 2)
        );
      }, 1200);
      return () => {
        window.clearInterval(interval);
      };
    }

    if (status === 'fetching-art' || status === 'starting') {
      setProgress(25);
    }

    if (status === 'failed' || status === 'idle') {
      setProgress(0);
    }

    if (status === 'completed') {
      setProgress(100);
    }

    return undefined;
  }, [status]);

  const activeCopy = statusCopy[status];
  const showShowcase =
    topAlbums.length > 0 &&
    (status === 'processing' || status === 'fetching-art');
  const shouldShowLoader =
    !imageUrl &&
    !showShowcase &&
    (status === 'idle' ||
      status === 'starting' ||
      status === 'fetching-art' ||
      status === 'processing');

  const statusLabel = useMemo(
    () => status.replace('-', ' ').toUpperCase(),
    [status]
  );

  return (
    <div className="page-shell">
      <div className="w-full max-w-md space-y-4">
        <Card className="space-y-6 border-white/10 bg-black/40">
          <div className="space-y-2 text-center sm:text-left">
            <Badge variant="outline" className="mx-auto sm:mx-0">
              GENERATE
            </Badge>
            <h1 className="text-3xl font-semibold leading-tight text-white">
              Building your blended artwork
            </h1>
            <p className="text-sm text-muted-foreground">
              Sit tight for ~30 seconds while we pull your recent listening, mix
              the palettes, and generate something worthy of your feed.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground">
              <span>Status</span>
              <span>{statusLabel}</span>
            </div>
            <p className="pt-2 text-xl font-semibold text-white">
              {activeCopy?.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {activeCopy?.description}
            </p>
            {(status === 'processing' ||
              status === 'fetching-art' ||
              status === 'starting') && (
              <div className="pt-4">
                <Progress value={progress} />
                <p className="pt-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  {Math.round(progress)}% MIXED
                </p>
              </div>
            )}
          </div>

          {imageUrl && status === 'completed' ? (
            <div className="space-y-4">
              <ImageDisplay
                src={imageUrl}
                description="Square export, perfect for sharing."
                downloadName="music-artwork"
              />
              <p className="text-center text-sm text-muted-foreground">
                Want another flavor? Refresh the page to generate a new blend.
              </p>
            </div>
          ) : null}

          {shouldShowLoader ? (
            <div className="rounded-2xl border border-white/5 bg-black/30 p-6 text-center backdrop-blur">
              <Loader
                label={
                  status === 'fetching-art'
                    ? 'Curating your top records...'
                    : 'Synthesizing pixels...'
                }
              />
            </div>
          ) : null}

          {status === 'failed' && error ? <p className="error">{error}</p> : null}

          {!sessionToken ? (
            <a className="btn" href="/login">
              Back to login
            </a>
          ) : null}
        </Card>

        {showShowcase ? (
          <TopArtShowcase items={topAlbums} progress={progress} />
        ) : null}
      </div>
    </div>
  );
}
