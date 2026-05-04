import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon = '📭', action }: EmptyStateProps) {
  return (
    <div className="border border-bg-2 bg-white rounded-2xl p-10 text-center">
      <div className="text-4xl mb-2" aria-hidden>
        {icon}
      </div>
      <div className="font-display font-bold text-navy mb-1">{title}</div>
      {description ? <p className="text-sm text-text-mid mb-4">{description}</p> : null}
      {action}
    </div>
  );
}
