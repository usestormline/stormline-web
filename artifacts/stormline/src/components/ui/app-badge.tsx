import { ReactNode } from 'react';

export default function Badge({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'green' | 'amber' | 'red' }) {
  const tones = {
    brand: 'border-brand text-brand',
    green: 'border-green-600 text-green-700',
    amber: 'border-amber-600 text-amber-700',
    red: 'border-red-600 text-red-700',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${tones[tone]} font-mono text-[10px] uppercase tracking-wider bg-transparent`}>
      {children}
    </span>
  );
}