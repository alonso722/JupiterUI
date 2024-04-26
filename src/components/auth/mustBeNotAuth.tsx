'use client';

import { redirect } from 'next/navigation';
import { useRecoilValue } from 'recoil';

import { loggedInState, tokenData } from '@/state/auth';

export default function MustBeNotAuth() {
    const loggedIn = useRecoilValue(loggedInState);
    const auth = useRecoilValue(tokenData);
    // return (
    //     <>
    //         {auth?.role == 'admin'
    //             ? loggedIn && redirect('/dashboard')
    //             : loggedIn && auth?.verified
    //             ? redirect('/user')
    //             : loggedIn && redirect('/validate-user')}
    //     </>
    // );
}
