import { FileClock } from 'lucide-react';
import PageHead from '@/components/ui/PageHead';

export default function Activity() {
  return (
    <>
      <PageHead
        eyebrow="Evidence log"
        title="Monitoring Activity"
        sub="A user-scoped record of source updates, exposure reads, and future rule evaluations."
      />

      <section className="border border-line-strong bg-white p-8 sm:p-12">
        <FileClock size={28} className="text-brand" aria-hidden="true" />
        <h2 className="display mt-8 text-3xl">No persistent activity recorded</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          Stormline does not fabricate monitoring history. An authenticated, wallet-scoped read
          model is required before source reads and rule evaluations can appear here.
        </p>
        <div className="mt-8 inline-flex border border-amber-700 px-3 py-2 font-mono text-xs uppercase text-amber-800">
          Activity storage not enabled
        </div>
      </section>
    </>
  );
}