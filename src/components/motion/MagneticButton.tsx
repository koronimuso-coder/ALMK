'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  range?: number; // Distance threshold for pull
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  range = 35,
  ...props
}) => {
  const { quality } = useMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    if (quality !== 'FULL' || !buttonRef.current) return;

    const el = buttonRef.current;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const distance = Math.hypot(e.clientX - x, e.clientY - y);

      if (distance < range) {
        // Pull text and background towards cursor
        const pullX = (e.clientX - x) * 0.35;
        const pullY = (e.clientY - y) * 0.35;

        gsap.to(el, {
          x: pullX,
          y: pullY,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        // Return smoothly
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'almkSoft',
        });
      }
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'almkSoft',
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [quality, range]);

  return (
    <button
      ref={buttonRef}
      className={`magnetic-button ${className}`}
      style={{ display: 'inline-block', position: 'relative', outline: 'none' }}
      {...props}
    >
      {children}
    </button>
  );
};

export default MagneticButton;
