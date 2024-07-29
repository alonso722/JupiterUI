'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import LoginForm from '@/components/auth/loginForm';
import LandingNav from '@/app/landing/landingNav';
import MustBeNotAuth from '@/components/auth/mustBeNotAuth';

export default function Page(data: { searchParams: { callback?: string } }) {
    const queryParams = useMemo(() => {
        if (data.searchParams.callback) {
            return `?callback=${encodeURIComponent(
                data.searchParams.callback
            )}`;
        } else {
            return '';
        }
    }, [data.searchParams.callback]);

    return (
      <>
        <LandingNav />
        <div className="flex">
          <div className="w-1/2 items-center justify-center">
            <div className="pl-[99px] pt-[200px] font-bold">
              <div>
                <p className="mb-0 pb-0 text-[64px] text-[#2A1A3F]">
                  Bienvenido a la <br /> plataforma más completa
                </p>
                <p className="mt-[20px] pt-0 text-[32px] leading-[32px] pb-[50px] text-[#2A1A3F]">
                  <br />
                </p>
                <p className='text-[#7D7588]'>
                  Encuentra el plan que más se adecúe a tus necesidades
                </p>
                <p className='text-[#7D7588]'>
                  !Obtén beneficios para tu empresa
                </p>
                <p className="text-[32px] leading-[32px] text-[#2A1A3F]">
                  Únete ahora
                </p>
              </div>
            </div>
            <div className="text-black">
              <div className="mb-8">
              </div>
              <div className="mb-[135px] mt-[84px]">
              </div>
            </div>
          </div>
          <div className="w-1/2 flex h-[227px] items-center justify-center bg-center bg-[url('/login/lgbg.png')] bg-cover font-bold leading-[64px] text-white md:h-full md:min-h-[100vh]">
            <LoginForm queryParams={queryParams} />
          </div>
        </div>
      </>
    );
}
