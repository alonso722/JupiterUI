'use client';
import animejs from 'animejs';
import React, { useEffect, useRef } from 'react';
import { IconType } from 'react-icons';
import { useRecoilValue } from 'recoil';

import { useNavigationContext } from '@/context/navigationContext';

//import { allMenuItems } from './allMenuItemsDashboard';
import { MenuItem } from '../types/menu';

interface SideBarItemContentProps {
    item: MenuItem;
    showLabel?: boolean;
    isClient?: boolean;
}

import { AiFillHome } from 'react-icons/ai';

export function SideBarItemContent({
    item,
    isClient = true,
}: SideBarItemContentProps) {
    const { isExpanded } = useNavigationContext();
    const labelRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (labelRef.current) {
            const el = labelRef.current;
            if (isExpanded) {
                el.style.display = '';
                animejs({
                    targets: el,
                    opacity: 1,
                    duration: 600,
                    easing: 'easeInElastic',
                });
            } else {
                animejs({
                    targets: el,
                    opacity: 0,
                    complete() {
                        el.style.display = 'none';
                    },
                    duration: 100,
                    easing: 'linear',
                });
            }
        }
    }, [isExpanded]);

    return (
        <>
            <span
                className={`${
                    isClient ? '' : 'hover:bg-dark'
                } flex cursor-pointer flex-row items-center p-2 ${
                    isClient ? 'text-black' : 'text-white'
                }`}>
                {React.createElement(AiFillHome, {
                    size: 24,
                    className: `hover:fill-text-#3850FB ${
                        isClient
                            ? item.label == 'Mis métodos de pago'
                                ? 'p-3'
                                : 'p-4'
                            : ''
                    } hover:text-#3850FB`,
                })}
                <span
                    style={{ display: 'none', opacity: 0 }}
                    ref={labelRef}
                    className={`ml-4 mt-2 ${
                        isClient ? 'hover:text-azulJSuite' : ''
                    }`}>
                    {item.label}
                </span>
            </span>
        </>
    );
}