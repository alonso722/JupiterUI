'use client';

import { Inter, Montserrat, Poppins } from 'next/font/google';
import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import '@/styles/globals.css';
import '@/styles/colors.css';
import 'react-toastify/dist/ReactToastify.css';

import ToastProvider from '@/components/lib/toastProvider';
import RecoilRootWrapper from '@/components/ReciolRootWrapper';
import { ColorProvider } from '@/services/colorService';  

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});
const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const handleInactivity = () => {
    router.push('/dashboard/logout');
  };

  const resetTimer = () => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(handleInactivity, 300000); // 5 minutos
  };

  useEffect(() => {
    if (pathname.startsWith('/meetings')) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [pathname, router]);

  return (
    <html>
      <body>
        <RecoilRootWrapper>
          <ColorProvider> 
            <ToastProvider>{children}</ToastProvider>
          </ColorProvider>
        </RecoilRootWrapper>
      </body>
    </html>
  );
}
