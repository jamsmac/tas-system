export function Topbar() {
  return (
    <header className="h-[var(--topbar-h)] bg-white border-b border-bg-2 flex items-center px-5 gap-3 flex-shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex-1" />
      <div className="flex items-center gap-2.5">
        <span className="flex items-center gap-1.5 text-xs text-text-mid">
          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
          Онлайн
        </span>
      </div>
    </header>
  );
}
