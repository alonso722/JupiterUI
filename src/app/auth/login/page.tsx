'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/form/button';
import { colors } from '@/components/types/enums/colors';
import LoginForm from '@/components/auth/loginForm';
import LandingNav from '@/app/landing/landingNav';

export default function Page(data: { searchParams: { callback?: string } }) {
  const queryParams = useMemo(() => {
    if (data.searchParams.callback) {
      return `?callback=${encodeURIComponent(data.searchParams.callback)}`;
    } else {
      return '';
    }
  }, [data.searchParams.callback]);

  return (
    <div className="flex flex-col h-screen">
      <LandingNav />
      <div className="flex flex-1 flex-col md:flex-row overflow-auto">
        <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16">
          <div className="flex flex-col justify-center h-full">
            <div>
              <p className="text-3xl md:text-5xl text-[#2A1A3F] font-bold leading-tight mb-2">
                Bienvenido a la <br className="hidden md:block" /> plataforma más completa
              </p>
              <p className="text-lg md:text-2xl text-[#2A1A3F] font-light leading-tight mt-6">
                Encuentra el plan que más se ajuste<br className="hidden md:block" /> a tus necesidades
              </p>
              <p className="text-lg md:text-2xl text-[#2A1A3F] font-light leading-tight mt-5">
                ¡Obtén beneficios para tu empresa!
              </p>
              <p className="text-xl md:text-3xl text-[#2A1A3F] font-semibold mt-12">
                ¡Únete ahora!
              </p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex md:py-[20px] items-center justify-center bg-center bg-cover bg-[url('/login/lgbg.png')]">
          <LoginForm queryParams={queryParams} />
        </div>
      </div>
    </div>
  );
}
