'use client';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function TopNewMenuClientDashboard() {
    return (
        <>
            <div className="flex flex-row items-center justify-between fixed bg-white w-full bottom border-b-4">
                <div className="justify-left flex w-full items-center pb-7 pl-12 pt-9">
                    <div className="">
                        <Image
                            src="/logos/Lg_JIso.svg"
                            alt="Logo"
                            width={180}
                            height={29}
                        />
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
                    <div className="mr-[36px] text-black">
                        <i className=" text-black fas fa-bell ml-1"></i>
                    </div>
                    <div className="font-semibold text-[14px] text-darkJupiter">
                        <div>
                            <Menu as="div" className="relative inline-block text-left">
                                <div>
                                    <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-full bg-white text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50">
                                        <i className="text-black fa fa-user ml-1" style={{ fontSize: '20px', width: '20px', height: '20px' }}></i>
                                    </Menu.Button>
                                </div>

                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-[324px] origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <div className={`flex pl-[90px] mb-[25px] pt-[50px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                                                        <Image
                                                            className='mr-[30px]'
                                                            src="/svg/icons/accountSett.svg"
                                                            alt="Logo de Paypal"
                                                            width={21}
                                                            height={18}
                                                        />
                                                        <a href="/user/account">Cuenta</a>
                                                    </div>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <div className={`flex pl-[90px] my-[25px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                                                        <Image
                                                            className='mr-[30px]'
                                                            src="/svg/icons/settings.svg"
                                                            alt="Logo de Paypal"
                                                            width={17}
                                                            height={18}
                                                        />
                                                        <a href="/user/settings">Configuración</a>
                                                    </div>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <div className={`flex pl-[90px] my-[25px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                                                        <Image
                                                            className='mr-[30px]'
                                                            src="/svg/icons/help.svg"
                                                            alt="Logo de Paypal"
                                                            width={17}
                                                            height={17}
                                                        />
                                                        <a href="/user/help">Ayuda</a>
                                                    </div>
                                                )}
                                            </Menu.Item>
                                            <form method="POST" action="#">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <div className={`flex pl-[90px] mt-[25px] mb-[50px] ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                                                            <Image
                                                                className='mr-[30px]'
                                                                src="/svg/icons/logOut.svg"
                                                                alt="Logo de Paypal"
                                                                width={15}
                                                                height={17}
                                                            />
                                                            <button type="submit">
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
