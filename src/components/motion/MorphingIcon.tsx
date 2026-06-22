'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface MorphingIconProps {
  fromD: string;
  toD: string;
  active: boolean;
  className?: string;
  color?: string;
  viewBox?: string;
  strokeWidth?: number;
}

export const MorphingIcon: React.FC<MorphingIconProps> = ({
  fromD,
  toD,
  active,
  className = '',
  color = '#c29b68',
  viewBox = '0 0 24 24',
  strokeWidth = 2,
}) => {
  const { quality } = useMotion();
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !pathRef.current) return;

    const targetD = active ? toD : fromD;

    // Standard GSAP can transition the 'd' attribute directly between compatible paths
    gsap.to(pathRef.current, {
      attr: { d: targetD },
      duration: 0.4,
      ease: 'almkSoft',
    });
  }, [active, fromD, toD, quality]);

  return (
    <svg viewBox={viewBox} className={className} style={{ width: '100%', height: '100%' }}>
      <path
        ref={pathRef}
        d={active && quality === 'ESSENTIAL' ? toD : fromD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MorphingIcon;
