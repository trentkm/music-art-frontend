'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

type ImageDisplayProps = {
  src: string;
  alt?: string;
  downloadName?: string;
  description?: string;
};

export default function ImageDisplay({
  src,
  alt = 'Generated artwork',
  downloadName = 'music-artwork',
  description
}: ImageDisplayProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadImage = useCallback(async () => {
    setError(null);
    setDownloading(true);
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${downloadName}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Unable to download image right now.');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  }, [downloadName, src]);

  return (
    <div className="stack" style={{ textAlign: 'center' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)',
          width: '100%',
          aspectRatio: '1 / 1'
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          style={{
            objectFit: 'cover'
          }}
          priority
        />
      </div>
      {description ? (
        <p className="muted" style={{ textAlign: 'center' }}>
          {description}
        </p>
      ) : null}
      <button className="btn" onClick={downloadImage} disabled={downloading}>
        {downloading ? 'Preparing...' : 'Download for Instagram'}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
