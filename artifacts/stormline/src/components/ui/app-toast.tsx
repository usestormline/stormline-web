import { X } from 'lucide-react';

export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="toast border-line-strong shadow-[4px_4px_0_var(--brand)]">
      <span>{message}</span>
      <button onClick={onClose} className="p-1 hover:text-brand transition-colors" aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
}