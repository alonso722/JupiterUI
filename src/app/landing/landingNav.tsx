import Image from 'next/image';
import Link from 'next/link';

export default function LandingNav() {
    return (
        <>
            <div className="flex items-center justify-between h-[54px] px-8">
                <div>
                    <Image
                        src="/logos/Lg_JIso.svg"
                        alt="Logo"
                        width={180}
                        height={29}/>
                </div>
                <div className="flex gap-6">
                    <ul className="flex gap-6">
                        <li>
                            <Link href={'/'}>Inicio</Link>
                        </li>
                        <li>
                            <Link href={'/landing/about-us'}>Nosotros</Link>
                        </li>
                        <li>
                            <Link  href={'/auth/login'}>Iniciar Sesión</Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="h-1 bg-[#E6E8EC]"></div>
        </>
    );
}
