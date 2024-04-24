'use client';
import React, { useEffect, useState } from "react";
  import Link from 'next/link';
  import Image from 'next/image';
  import LandingNav from "./landing/landingNav"; 
  interface Organization {
    id: number;
    name: string;
  }
  
  function Index() {
    const [organizationData, setOrganizationData] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mountCount, setMountCount] = useState(0);
  
    useEffect(() => {
      fetchOrganizationData();
    }, []);
    
    useEffect(() => {
      setMountCount((prevCount) => prevCount + 1);
    }, []);
  
    const fetchOrganizationData = () => {
      fetch("http://localhost:8070/organizations")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          console.log("Frontend response received:", response);
          return response.json();
        })
        .then((data: Organization[]) => {
          console.log("Frontend data received:", data);
          setOrganizationData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Frontend error:", error);
          setError(error.message);
          setLoading(false);
        });
    };
  
    if (error) {
      return <div>Error: {error}</div>;
    }
  
    return (
      <>
        <div>
          <LandingNav />
          <div className="pl-[99px] pt-[239px] font-bold bg-[#FDD500]">
            <div>
              <p className="mb-0 pb-0 text-[64px] leading-normal">
                Bienvenido
              </p>
              <p className="mt-[20px] pt-0 text-[32px] leading-[32px]">
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
              <p className="mt-[20px] text-center text-[32px]">
                Obtén beneficios para tu empresa
              </p>
            </div>
            <div>
              <div className="mb-[75px] flex items-center justify-center">
              </div>
            </div>
          </div>
          <div>
            <h1>Organization IDs</h1>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div>
                <ul>
                  {organizationData.map((org) => (
                    <li key={org.id}>{org.id}: {org.name}</li>
                  ))}
                </ul>
                <Link  href={'/auth/login'}>
                  Create an account
                </Link>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
  
  export default Index;
