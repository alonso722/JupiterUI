'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
    searchParams: { email, password, callback },
}: {
    searchParams: { email?: string; password?: string; callback?: string };
}) {
    const [_, setAuth] = useRecoilState(authState);
    const [failed, setFailed] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const router = useRouter();
    const api = useApi();

    useEffect(() => {
        const controller = new AbortController();
        setIsLoading(true);
        api.post('/user/auth/jwt', {
            email: email,
            password: password,
            signal: controller.signal,
        }).then(({ data }) => {
                if (data.token) {
                    toast.success('Autenticación completada.');
                    setAuth({
                        loggedIn: true,
                        token: data.token,
                        refresh_token: null,
                        verified: null,    
                    });
                    if (callback) {
                        console.log("entra a call 1")
                        setTimeout(() => {
                            // window.location.assign(callback);
                            router.push(callback);
                        });
                    }
                    router.push('/dashboard/home');
                } else {
                    setFailed(true);
                }
            })
            .catch(() => {
                setFailed(true);
            })
            .finally(() => {
                setIsLoading(false);
            });
            console.log("el state",authState)
        return () => {
            controller.abort();
            setFailed(false);
        };
    }, [setAuth, api, callback, router]);

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
                                            }`}
                                        >
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
