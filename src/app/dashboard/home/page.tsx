'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { authState } from '@/state/auth';
import { toast } from 'react-toastify';
import axios from 'axios';
import useApi from '@/hooks/useApi';

import SideNavbarClientDashboard from '@/components/misc/sideBar';
import TopNavbar from '@/components/misc/topMenu';
import Kanban from '@/components/kanban/columns';

export default function Page() {
    const [authStateValue, setAuth] = useRecoilState(authState);
    const router = useRouter();
    const searchParams = useSearchParams();
    const api = useApi();
    const [permissions, setPermissions] = useState([]);
    const effectMounted = useRef(false);
    const process = searchParams.get('process');
    const department = searchParams.get('department');

    const showToast = (type: 'success' | 'error', message: string) => {
        toast[type](message, {
            position: 'top-center',
            autoClose: 2000,
        });
    };

    useEffect(() => {    
        let parsedPermissions;
        if (effectMounted.current === false) {    
            const storedToken = localStorage.getItem('token');
            const storedPermissions = localStorage.getItem('permissions'); 
            if (storedPermissions) {
                parsedPermissions = JSON.parse(storedPermissions);
                setPermissions(parsedPermissions);
            }
            if (!authStateValue.loggedIn) {
                showToast('error','Sin autenticación');
                router.push('/auth/login');
            }
            effectMounted.current = true;
        }
    }, [authStateValue.loggedIn, router, setAuth, searchParams, department, process]);

    return (
        <div>
            <div className='flex'>
                <TopNavbar />                
                <SideNavbarClientDashboard />
                <Kanban departmentFilter={department} processFilter={process} />
            </div>
        </div>
    );
}
