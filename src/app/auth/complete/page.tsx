'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { PiSpinnerGapBold } from 'react-icons/pi';
import { PiWarningBold } from 'react-icons/pi';
import { toast } from 'react-toastify';
import { useRecoilState } from 'recoil';
import Spinner from '@/components/misc/spinner';
import useApi from '@/hooks/useApi';

import { CLink } from '@/components/link'; 
import Alert from '@/components/misc/alert';

import { authState } from '@/state/auth';

export default function CompleteAuth({
    searchParams: { token, password, callback },
}: {
    searchParams: { token?: string; password?: string; callback?: string };
}) {
    const [_, setAuth] = useRecoilState(authState);
    const [failed, setFailed] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const effectMounted = useRef(false);

    const router = useRouter();

    useEffect(() => {
        if(effectMounted.current === false ){
        const controller = new AbortController();
        setIsLoading(true);
        if (token) {
            setAuth({
                loggedIn: true,
                token: token,
                refresh_token: null,
                verified: null,    
            });
            router.push('/dashboard/home');
            toast.success('Autenticación completada.');
        } else {
            setFailed(true);
        }
        return()=>{
            effectMounted.current=true;
        }
    }
    }, [setAuth, router]);

    return (
        <>
            <div className="p-4 md:p-8 lg:p-16">
                <div>
                    <h1 className="mb-6 text-center">
                        Completando autenticación
                    </h1>
                    {isLoading ? (
                        <>
                            <p className="text-center">Por favor espere...</p>
                            <div className="flex justify-center">
                                <PiSpinnerGapBold
                                    className="animate-spin"
                                    size={32}
                                />
                                <Spinner />
                            </div>
                        </>
                    ) : (
                        <>
                            {failed ? (
                                <>
                                    <Alert icon={PiWarningBold}>
                                        <p>
                                            Ocurrión un error al intentar
                                            completar la autenticación.
                                            <br />
                                        </p>
                                    </Alert>
                                    <p className="my-3 text-center">
                                        <CLink
                                            href={`/auth/login/${
                                                callback
                                                    ? '?callback=' + callback
                                                    : ''
                                            }`}>
                                            Intentar de nuevo
                                        </CLink>
                                    </p>
                                </>
                            ) : (
                                <></>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
