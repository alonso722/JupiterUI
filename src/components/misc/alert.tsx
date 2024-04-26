import React from 'react';
import { IconType } from 'react-icons';

import { getBgColor } from '@/utils/colorResolver';

import { colors } from '../types/enums/colors';

interface IAlertProps {
    children: React.ReactNode;
    color?: colors;
    icon?: IconType;
    className?: string,
}

export default function Alert({
    children,
    color = colors.DANGER,
    icon,
    className=''
}: IAlertProps) {
    return (
        <>
            <div className={`flex rounded-lg p-4 shadow-md ${getBgColor(color)} ${className}`}>
                {icon ? (
                    <div className='flex items-center'>
                        {React.createElement(icon, {
                            size: '32',
                            className: 'mr-3'
                        })}
                        {children}
                    </div>
                ) : (
                    <>{children}</>
                )}
            </div>
        </>
    );
}
