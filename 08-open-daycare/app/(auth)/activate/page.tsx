import Link from 'next/link';

export default function ActivatePage() {
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
            M
          </div>
          <div>
            <div className="text-sm text-[#94887B]">
              Te invitaron a seguir a
            </div>
            <div className="font-head font-semibold text-lg text-[#3F362E]">
              Mateo · Sala Soles
            </div>
          </div>
        </div>

        {/* Invitation code */}
        <div className="text-xs font-bold tracking-wider text-[#94887B] mb-2">
          CÓDIGO DE INVITACIÓN
        </div>
        <input
          type="text"
          defaultValue="7K4P9"
          className="w-full p-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-lg tracking-[3px] font-bold text-[#3F362E] mb-4 placeholder:text-[#B6A99B] font-head"
        />

        {/* Email */}
        <div className="text-xs font-bold tracking-wider text-[#94887B] mb-2">
          EMAIL
        </div>
        <input
          type="email"
          defaultValue="lucia.fernandez@gmail.com"
          className="w-full p-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-base text-[#3F362E] mb-4 placeholder:text-[#B6A99B]"
        />

        {/* Password */}
        <div className="text-xs font-bold tracking-wider text-[#94887B] mb-2">
          CREAR CONTRASEÑA
        </div>
        <input
          type="password"
          defaultValue="contraseña"
          className="w-full p-3.5 px-4 rounded-[14px] border-[1.5px] border-[#F2A78E] bg-white text-base text-[#3F362E] mb-[18px] placeholder:text-[#B6A99B]"
        />

        {/* Authorization checkbox */}
        <label className="flex items-start gap-3 bg-[#FBF1D6] rounded-[14px] p-3.5 px-4 mb-6 cursor-pointer">
          <span className="flex-none w-6 h-6 rounded-[8px] bg-[#5FB97E] flex items-center justify-center mt-[1px]">
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
          </span>
          <span className="text-sm text-[#8A7234] leading-[1.45]">
            Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro
            de la app.
          </span>
        </label>

        {/* Activate button */}
        <div className="block text-center w-full p-4 rounded-[15px] bg-linear-to-b from-[#F4977E] to-[#EE8164] text-white font-extrabold text-base cursor-default shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]">
          Activar mi cuenta
        </div>

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
