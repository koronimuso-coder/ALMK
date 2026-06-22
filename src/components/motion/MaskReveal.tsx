'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface MaskRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down' | 'diagonal';
  delay?: number;
}

export const MaskReveal: React.FC<MaskRevealProps> = ({
  children,
  className = '',
  direction = 'left',
  delay = 0,
}) => {
  const { quality } = useMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !containerRef.current) return;

    let initialClip = 'polygon(0 0, 0 0, 0 100%, 0 100%)';
    let finalClip = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

    switch (direction) {
      case 'right':
        initialClip = 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)';
        finalClip = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
        break;
      case 'up':
        initialClip = 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)';
        finalClip = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
        break;
      case 'down':
        initialClip = 'polygon(0 0, 100% 0, 100% 0, 0 0)';
        finalClip = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
        break;
      case 'diagonal':
        initialClip = 'polygon(0 0, 0 0, 0 0, 0 0)';
        finalClip = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
        break;
    }

    gsap.set(containerRef.current, { clipPath: initialClip });

    gsap.to(containerRef.current, {
      clipPath: finalClip,
      duration: 1.0,
      ease: 'almkFlow',
      delay,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }, [direction, quality, delay]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={quality !== 'ESSENTIAL' ? { overflow: 'hidden' } : undefined}
    >
      {children}
    </div>
  );
};

export default MaskReveal;
