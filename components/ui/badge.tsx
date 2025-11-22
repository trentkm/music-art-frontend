import * as React from 'react';

import { cn } from '../../lib/utils';

const badgeVariants = {
  default:
    'bg-gradient-to-r from-emerald-400/90 to-emerald-500/90 text-emerald-950 shadow-[0_0_35px_rgba(52,211,153,0.45)]',
  outline:
    'border border-white/20 bg-white/5 text-white backdrop-blur-2xl shadow-[0_20px_45px_rgba(0,0,0,0.45)]',
  pulse:
    'bg-white/5 text-white border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.25)] animate-glow'
};

export type BadgeVariant = keyof typeof badgeVariants;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold uppercase tracking-[0.2em]',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge };
