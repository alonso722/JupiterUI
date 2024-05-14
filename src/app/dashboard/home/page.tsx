'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
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
    console.log("el auth",authStateValue)
    const router = useRouter();
    const effectMounted = useRef(false);

    useEffect(() => {
        console.log(effectMounted.current)
        if(effectMounted.current === false ){
        if (!authStateValue.loggedIn) {
            toast.error('Sin autenticación');
            router.push('/auth/login');
        }
        return () =>{
            effectMounted.current=true;
        }
    }
    }, []);

    return (
        <div className="bg-[#FDD500] ">
            <div className="flex bg-[#FDD500]">
                <div>
                    <TopNavbar />
                    <SideNavbarClientDashboard />
                </div>
                <div className="ml-4">
                    <div className='left-[100px] top-[108px] bg-zinc-500 p-5 '>
                        <TextEditor></TextEditor>
                    </div>
                </div>
            </div>
        </div>
    );
}
