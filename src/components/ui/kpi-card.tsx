interface Props {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'navy' | 'gold' | 'success' | 'danger' | 'info';
  icon?: string;
}

const TONE: Record<NonNullable<Props['tone']>, string> = {
  navy: 'border-l-navy',
  gold: 'border-l-gold',
  success: 'border-l-success',
  danger: 'border-l-danger',
  info: 'border-l-info',
};

export function KpiCard({ label, value, hint, tone = 'navy', icon }: Props) {
  return (
    <div
      className={`bg-white border border-bg-2 border-l-[4px] rounded-2xl p-4 ${TONE[tone]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-text-mid">
          {label}
        </div>
        {icon && <span className="text-xl leading-none">{icon}</span>}
      </div>
      <div className="font-display font-extrabold text-2xl text-navy mt-1">{value}</div>
      {hint && <div className="text-[11px] text-text-mid mt-1">{hint}</div>}
    </div>
  );
}
