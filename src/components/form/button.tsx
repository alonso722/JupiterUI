'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { PiSpinnerGapBold } from 'react-icons/pi';

import { getBgColor } from '@/utils/colorResolver'; 

import { colors } from '../types/enums/colors';

interface ButtonProps {
    children: React.ReactNode;
    disabled?: boolean;
    color?: colors;
    customBgColor?: string;
    customTextColor?: string;
    type?: 'submit' | 'button';
    isLoading?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    href?: string;
    className?: string;
    rounded?: boolean;
    small?: boolean;
    border?: boolean;
    padding?: boolean;
}

export const Button: React.FC<ButtonProps> = (props) => {
    const router = useRouter();

    const {
        disabled,
        children,
        color = colors.PRIMARY,
        type = 'button',
        isLoading = false,
        onClick,
        href,
        rounded = false,
        className = '',
        customTextColor,
        small = false,
        border = true,
        padding = true,
    } = props;

    const customBgColor = props.customBgColor;

    function getColor() {
        if (customBgColor && customTextColor) {
            const str = `bg-[${customBgColor}] text-[${customTextColor}]`;
            return str;
        }
        return disabled ? getBgColor(colors.MUTED) : getBgColor(color);
    }

    return (
        <button
            type={type}
            onClick={(evt) => {
                if (href) {
                    router.push(href);
                } else if (typeof onClick == 'function' && !isLoading) {
                    onClick(evt);
                }
            }}
            disabled={disabled}
            className={`
            ${rounded ? 'rounded-full' : 'rounded-md'} 
            flex ${small ? 'md:h-10' : 'md:h-12'} items-center justify-center ${
                border ? 'border border-gray-600' : ''
            } ${padding ? 'md:px-6 md:py-2' : ''}  ${getColor()} ${className}`}
        >
            {children}
            {isLoading && (
                <PiSpinnerGapBold className="ml-1 animate-spin text-white" />
            )}
        </button>
    );
};
