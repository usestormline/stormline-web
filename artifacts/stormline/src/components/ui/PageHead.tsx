import { ReactNode } from 'react';

export default function PageHead({ eyebrow, title, sub, action }: { eyebrow: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-line-strong">
      <div className="max-w-xl">
        <div className="eyebrow mb-3">{eyebrow}</div>
        <h1 className="display text-4xl mb-3">{title}</h1>
        {sub && <p className="text-muted text-sm">{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}