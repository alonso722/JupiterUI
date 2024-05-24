'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { authState } from '@/state/auth';
import { toast } from 'react-toastify';
import axios from 'axios';
import useApi from '@/hooks/useApi';

import SideNavbarClientDashboard from '@/components/misc/sideBar';
import TopNavbar from '@/components/misc/topMenu';
import Kanban from '@/components/kanban/columns';

export default function Page({ }) {

    const [authStateValue, setAuth] = useRecoilState(authState);
    const router = useRouter();
    const api= useApi();
    const effectMounted = useRef(false);

    useEffect(() => {    
        if (effectMounted.current === false) {        
            const storedToken = localStorage.getItem('token');
            const storedPermissions = localStorage.getItem('permissions'); 
    
            if (!authStateValue.loggedIn) {
                toast.error('Sin autenticación');
                router.push('/auth/login');
            } else {
                api.post('/user/auth/state', { token: storedToken })
                    .then((response) => {
                        const permissions = response.data.permissions[0];
                        setAuth((prevState: any) => ({
                            ...prevState,
                            token: storedToken
                        }));
                        localStorage.setItem('permissions', JSON.stringify(permissions));
                    })
                    .catch((error) => {
                        console.error("Error al enviar el token:", error);
                        toast.error('Error al enviar el token');
                    });
            }
            effectMounted.current = true;
        }
    }, [authStateValue.loggedIn, router, setAuth]);
    

    return (
        <div>
            <div className='flex'>
                <TopNavbar />                
                <SideNavbarClientDashboard />
                <Kanban/>
            </div>
        </div>
    );
}
