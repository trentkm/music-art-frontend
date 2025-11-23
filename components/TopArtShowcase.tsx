'use client';

import Image from 'next/image';
import { Sparkles, Timer } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { cn } from '../lib/utils';

export type TopArtItem = {
  artistName?: string;
  albumName?: string;
  imageUrl?: string;
  releasedAt?: string;
};

type TopArtShowcaseProps = {
  items: TopArtItem[];
  progress: number;
};

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.getFullYear().toString();
};

const AlbumCard = ({ item }: { item: TopArtItem }) => (
  <div className="flex w-[210px] min-w-[210px] max-w-[210px] items-center gap-3 overflow-hidden rounded-2xl border border-white/12 bg-white/5 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/15">
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.albumName ?? 'Album artwork'}
          fill
          sizes="56px"
          className="object-cover"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900" />
      )}
    </div>
    <div className="flex min-w-0 flex-col">
      <p className="truncate text-sm font-semibold leading-tight text-white">
        {item.albumName ?? 'Unknown Record'}
      </p>
      <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
        {item.artistName ?? 'Unknown Artist'}
      </p>
      {item.releasedAt ? (
        <p className="text-[0.65rem] text-muted-foreground/70">
          {formatDate(item.releasedAt)} • Fan favorite
        </p>
      ) : null}
    </div>
  </div>
);

const AlbumsTicker = ({ rows }: { rows: TopArtItem[][] }) => (
  <div className="relative flex flex-col gap-3 overflow-hidden">
    {rows.map((row, index) => {
      if (!row.length) return null;
      const trackKey = `row-${index}`;
      const animation = index % 2 === 0 ? 'animate-marquee' : 'animate-marquee-fast';
      const entries = [...row, ...row];
      return (
        <div
          key={trackKey}
          className="flex w-full items-center overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]"
        >
          <div className={cn('flex min-w-[200%] gap-3 py-2', animation)}>
            {entries.map((item, idx) => (
              <AlbumCard key={`${trackKey}-${idx}-${item.albumName}`} item={item} />
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

export default function TopArtShowcase({ items, progress }: TopArtShowcaseProps) {
  const safeItems = useMemo(
    () => items.filter((item) => item && item.imageUrl),
    [items]
  );

  const rows = useMemo(() => {
    const first: TopArtItem[] = [];
    const second: TopArtItem[] = [];
    safeItems.forEach((item, index) => {
      if (index % 2 === 0) {
        first.push(item);
      } else {
        second.push(item);
      }
    });
    return [first, second];
  }, [safeItems]);

  if (!safeItems.length) {
    return null;
  }

  const uniqueArtists = Array.from(
    new Set(safeItems.map((item) => item.artistName).filter(Boolean) as string[])
  );

  const etaSeconds = Math.max(5, Math.round((100 - Math.min(progress, 99)) / 1.5));
  const artistCopy = uniqueArtists.length
    ? uniqueArtists
        .slice(0, 3)
        .map((artist) => artist)
        .join(', ')
    : 'your favorites';
  const extraArtists =
    uniqueArtists.length > 3 ? ` +${uniqueArtists.length - 3} more` : '';

  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-white/5 p-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.4),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.25),transparent_40%)]" />
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative z-10 space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <Badge variant="pulse" className="text-[0.55rem] tracking-[0.35em]">
              <Sparkles className="mr-2 h-3 w-3" />
              LIVE BLEND
            </Badge>
            <h2 className="text-2xl font-semibold leading-tight text-white">
              Your records are vibing
            </h2>
            <p className="text-sm text-muted-foreground">
              Mixing {artistCopy}
              {extraArtists} into a single visual.
            </p>
          </div>
          <div className="flex flex-col items-end text-xs text-muted-foreground">
            <span className="text-[0.65rem] uppercase tracking-[0.3em]">
              ETA
            </span>
            <div className="flex items-center gap-1 font-semibold text-white">
              <Timer className="h-3.5 w-3.5 text-emerald-300" />
              ~{etaSeconds}s
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Blend progress</span>
            <span className="font-semibold text-white">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent px-4 pb-4">
        <AlbumsTicker rows={rows} />
      </div>
    </Card>
  );
}
