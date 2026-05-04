import { LoginForm } from './login-form';

export const metadata = { title: 'Вход — TAS System' };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-dark via-[#0d1829] to-[#1a0d2e] px-4">
      <div className="bg-white/5 border border-gold/25 rounded-[20px] p-10 w-full max-w-[400px] backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-8">
          <div className="w-[60px] h-[60px] mx-auto bg-gradient-to-br from-gold to-gold-light rounded-2xl flex items-center justify-center font-display font-black text-[20px] text-navy-dark mb-3.5 shadow-lg shadow-gold/35">
            TAS
          </div>
          <h1 className="font-display font-extrabold text-xl text-white mb-1">TAS System</h1>
          <p className="text-[11px] text-white/45 uppercase tracking-[1px]">
            TEXNIKA ADVANS SERVIS
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-[11px] text-white/30 mt-5">
          dev: admin@tas.dev / admin123
        </p>
      </div>
    </div>
  );
}
