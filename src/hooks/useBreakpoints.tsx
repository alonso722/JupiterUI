'use client';
import { useEffect, useRef, useState } from 'react';

export enum breakpoints {
    'sm' = 640,
    'md' = 768,
    'lg' = 1024,
    'xl' = 1280,
    '2xl' = 1536,
}

export default function useBreakpoints() {
    const [breakpoint, setBreakpoint] = useState<breakpoints | null>(null);

    useEffect(() => {
        function handleWindowResize() {
            const ws = getWindowSize();
            const width = ws.innerWidth;
            if (width <= breakpoints.sm) {
                setBreakpoint(breakpoints.sm);
            } else if (width <= breakpoints.md) {
                setBreakpoint(breakpoints.md);
            } else if (width <= breakpoints.lg) {
                setBreakpoint(breakpoints.lg);
            } else {
                setBreakpoint(breakpoints['2xl']);
            }
        }

        const timeout = setTimeout(handleWindowResize, 50)
        window.addEventListener('resize', handleWindowResize);

        return () => {
            clearTimeout(timeout)
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return {
        breakpoint,
    };
}

function getWindowSize() {
    const { innerWidth, innerHeight } = window;
    return { innerWidth, innerHeight };
}
