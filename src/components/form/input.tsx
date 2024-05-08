'use client';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { type IconType } from 'react-icons';

import FormError from './formError'; 

interface InputProps {
    type?: 'text' | 'email' | 'search' | 'password' | 'file';
    value?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    id?: string;
    name?: string;
    error?: string | null;
    placeholder?: string;
    className?: string;
    maxLength?: number;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    isUpperCase?: boolean;
    disabled?: boolean;
    icon?: IconType;
    iconColor?: string;
    onIconClick?: ()=>void
}

export const Input: React.FC<InputProps> = ({
    value,
    onChange,
    type = 'text',
    id,
    placeholder,
    name,
    error = '',
    className = '',
    maxLength,
    onKeyDown,
    isUpperCase = false,
    disabled,
    icon,
    iconColor='#2C1C47',
    onIconClick
}) => {
    const [computedClass, setComputedClass] = useState<string>('');

    useEffect(() => {
        let baseClass = '';
        if (error) {
            baseClass += 'border-red-500';
        } else {
            baseClass += 'border-gray-500';
        }
        setComputedClass(baseClass);
    }, [error]);

    return (
        <>
            <div className='relative w-full flex'>
                <input
                    name={name}
                    type={type}
                    maxLength={maxLength}
                    onChange={onChange}
                    value={value}
                    className={`rounded-md border-none ${
                        isUpperCase ? 'uppercase placeholder:normal-case' : ''
                    } bg-camposDark ${className} min-h-[41px] p-2 w-full ${computedClass}`}
                    id={id}
                    placeholder={placeholder}
                    onKeyDown={onKeyDown}
                    disabled={disabled}
                />
                {icon && <span onClick={()=>{
                    if (onIconClick){
                        onIconClick();
                    }
                }} style={{
                    position: 'absolute',
                    right: "16px",
                    top: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: "px"
                }}>{React.createElement(icon, {
                    size: 24,
                    color: iconColor
                })}</span>}
            </div>
            <FormError error={error} />
        </>
    );
};
