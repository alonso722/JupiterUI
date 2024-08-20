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
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16">
          <div className="flex flex-col justify-center h-full">
            <div>
              <p className="text-4xl md:text-5xl text-[#2A1A3F] font-bold leading-tight mb-2">
                Bienvenido a la <br /> plataforma más completa
              </p>
              <p className="text-xl md:text-2xl text-[#2A1A3F] font-light leading-tight mt-6">
                Encuentra el plan que más se ajuste<br /> a tus necesidades
              </p>
              <p className="text-xl md:text-2xl text-[#2A1A3F] font-light leading-tight mt-5">
                ¡Obtén beneficios para tu empresa!
              </p>
              <p className="text-2xl md:text-3xl text-[#2A1A3F] font-semibold mt-12">
                ¡Únete ahora!
              </p>
              {/* <Button
                rounded
                type="submit"
                color={colors.DARK_JUPITER_OUTLINE}
                className="w-56 h-12 mt-8">
                Ir ahora
              </Button> */}
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center bg-center bg-cover bg-[url('/login/lgbg.png')]">
          <LoginForm queryParams={queryParams} />
        </div>
      </div>
    </div>
  );
}
