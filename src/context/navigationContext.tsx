'use client';
import React, { createContext, useContext, useState } from 'react';

export interface INavigationContextProps {
    children: React.ReactNode;
}

export interface INavigationContext {
    isExpanded: boolean;
    setIsExpanded: {
        (newValue: boolean): void; // Aceptar un nuevo valor booleano
        (callback: (prev: boolean) => boolean): void; // Se puede aceptar un callback con el valor anterior.
    };
}

const defaultValue: INavigationContext = {
    isExpanded: false,
    setIsExpanded: () => {
        alert('Function not implemented yet.');
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
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
};
