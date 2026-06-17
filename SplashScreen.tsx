import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'text' | 'fade'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 600);
    const t2 = setTimeout(() => setPhase('fade'), 2300);
    const t3 = setTimeout(() => onFinish(), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700 ${
        phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: '#ffffff' }}
    >
      {/* Subtle background rings */}
      <div
        className={`absolute rounded-full border border-green-100 transition-all duration-1000 ${
          phase === 'enter' ? 'w-32 h-32 opacity-0' : 'w-80 h-80 opacity-100'
        }`}
      />
      <div
        className={`absolute rounded-full border border-blue-50 transition-all duration-1500 ${
          phase === 'enter' ? 'w-48 h-48 opacity-0' : 'w-96 h-96 opacity-100'
        }`}
      />

      {/* Logo */}
      <div
        className={`relative z-10 transition-all duration-700 ${
          phase === 'enter' ? 'scale-75 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        <img
          src="/d5eb9f92-ed30-4fbc-a714-b6806e769d69-removebg-preview.png"
          alt="Tu Ruta Honduras"
          className="w-44 h-44 object-contain drop-shadow-sm"
        />
      </div>

      {/* Text */}
      <div
        className={`relative z-10 text-center mt-4 transition-all duration-500 ${
          phase === 'text' || phase === 'fade' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span style={{ color: '#1a3a5c' }}>Tu </span>
          <span className="text-green-500">Ruta</span>
          <span style={{ color: '#1a3a5c' }}> Honduras</span>
        </h1>
        <p className="text-gray-400 mt-1.5 text-sm tracking-widest uppercase">
          Movilidad Inteligente
        </p>
      </div>

      {/* Loading bar */}
      <div
        className={`relative z-10 mt-10 w-48 h-1 bg-gray-100 rounded-full overflow-hidden transition-opacity duration-300 ${
          phase === 'fade' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all"
          style={{
            width: phase === 'enter' ? '8%' : phase === 'text' ? '85%' : '100%',
            transitionDuration: phase === 'text' ? '1500ms' : '400ms',
          }}
        />
      </div>

      <p
        className={`relative z-10 mt-4 text-xs text-gray-300 transition-all duration-500 ${
          phase === 'text' || phase === 'fade' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Cargando plataforma...
      </p>
    </div>
  );
}
