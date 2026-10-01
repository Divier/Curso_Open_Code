'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    window.location.href = '/';
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-[#FBF4EC]">
      {/* Left panel */}
      <div className="relative overflow-hidden bg-linear-to-br from-[#F6A98E] via-[#F2937A] to-[#EC7E62] flex flex-col justify-between p-14 sm:p-14 text-white">
        {/* Decorative circles */}
        <div className="absolute w-[420px] h-[420px] rounded-full bg-white/12 -top-[140px] -right-[120px]" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-white/10 -bottom-[110px] -left-[80px]" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div className="w-[46px] h-[46px] rounded-[14px] bg-white/22 flex items-center justify-center">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </div>
          <span className="font-head font-semibold text-xl tracking-wide">
            OpenDayCare
          </span>
        </div>

        {/* Tagline */}
        <div className="relative">
          <h1 className="font-head font-semibold text-[42px] leading-[1.12] mb-4">
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p className="text-lg leading-[1.6] max-w-[430px] text-white/92">
            Publicá momentos, gestioná las salas y mantené a las familias cerca,
            desde un solo lugar.
          </p>
        </div>

        {/* Footer */}
        <div className="relative text-sm text-white/90">
          🌿 Guardería Sala Soles
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-10">
        <div className="w-full max-w-[392px]">
          <h2 className="font-head font-semibold text-3xl mb-1 text-[#3F362E]">
            Iniciar sesión
          </h2>
          <p className="mb-5 text-[#94887B] text-sm">
            Ingresá para ver el día de hoy.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="text-xs font-bold tracking-wider text-[#94887B] mb-2">
              EMAIL
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-base text-[#3F362E] mb-4 placeholder:text-[#B6A99B]"
              placeholder="tu@email.com"
              required
            />

            {/* Password */}
            <div className="text-xs font-bold tracking-wider text-[#94887B] mb-2">
              CONTRASEÑA
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-base text-[#3F362E] mb-2.5 placeholder:text-[#B6A99B]"
              required
            />

            {/* Forgot password */}
            <div className="text-right mb-5">
              <span className="text-[#C5503A] text-[13.5px] font-bold cursor-default">
                ¿Olvidaste tu contraseña?
              </span>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className={`block text-center w-full p-4 rounded-[15px] text-white font-extrabold text-base shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] ${
                loading
                  ? 'bg-[#E0A08E] cursor-not-allowed'
                  : 'bg-linear-to-b from-[#F4977E] to-[#EE8164] hover:opacity-95'
              }`}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            {/* Error message */}
            {error && (
              <p className="mt-4 text-center text-[#C5503A] text-sm font-medium">
                {error}
              </p>
            )}
          </form>

          {/* Footer link */}
          <p className="text-center mt-6 text-[#94887B] text-[14.5px]">
            ¿Te invitó la guardería?{' '}
            <Link href="/activate" className="text-[#C5503A] font-extrabold">
              Activá tu cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
