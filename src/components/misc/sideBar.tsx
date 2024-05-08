'use client';

import animejs from 'animejs';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import { AiFillCloseSquare } from 'react-icons/ai';
import { useRecoilValue } from 'recoil';

import useBreakpoints, { breakpoints } from '@/hooks/useBreakpoints';

import { useNavigationContext } from '@/context/navigationContext';
import { authState, tokenData } from '@/state/auth';

import { allMenuItemsClient } from './allMenuItemsDashboard';
import { SideBarItemContent } from './sideBarItem';
import { MenuItem } from '../types/menu';

export default function SideNavbarClientDashboard() {
    const sidebarDivRef = useRef<HTMLDivElement>(null);
    const [isAbsolute, setIsAbsolute] = useState<boolean>(false);
    const [showLabels, setShowLabels] = useState<boolean>(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    const { setIsExpanded } = useNavigationContext();
    const auth = true;
    const nav = useNavigationContext();
    const { breakpoint } = useBreakpoints();

    useEffect(() => {
        if (auth) {
            const newMenuItems: MenuItem[] = [];
            newMenuItems.push(allMenuItemsClient.home);
            newMenuItems.push(allMenuItemsClient.shopping);
            newMenuItems.push(allMenuItemsClient.paymentMethod);
            setMenuItems(newMenuItems);
        }
    }, [auth]);

    const expand = useCallback(() => {
        if (sidebarDivRef.current) {
            const styles = sidebarDivRef.current.style;
            if (isAbsolute) {
                styles.position = 'fixed';
                animejs({
                    targets: sidebarDivRef.current,
                    width: '100vw',
                    height: '100%',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 0,
                    easing: 'linear',
                    duration: 250,
                    update(anim) {
                        const progress = anim.progress;
                        if (progress > 50 && progress < 60) {
                            setShowLabels(true);
                        }
                    },
                });
            } else {
                animejs({
                    targets: sidebarDivRef.current,
                    width: '275px',
                    position: 'relative',
                    duration: 250,
                    easing: 'linear',
                    update: (anim) => {
                        const progress = anim.progress;
                        if (progress > 50 && progress < 60) {
                            setShowLabels(true);
                        }
                    },
                });
            }
        }
    }, [sidebarDivRef, isAbsolute]);

    const collapse = useCallback(() => {
        if (sidebarDivRef.current) {
            if (isAbsolute) {
                animejs({
                    targets: sidebarDivRef.current,
                    width: '66px',
                    easing: 'easeOutElastic',
                    duration: 150,
                    complete() {
                        setShowLabels(false);
                    },
                });
            } else {
                animejs({
                    targets: sidebarDivRef.current,
                    width: '66px',
                    duration: 250,
                    easing: 'linear',
                    update: (anim) => {
                        const progress = anim.progress;
                        if (progress > 50 && progress < 60) {
                            setShowLabels(false);
                        }
                    },
                });
            }
        }
    }, [sidebarDivRef, isAbsolute]);

    useEffect(() => {
        const to = setTimeout(() => {
            setIsAbsolute(breakpoints.sm == breakpoint);
            if (nav.isExpanded) {
                expand();
            } else {
                collapse();
            }
        }, 300);
        return () => {
            clearTimeout(to);
        };
    }, [breakpoint, nav.isExpanded, expand, collapse]);

    useEffect(() => {
        let documentElement: HTMLElement | null = document.documentElement;
        let body: HTMLElement | null = document.body;

        if (documentElement != null) {
            if (nav.isExpanded) {
                // Remove the scroll
                documentElement.style.overflow = 'hidden';
                body.style.overflow = 'hidden';
            } else {
                // Undo what we did in the if.
                documentElement.style.overflow = '';
                body.style.overflow = '';
            }
        }

        return () => {
            if (documentElement != null) {
                documentElement.style.overflow = '';
                documentElement = null;
            }
            if (body != null) {
                body.style.overflow = '';
                body = null;
            }
        };
    }, [nav.isExpanded]);

    return (
        <>
            <div
                ref={sidebarDivRef}
                className="shadow-sideNavbarClients 
                flex h-[684px] w-[66px] flex-col bg-white fixed top-[98px]"
                style={{ width: '66px' }}
            >
                <div
                    className="mb-[33px] ml-[21px] mt-8 h-max cursor-pointer"
                    onClick={() => {
                        setIsExpanded((prevValue: boolean) => {
                            return !prevValue;
                        });
                    }}
                >
                    <span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="23"
                            height="15"
                            viewBox="0 0 23 15"
                            fill="none"
                        >
                            <path
                                d="M0 0H23V2.44922H0V0ZM0 6.12305H23V8.57227H0V6.12305ZM0 12.2461H23V14.6953H0V12.2461Z"
                                fill="#2C1C47"
                            />
                        </svg>
                    </span>
                </div>
                <div>
                    {isAbsolute && nav.isExpanded && (
                        <div className="flex justify-end p-3 text-white">
                            <AiFillCloseSquare
                                size={48}
                                className="cursor-pointer text-white hover:text-red-500"
                                onClick={() => nav.setIsExpanded(false)}
                            />
                        </div>
                    )}
                    <nav>
                        <ul className="mt-2">
                            {menuItems.map((item, idx) => {
                                return (
                                    item != null && (
                                        <li
                                            key={`menu-item-${idx}`}
                                            className="mb-1"
                                        >
                                            {Array.isArray(item.subItems) ? (
                                                <>
                                                    <span>
                                                        <SideBarItemContent
                                                            item={item}
                                                            showLabel={
                                                                showLabels
                                                            }
                                                            isClient={true}
                                                        />
                                                    </span>
                                                </>
                                            ) : (
                                                <Link href={item.to || '#'}>
                                                    <SideBarItemContent
                                                        item={item}
                                                        showLabel={showLabels}
                                                        isClient={true}
                                                    />
                                                </Link>
                                            )}
                                        </li>
                                    )
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}
