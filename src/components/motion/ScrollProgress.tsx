'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

export const ScrollProgress: React.FC = () => {
  const { quality } = useMotion();
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !progressRef.current) return;

    gsap.to(progressRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });
  }, [quality]);

  if (quality === 'ESSENTIAL') return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        backgroundColor: '#c29b68',
        transformOrigin: '0% 50%',
        transform: 'scaleX(0)',
        zIndex: 10000,
        pointerEvents: 'none',
        boxShadow: '0 0 10px rgba(194, 155, 104, 0.5)',
      }}
      ref={progressRef}
    />
  );
};

export default ScrollProgress;
