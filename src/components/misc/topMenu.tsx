'use client';
'use client';
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
//import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Image from 'next/image';
import Link from 'next/link';
import { classNames } from '@react-pdf-viewer/core';

//<ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
export default function TopNewMenuClientDashboard() {
    return (
        <>
            <div className="flex flex-row items-center justify-between fixed bg-white w-full">
                <div
                    className="justify-left flex w-full items-center pb-7 pl-12 
                        pt-9"
                >
                    <div className="">
                    <Image
                        src="/logos/Lg_JIso.svg"
                        alt="Logo"
                        width={180}
                        height={29}/>
                    </div>
                </div>
                <div className="mr-[37px] flex h-11 w-[346px] flex-row items-center">
                    <div className="mr-[47px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="19"
                            viewBox="0 0 18 19"
                            fill="none"
                        >
                            <path
                                d="M6.5 0.598633C8.22391 0.598633 9.87721 1.28345 11.0962 2.50244C12.3152 3.72143 13 5.37473 13 7.09863C13 8.70863 12.41 10.1886 11.44 11.3286L11.71 11.5986H12.5L17.5 16.5986L16 18.0986L11 13.0986V12.3086L10.73 12.0386C9.59 13.0086 8.11 13.5986 6.5 13.5986C4.77609 13.5986 3.12279 12.9138 1.90381 11.6948C0.684819 10.4758 0 8.82254 0 7.09863C0 5.37473 0.684819 3.72143 1.90381 2.50244C3.12279 1.28345 4.77609 0.598633 6.5 0.598633ZM6.5 2.59863C4 2.59863 2 4.59863 2 7.09863C2 9.59863 4 11.5986 6.5 11.5986C9 11.5986 11 9.59863 11 7.09863C11 4.59863 9 2.59863 6.5 2.59863Z"
                                fill="#2C1C47"
                            />
                        </svg>
                    </div>
                    <Link
                        href="/user"
                        className="text-azulJSuite mr-[38px] text-base font-bold leading-4"
                    >
                        Inicio
                    </Link>
                    <Link
                        href="/"
                        className="text-muted mr-[38px] text-base font-normal leading-4"
                    >
                        Productos
                    </Link>
                    <div className="mr-[36px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="21"
                            viewBox="0 0 18 21"
                            fill=""
                        >
                            <path
                                d="M7 19H11C11 20.1 10.1 21 9 21C7.9 21 7 20.1 7 19ZM18 17V18H0V17L2 15V9C2 5.9 4 3.2 7 2.3V2C7 0.9 7.9 0 9 0C10.1 0 11 0.9 11 2V2.3C14 3.2 16 5.9 16 9V15L18 17ZM14 9C14 6.2 11.8 4 9 4C6.2 4 4 6.2 4 9V16H14V9Z"
                                fill="#B5B5BD"
                            />
                        </svg>
                    </div>
                    <div className="font-semibold  text-[14px] text-darkJupiter">
                        <div>
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-full bg-white  text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="29"
                                    viewBox="0 0 28 29"
                                    fill="none"
                                >
                                    <path
                                        d="M14 24.94C10.5 24.94 7.406 23.084 5.6 20.3C5.642 17.4 11.2 15.805 14 15.805C16.8 15.805 22.358 17.4 22.4 20.3C20.594 23.084 17.5 24.94 14 24.94ZM14 4.35C15.1139 4.35 16.1822 4.8083 16.9698 5.62409C17.7575 6.43987 18.2 7.54631 18.2 8.7C18.2 9.85369 17.7575 10.9601 16.9698 11.7759C16.1822 12.5917 15.1139 13.05 14 13.05C12.8861 13.05 11.8178 12.5917 11.0302 11.7759C10.2425 10.9601 9.8 9.85369 9.8 8.7C9.8 7.54631 10.2425 6.43987 11.0302 5.62409C11.8178 4.8083 12.8861 4.35 14 4.35ZM14 0C12.1615 0 10.341 0.375054 8.64243 1.10375C6.94387 1.83244 5.40053 2.9005 4.1005 4.24695C1.475 6.96623 0 10.6544 0 14.5C0 18.3456 1.475 22.0338 4.1005 24.753C5.40053 26.0995 6.94387 27.1676 8.64243 27.8963C10.341 28.6249 12.1615 29 14 29C17.713 29 21.274 27.4723 23.8995 24.753C26.525 22.0338 28 18.3456 28 14.5C28 6.4815 21.7 0 14 0Z"
                                        fill="black"
                                    />
                                </svg>
                                </Menu.Button>
                            </div>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95">
                                <Menu.Items className="absolute  right-0 z-10 mt-2 w-[324px]  origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <div className='flex pl-[90px] mb-[25px] pt-[50px]'>
                                                <Image
                                                    className='mr-[30px]'
                                                    src="/svg/icons/accountSett.svg"
                                                    alt="Logo de Paypal"
                                                    width={21}
                                                    height={18}/>
                                                <a
                                                href="/user/account"
                                                className={classNames(
                                                    { 'bg-gray-100': active, 'text-gray-900': active, 'text-gray-700': !active }
                                                )}>
                                                    Cuenta
                                                </a>
                                            </div>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <div className='flex pl-[90px] my-[25px]'>
                                                <Image
                                                    className='mr-[30px]'
                                                    src="/svg/icons/settings.svg"
                                                    alt="Logo de Paypal"
                                                    width={17}
                                                    height={18}
                                                />
                                                <a
                                                href="/user/settings"
                                                className={classNames(
                                                    { 'bg-gray-100': active, 'text-gray-900': active, 'text-gray-700': !active }
                                                )}>
                                                    Configuración
                                                </a>
                                            </div>
                                        )}
                                    </Menu.Item>
                                    
                                    <Menu.Item>
                                    {({ active }) => (
                                        <div className='flex pl-[90px] my-[25px]'>
                                            <Image
                                                className='mr-[30px]'
                                                src="/svg/icons/help.svg"
                                                alt="Logo de Paypal"
                                                width={17}
                                                height={17}
                                            />
                                                <a
                                            href="/user/help"
                                            className={classNames(
                                                { 'bg-gray-100': active, 'text-gray-900': active, 'text-gray-700': !active }
                                            )}>
                                                Ayuda
                                            </a>
                                        </div>
                                        
                                    )}
                                    </Menu.Item>
                                    <form method="POST" action="#">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <div className=' flex pl-[90px] mt-[25px] mb-[50px]'>
                                                <Image
                                                    className='mr-[30px]'
                                                    src="/svg/icons/logOut.svg"
                                                    alt="Logo de Paypal"
                                                    width={15}
                                                    height={17}
                                                />
                                                <button
                                                type="submit"
                                                className={classNames(
                                                { 'bg-gray-100': active, 'text-gray-900': active, 'text-gray-700': !active }
                                                )}>
                                                    <Link href='/dashboard/logout'>Salir</Link>
                                                </button>  
                                            </div>
                                        )}
                                    </Menu.Item>
                                    </form>
                                </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                        </div>
                    </div>
                </div>
            </div>
            <hr className="dark:bg-camposDark h-1 rounded" />
        </>
    );
}
