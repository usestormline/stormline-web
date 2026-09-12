import { Activity, Bell, Database, ShieldCheck } from 'lucide-react';
import PageHead from '@/components/ui/PageHead';

const requirements = [
  {
    icon: Database,
    title: 'Verified event sources',
    description: 'Macro and official policy feeds must provide stable source IDs and evidence.',
    status: 'Connected',
  },
  {
    icon: ShieldCheck,
    title: 'Stock Token exposure',
    description: 'Canonical Robinhood Chain balances are available for rule targeting.',
    status: 'Connected',
  },
  {
    icon: Activity,
    title: 'Persistent evaluator',
    description: 'Owner-scoped rule storage and scheduled evaluation are not enabled yet.',
    status: 'Required',
  },
  {
    icon: Bell,
    title: 'Notification channel',
    description: 'No delivery destination has been authorized for alerts.',
    status: 'Required',
  },
] as const;

export default function ShieldRules() {
  return (
    <>
      <PageHead
        eyebrow="Non-custodial protection"
        title="Monitoring Rules"
        sub="Rules will alert on verified events and Stock Token exposure. They will never execute trades."
      />

      <section className="border border-line-strong bg-white">
        <div className="border-b border-line-strong bg-gray-50 p-5">
          <p className="eyebrow mb-1">Engine status</p>
          <h2 className="font-semibold">Configuration is not active</h2>
        </div>
        <div className="grid sm:grid-cols-2">
          {requirements.map(({ icon: Icon, title, description, status }, index) => (
            <article
              key={title}
              className={`p-6 sm:p-8 ${
                index % 2 === 0 ? 'sm:border-r sm:border-line-strong' : ''
              } ${index < 2 ? 'border-b border-line-strong' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <Icon size={20} className="text-brand" aria-hidden="true" />
                <span
                  className={`border px-2 py-1 font-mono text-[10px] uppercase ${
                    status === 'Connected'
                      ? 'border-green-700 text-green-800'
                      : 'border-amber-700 text-amber-800'
                  }`}
                >
                  {status}
                </span>
              </div>
              <h3 className="mt-6 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted">
        No rules are stored, armed, or evaluated. Rule creation remains unavailable until
        persistence, ownership, and an audit trail are implemented.
      </p>
    </>
  );
}