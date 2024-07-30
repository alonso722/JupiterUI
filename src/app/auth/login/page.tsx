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
        <div className="w-1/2 flex flex-col ">
          <div className="pl-[99px] pt-[123px] font-bold">
            <div>
              <p className="mb-0 pb-0 text-[54px] text-[#2A1A3F]">
                Bienvenido a la <br /> plataforma más completa
              </p>
              <p className="text-[#2A1A3F] text-[28px] mt-[30px] font-light">
                Encuentra el plan que más se ajuste<br /> a tus necesidades
              </p>
              <p className="text-[#2A1A3F] font-monserrat text-[28px] mt-[20px] font-thin">
                ¡Obtén beneficios para tu empresa!
              </p>
              <p className="text-[36px] leading-[36px] text-[#2A1A3F] font-semibold mt-[60px]">
                ¡Únete ahora!
              </p>
              <Button
                rounded
                type="submit" 
                color={colors.DARK_JUPITER_OUTLINE}
                className="w-[220px] h-[50px] mt-[30px]">
                Ir ahora
              </Button>
            </div>
          </div>
        </div>
        <div className="w-1/2 flex items-center justify-center bg-center bg-[url('/login/lgbg.png')] bg-cover">
          <LoginForm queryParams={queryParams} />
        </div>
      </div>
    </div>
  );
}
