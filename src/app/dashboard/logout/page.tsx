'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { authState } from '@/state/auth';
import Spinner from '@/components/misc/spinner';
import Logout from '@/components/auth/logout'; 

export default function Page() {
    const [authStateValue, setAuth] = useRecoilState(authState);
    const [isLoading, setIsLoading] = useState<boolean>(true); 

    const router = useRouter();

    useEffect(() => {
        setAuth((prevAuthState: any) => ({
            ...prevAuthState,
            loggedIn: false 
        }));

        const timer = setTimeout(() => {
            setIsLoading(false); 
            router.push('/auth/login'); 
        }, 3000); 

        return () => clearTimeout(timer);
    }, [setAuth, router]);

    return (
        <>
            <h1 className='my-3 text-center'>Espere...</h1>
            <p className='text-center'>
                Su sesión se está cerrando. <br />
                Por favor espere hasta que se le redirija a la pantalla de
                inicio de sesión.
            </p>
            <div className='flex justify-center py-3'>
                <Spinner />
            </div>
            <Logout /> 
        </>
    );
}
