'use client';
import Link from 'next/link';

interface LinkProps {
    href: string;
    className?: string;
    children: React.ReactNode;
}

export const CLink: React.FC<LinkProps> = ({ href, className, children }) => {
    return (
        <>
            <Link
                href={href}
                className={`text-[#777E90] underline ${className}`}>
                {children}
            </Link>
        </>
    );
};
