'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { authState } from '@/state/auth';
import { toast } from 'react-toastify';
import { PiSpinnerGapBold } from 'react-icons/pi';
import useApi from '@/hooks/useApi';
import Spinner from '@/components/misc/spinner';
import SideNavbarClientDashboard from '@/components/misc/sideBar';
import TopNavbar from '@/components/misc/topMenu';
import TanStackTable from '@/components/table/table';

export default function Page({ }) {

    const [authStateValue, setAuth] = useRecoilState(authState);
    const router = useRouter();
    const api = useApi();
    const effectMounted = useRef(false);
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (effectMounted.current === false) {
            const storedToken = localStorage.getItem('token');
            const storedPermissions = localStorage.getItem('permissions');

            if (!authStateValue.loggedIn) {
                toast.error('Sin autenticación');
                router.push('/auth/login');
                return;
            }

            if (storedPermissions) {
                const parsedPermissions = JSON.parse(storedPermissions);
                setPermissions(parsedPermissions);

                if (parsedPermissions.Type === 5) {
                    router.push('/dashboard/home');
                    return;
                }
            }

            setAuth(prevState => ({
                ...prevState,
                token: storedToken
            }));

            api.post('/user/auth/state', { token: storedToken })
                .then((response) => {
                    const permissions = response.data.permissions[0];
                    localStorage.setItem('permissions', JSON.stringify(permissions));
                    setPermissions(permissions);

                    if (permissions.Type === 5) {
                        router.push('/dashboard/home');
                    } else {
                        setLoading(false);
                    }
                })
                .catch((error) => {
                    console.error("Error al enviar el token:", error);
                    toast.error('Error al enviar el token');
                    setLoading(false);
                });

            effectMounted.current = true;
        }
    }, [authStateValue.loggedIn, router, setAuth, api]);

    if (loading) {
        return                         <>
        <p className="mt-[100px] text-center">Por favor espere...</p>
        <div className=" flex justify-center">
            <PiSpinnerGapBold
                className="animate-spin"
                size={32}
            />
        </div>
    </>;
    }

    return (
        <div>
            <div className='flex'>
                <TopNavbar />
                <SideNavbarClientDashboard />
                <TanStackTable />
            </div>
        </div>
    );
}
