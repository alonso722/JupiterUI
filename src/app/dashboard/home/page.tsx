'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { authState } from '@/state/auth';
import { toast } from 'react-toastify';

import SideNavbarClientDashboard from '@/components/misc/sideBar';
import TopNavbar from '@/components/misc/topMenu';
import TextEditor from '@/components/editor/editor';

export default function Page({ }) {
    // const token = localStorage.getItem('token');
    // console.log("extraido del local storage", token)
    const [authStateValue, setAuth] = useRecoilState(authState);
    console.log(authStateValue)
    const router = useRouter();

    useEffect(() => {
        if (!authStateValue.loggedIn) {
            toast.error('Sin autenticación');
            router.push('/auth/login');
        }
    }, [authStateValue.loggedIn, router]);

    return (
        <>     
        <div className="flex">
        <div>
            <TopNavbar />
            <SideNavbarClientDashboard />
        </div>
        <div className="ml-4">
            <div className='left-[100px] top-[108px]'>
            <TextEditor></TextEditor>
            </div>
        </div>
        </div>

        </>
    );
}
