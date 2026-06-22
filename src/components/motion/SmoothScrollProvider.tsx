'use client';

import React, { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { initSmoothScroll } from '@/motion/scroll';
import { useMotion } from './MotionProvider';

interface SmoothScrollProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProps> = ({ children }) => {
  const { quality } = useMotion();
  const smootherRef = useRef<any>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL') {
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
      return;
    }

    // Initialize ScrollSmoother
    const smoother = initSmoothScroll('smooth-wrapper', 'smooth-content');
    smootherRef.current = smoother;

    return () => {
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
    };
  }, [quality]);

  if (quality === 'ESSENTIAL') {
    return <div id="smooth-wrapper-essential">{children}</div>;
  }

  return (
    <div id="smooth-wrapper" style={{ width: '100%', overflow: 'hidden' }}>
      <div id="smooth-content" style={{ width: '100%', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
};

export default SmoothScrollProvider;
