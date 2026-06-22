'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import { animateGateIn, animateGateOut } from '@/motion/transitions';
import { useMotion } from './MotionProvider';

interface PageTransitionContextProps {
  transitionTo: (href: string) => void;
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextProps | undefined>(undefined);

export const useTransitionRouter = () => {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('useTransitionRouter must be used within PageTransitionProvider');
  }
  return context;
};

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { quality } = useMotion();
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const gateRef = useRef<HTMLDivElement>(null);
  const targetHref = useRef<string | null>(null);

  // Play gate out on mount or pathname change
  useGSAP(() => {
    if (quality === 'ESSENTIAL') return;
    animateGateOut(gateRef.current, () => {
      setIsTransitioning(false);
    });
  }, [pathname, quality]);

  const transitionTo = (href: string) => {
    if (quality === 'ESSENTIAL') {
      router.push(href);
      return;
    }

    if (isTransitioning) return;
    setIsTransitioning(true);
    targetHref.current = href;

    animateGateIn(gateRef.current, () => {
      if (targetHref.current) {
        router.push(targetHref.current);
        targetHref.current = null;
      }
    });
  };

  return (
    <PageTransitionContext.Provider value={{ transitionTo, isTransitioning }}>
      {children}
      {/* Cinematic Diagonal Gate Mask */}
      <div
        ref={gateRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#030712',
          zIndex: 9999,
          display: 'none',
          clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
          pointerEvents: 'none',
          borderLeft: '2px solid #c29b68',
        }}
      />
    </PageTransitionContext.Provider>
  );
};

export default PageTransition;
