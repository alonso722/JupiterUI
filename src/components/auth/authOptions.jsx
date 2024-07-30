'use client';
import React from 'react';
import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';

const options = [
    {
        icon: FaFacebook,
        onClick: () => {},
    },
    {
        icon: FaApple,
        onClick: () => {},
    },
    {
        icon: FaGoogle,
        onClick: () => {
            window.location.href = `#`;
        },
    },
];

export default function AuthOptions() {
    return (
        <div className='grid grid-cols-3 gap-1 max-w-[200px]'>
            {options.map((option, idx) => (
                <div
                    key={`option-${idx}`}
                    onClick={option.onClick}
                    className='flex w-[52px] h-[52px] shadow-socialNetworks rounded-full items-center cursor-pointer justify-center text-[#555555] hover:text-[#000000]'>
                    <div>
                        {React.createElement(option.icon, {
                            size: '24',
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
