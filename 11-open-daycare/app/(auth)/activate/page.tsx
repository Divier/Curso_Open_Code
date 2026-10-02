'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateInvitationCode, activateInvitation } from '@/app/_actions/invitations';

function ActivateForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code') || '';

  const initialStatus = code ? 'loading' : 'invalid';
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>(initialStatus);
  const [childName, setChildName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photoConsent, setPhotoConsent] = useState(true);
  const [error, setError] = useState(code ? '' : 'No se proporcionó un código de invitación');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    async function validate() {
      const result = await validateInvitationCode(code);
      if (cancelled) return;

      if (!result.valid) {
        setStatus('invalid');
        setError(result.error || 'Código no válido');
      } else {
        setStatus('valid');
        setChildName(result.childName || '');
        setRoomName(result.roomName || '');
        if (result.invitation) {
          setFullName(result.invitation.full_name);
          setEmail(result.invitation.email);
        }
      }
    }
    validate();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);

    const result = await activateInvitation({
      code,
      email,
      password,
      fullName,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push('/');
    router.refresh();
  };

  const displayChildInfo = roomName ? `${childName} · Sala ${roomName}` : childName;
  const initial = childName.charAt(0).toUpperCase();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF4EC] p-10">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D9583C] border-r-transparent mb-4"></div>
          <p className="text-[15px] font-semibold text-[#3F362E]">Validando invitación...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF4EC] p-10">
        <div className="w-full max-w-[440px] text-center">
          <div className="w-[58px] h-[58px] rounded-[18px] bg-gradient-to-br from-[#F8C3A8] to-[#F2937A] flex items-center justify-center mb-[22px] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)] mx-auto">
            <svg
              width="30"
              height="30"
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
          <h1 className="font-head font-semibold text-[32px] leading-[1.15] mb-2 text-[#3F362E]">
            Invitación no válida
          </h1>
          <p className="mb-6 text-[#D9583C] text-[15.5px] leading-[1.55]">{error}</p>
          <Link
            href="/login"
            className="inline-block text-[#C5503A] font-extrabold text-[15px]"
          >
            Ir al inicio de sesión →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF4EC] p-10">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="w-[58px] h-[58px] rounded-[18px] bg-gradient-to-br from-[#F8C3A8] to-[#F2937A] flex items-center justify-center mb-[22px] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]">
          <svg
            width="30"
            height="30"
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

        {/* Heading */}
        <h1 className="font-head font-semibold text-[32px] leading-[1.15] mb-2 text-[#3F362E]">
          Bienvenida a OpenDayCare
        </h1>
        <p className="mb-6 text-[#94887B] text-[15.5px] leading-[1.55]">
          Te invitaron a seguir el día de tu hijo. Creá tu contraseña para
          activar la cuenta.
        </p>

        {/* Invitation card */}
        <div className="flex items-center gap-[14px] bg-white border-[1.5px] border-[#EADFD0] rounded-[16px] p-3.5 px-4 mb-[22px]">
          <div className="w-[44px] h-[44px] rounded-full bg-[#A9D9E8] text-[#1F7A93] font-head font-semibold text-[19px] flex items-center justify-center">
            {initial}
          </div>
          <div>
            <div className="text-sm text-[#94887B]">Te invitaron a seguir a</div>
            <div className="font-head font-semibold text-lg text-[#3F362E]">
              {displayChildInfo}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="text-xs font-bold tracking-wider text-[#94887B] mb-2">
            EMAIL
          </div>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full p-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-[#F5F0E8] text-base text-[#3F362E] mb-4"
          />

          {/* Full name */}
          <div className="text-xs font-bold tracking-wider text-[#94887B] mb-2">
            TU NOMBRE
          </div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-base text-[#3F362E] mb-4 placeholder:text-[#B6A99B]"
            placeholder="Tu nombre completo"
          />

          {/* Password */}
          <div className="text-xs font-bold tracking-wider text-[#94887B] mb-2">
            CREAR CONTRASEÑA
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-base text-[#3F362E] mb-[18px] placeholder:text-[#B6A99B]"
            placeholder="Al menos 6 caracteres"
          />

          {/* Authorization checkbox */}
          <label className="flex items-start gap-3 bg-[#FBF1D6] rounded-[14px] p-3.5 px-4 mb-6 cursor-pointer">
            <span
              className={`flex-none w-6 h-6 rounded-[8px] flex items-center justify-center mt-[1px] ${
                photoConsent ? 'bg-[#5FB97E]' : 'bg-white border-2 border-[#B6A99B]'
              }`}
              onClick={() => setPhotoConsent(!photoConsent)}
            >
              {photoConsent && (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span
              className="text-sm text-[#8A7234] leading-[1.45] cursor-pointer"
              onClick={() => setPhotoConsent(!photoConsent)}
            >
              Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro
              de la app.
            </span>
          </label>

          {/* Error message */}
          {error && (
            <p className="text-[13px] font-medium text-[#D9583C] mb-4 text-center">
              {error}
            </p>
          )}

          {/* Activate button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`block text-center w-full p-4 rounded-[15px] text-white font-extrabold text-base shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] ${
              isSubmitting
                ? 'bg-[#E8B8A8] cursor-not-allowed'
                : 'bg-gradient-to-b from-[#F4977E] to-[#EE8164] cursor-pointer'
            }`}
          >
            {isSubmitting ? 'Activando...' : 'Activar mi cuenta'}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center mt-[22px] text-[#94887B] text-[14.5px]">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-[#C5503A] font-extrabold">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF4EC] p-10">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D9583C] border-r-transparent mb-4"></div>
            <p className="text-[15px] font-semibold text-[#3F362E]">Cargando...</p>
          </div>
        </div>
      }
    >
      <ActivateForm />
    </Suspense>
  );
}
