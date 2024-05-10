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
import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import {
  ArrowPathIcon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
} from '@heroicons/react/24/outline'

export default function SideNavbarClientDashboard() {
    const solutions = [
        { name: 'Procesos', description: 'procesos', href: '#', icon: ChartPieIcon },
        { name: 'Procesos', description: 'procesos', href: '#', icon: CursorArrowRaysIcon },
        { name: 'Procesos', description: 'procesos', href: '#', icon: FingerPrintIcon },
        { name: 'Procesos', description: 'procesos', href: '#', icon: SquaresPlusIcon },
        { name: 'Procesos', description: 'procesos', href: '#', icon: ArrowPathIcon },
      ]
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
                flex h-[684px] w-[66px] flex-col bg-white fixed top-[88px]"
                style={{ width: '66px' }}>
                <div className="mb-[3px] ml-[21px] mt-0 h-max cursor-pointer">
                        <div className="relative">
                        <Popover>
                            <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
                            <span>Menu</span>
                            <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                            </Popover.Button>

                            <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1">
                            <Popover.Panel className="w-screen max-w-md px-0 sm:px-0 divide-x divide-gray-900/5 bg-gray-50">
                                <div className="overflow-hidden rounded-lg bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                                    <div className="p-4">
                                        {solutions.map((item) => (
                                        <div key={item.name} className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
                                            <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                            <item.icon className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" aria-hidden="true" />
                                            </div>
                                            <div>
                                            <a href={item.href} className="font-semibold text-gray-900">
                                                {item.name}
                                                <span className="absolute inset-0" />
                                            </a>
                                            <p className="mt-1 text-gray-600">{item.description}</p>
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                            </Popover.Panel>
                            </Transition>
                        </Popover>
                        </div>
                </div>
            </div>
        </>
    );
}
