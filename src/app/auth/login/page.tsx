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
        <div className="grid grid-cols-1 md:grid-cols-2 bg-[#f1cf2b]">
          <div className="order-last p-16 md:order-first">
            <div className='items-center justify-center'>
              <h1 className="mb-12 text-[28px] font-semibold text-gray-800 items-center justify-center">
                <span className='hidden md:inline-block'>Iniciar sesión</span>
                <span className='md:hidden'>¡Qué bueno verte otra vez!</span>
              </h1>
              <div className=" flex items-center justify-center">
                <LoginForm queryParams={queryParams} />
              </div>
              <div className="mt-14">
                <p className="text-center">
                  <span className="mr-1 text-[#2C1C47]">
                    ¿Aún no tienes una cuenta?
                  </span>
                  <Link
                    className="text-black"
                    href={`/auth/sign-up${queryParams}`}>
                    Regístrate gratis
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div
            className="flex h-[227px] items-center justify-center bg-[#2C1C47] bg-center text-[64px] font-bold leading-[64px] text-white md:h-full md:min-h-[100vh]">
            <p className="hidden text-center md:block">
              ¡Qué bueno verte otra vez!
            </p>
          </div>
        </div>
      </>
    );
}
