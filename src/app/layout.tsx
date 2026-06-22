import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import MotionProvider from '@/components/motion/MotionProvider';
import SmoothScrollProvider from '@/components/motion/SmoothScrollProvider';
import PageTransition from '@/components/motion/PageTransition';
import ScrollProgress from '@/components/motion/ScrollProgress';
import CursorFollower from '@/components/motion/CursorFollower';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'ALMK | From Local Payment to Global Digital Access',
  description:
    'Achetez vos USDT localement et recevez-les directement dans votre portefeuille. Solution fintech sécurisée et instantanée reliant le Mobile Money africain à l’économie numérique mondiale.',
  keywords: 'fintech, USDT, Mobile Money, M-Pesa, Airtel Money, crypto, Afrique, transactions',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ backgroundColor: '#030712', color: '#f3f4f6', minHeight: '100vh' }}>
        <AuthProvider>
          <MotionProvider>
            <PageTransition>
              <ScrollProgress />
              <CursorFollower />
              <SmoothScrollProvider>
                {children}
              </SmoothScrollProvider>
            </PageTransition>
          </MotionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

