'use client';

import * as React from 'react';

import { cn } from '../../lib/utils';

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'h-3 w-full overflow-hidden rounded-full border border-white/15 bg-white/5',
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-sky-300 transition-all"
        style={{ transform: `translateX(-${100 - Math.min(100, value)}%)` }}
      />
    </div>
  )
);
Progress.displayName = 'Progress';

export { Progress };
