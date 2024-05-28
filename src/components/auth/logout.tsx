"use client";
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/navigation';
import { authState, defaultState } from '@/state/auth';

export default function Logout() {
    const [_, setAuth] = useRecoilState(authState);
    const router = useRouter();

    useEffect(() => {
        setAuth(defaultState);
        router.push(`/`);
    }, [setAuth, router]);
    return null; 
}