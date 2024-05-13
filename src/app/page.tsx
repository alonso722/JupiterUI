'use client';
import React, { useEffect, useState } from "react";
  import Link from 'next/link';
  import Image from 'next/image';
  import LandingNav from "./landing/landingNav"; 

  
  function Index() {
  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mountCount, setMountCount] = useState(0);
  
  
    useEffect(() => {
      setMountCount((prevCount) => prevCount + 1);
    }, []);
  
  
    if (error) {
      return <div>Error: {error}</div>;
    }
  
    return (
      <>
        <div>
          <LandingNav />
          <div className="pl-[99px] pt-[200px] font-bold bg-[#FDD500]">
            <div>
              <p className="mb-0 pb-0 text-[64px] leading-normal">
                Bienvenido
              </p>
              <p className="mt-[20px] pt-0 text-[32px] leading-[32px] pb-[50px]">
                A la plataforma más completa
                <br />
              </p>
            </div>
          </div>
          <div className="bg-[#2C1C47] text-white">
            <div>
              <div className="mb-[75px] flex items-center justify-center">
              </div>
            </div>
            <div className="mb-8">
              <p className="text-center">
                Encuentra el plan que más se adecúe a tus necesidades
              </p>
            </div>
            <div className="mb-[135px] mt-[84px]">
              <p className="text-center text-[24px] font-normal">
                Únete a Júpiter ISO                
              </p>
              <p className="mt-[20px] text-center text-[32px] pb-[25px]">
                Obtén beneficios para tu empresa
              </p>
            </div>
            <p className="text-[#2C1C47]">
                .
              </p>
          </div>
        </div>
      </>
    );
  }
  
  export default Index;
