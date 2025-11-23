import * as React from 'react';

import { cn } from '../../lib/utils';

const badgeVariants = {
  default:
    'bg-gradient-to-r from-[#8ca9ff] via-[#b9a9ff] to-[#d6b8ff] text-[#0f1324] shadow-[0_0_25px_rgba(147,165,255,0.35)]',
  outline:
    'border border-white/18 bg-white/6 text-white backdrop-blur-2xl shadow-[0_18px_40px_rgba(0,0,0,0.45)]',
  pulse:
    'bg-white/8 text-white border border-white/12 shadow-[0_0_30px_rgba(184,199,255,0.35)] animate-glow'
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
