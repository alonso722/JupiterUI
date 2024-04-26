"use client";
import React from 'react'
import { RecoilRoot } from 'recoil'

interface IRecoilRootWrapperProps {
    children: React.ReactNode
}

export default function RecoilRootWrapper({ children } : IRecoilRootWrapperProps ) {
    return <RecoilRoot>{children}</RecoilRoot>
}