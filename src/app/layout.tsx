// src/app/layout.tsx
'use client';

import { Inter, Montserrat, Poppins } from 'next/font/google';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import '@/styles/globals.css';
import '@/styles/colors.css';
import 'react-toastify/dist/ReactToastify.css';

import ToastProvider from '@/components/lib/toastProvider';
import RecoilRootWrapper from '@/components/ReciolRootWrapper';

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
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const handleInactivity = () => {
    router.push('/dashboard/logout');
  };

  const resetTimer = () => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(handleInactivity, 300000); 
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [router]);

  return (
    <html>
      <body className={`${montserrat.variable} ${poppins.variable}`}>
        <RecoilRootWrapper>
          <ToastProvider>{children}</ToastProvider>
        </RecoilRootWrapper>
      </body>
    </html>
  );
}
