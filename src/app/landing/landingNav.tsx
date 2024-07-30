import Image from 'next/image';
import Link from 'next/link';

export default function LandingNav() {
    return (
        <>
            <div className="flex items-center justify-between h-[95px] px-8">
                <div>
                    <Image
                        src="/logos/logo.svg"
                        alt="Logo"
                        width={180}
                        height={29}/>
                </div>
            </div>
            <div className="h-1 bg-[#E6E8EC]"></div>
        </>
    );
}
