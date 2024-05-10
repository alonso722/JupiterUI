'use client';
import React, { createContext, useContext, useState } from 'react';

export interface INavigationContextProps {
    children: React.ReactNode;
}

export interface INavigationContext {
    isExpanded: boolean;
    setIsExpanded: {
        (newValue: boolean): void; 
        (callback: (prev: boolean) => boolean): void; 
    };
}

const defaultValue: INavigationContext = {
    isExpanded: false,
    setIsExpanded: () => {
        alert('Menu');
    },
};

const NavigationContext = createContext<INavigationContext>(defaultValue);

export const useNavigationContext = () => {
    return useContext<INavigationContext>(NavigationContext);
};

export const NavigationProvider = ({ children }: INavigationContextProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    return (
        <NavigationContext.Provider
            value={{
                isExpanded,
                setIsExpanded,
            }}>
            {children}
        </NavigationContext.Provider>
    );
};
