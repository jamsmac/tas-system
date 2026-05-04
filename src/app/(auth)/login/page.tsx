export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-dark via-[#0d1829] to-[#1a0d2e]">
      <div className="bg-white/5 border border-gold/25 rounded-[20px] p-11 w-full max-w-[400px] backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-[60px] h-[60px] mx-auto bg-gradient-to-br from-gold to-gold-light rounded-2xl flex items-center justify-center font-display font-black text-[20px] text-navy-dark mb-3.5 shadow-lg shadow-gold/35">
            TAS
          </div>
          <h1 className="font-display font-extrabold text-xl text-white mb-1">TAS System</h1>
          <p className="text-xs text-white/45 uppercase tracking-wider">Phase 2 — Coming soon</p>
        </div>
        <p className="text-sm text-white/60 text-center">
          Аутентификация через Supabase Auth будет реализована на следующем этапе.
        </p>
      </div>
    </div>
  );
}
