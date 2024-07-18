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
    const api = useApi();
    const router = useRouter();

    const showToast = (type: 'success' | 'error', message: string) => {
        toast[type](message, {
            position: 'top-center',
            autoClose: 2000,
        });
    };

    useEffect(() => {
        if (effectMounted.current === false) {
            let storedToken = localStorage.getItem('token');
            const controller = new AbortController();
            setIsLoading(true);
            if (token) {
                setAuth({
                    loggedIn: true,
                    token: token,
                    refresh_token: null,
                    verified: null,
                });
                api.post('/user/auth/state', { token: storedToken })
                    .then((response) => {
                        const permissions = response.data.permissions[0];
                        setAuth((prevState: any) => ({
                            ...prevState,
                            token: storedToken
                        }));
                        localStorage.setItem('permissions', JSON.stringify(permissions));
                        
                        if (permissions.ISO === 0) {
                            router.push('/auth/login');
                            showToast('error','No tienes acceso a este servicio');
                        } else if (permissions.Type === 5) {
                            router.push('/dashboard/home');
                            showToast('success','Autenticación completada.');
                        } else {
                            router.push('/dashboard/table');
                            showToast('success','Autenticación completada.');
                        }
                        
                    })
                    .catch((error) => {
                        console.error("Error al enviar el token:", error);
                        showToast('error','Error al enviar el token');
                        setFailed(true);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            } else {
                setFailed(true);
            }
            effectMounted.current = true;
        }
    }, [setAuth, router, token, api]);

    return (
        <>
            <div className="p-4 md:p-8 lg:p-16">
                <div>
                    <h1 className="mb-6 text-center">
                        Completando autenticación
                        <PiSpinnerGapBold
                            className="animate-spin"
                            size={32}
                        />
                    </h1>
                    {isLoading ? (
                        <>
                            <p className="text-center">Por favor espere...</p>
                            <div className="flex justify-center">
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
