'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  style?: React.CSSProperties;
}

export const StaggerGrid: React.FC<StaggerGridProps> = ({
  children,
  className = '',
  stagger = 0.1,
  style,
}) => {
  const { quality } = useMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !gridRef.current) return;

    const children = gridRef.current.children;
    if (children.length === 0) return;

    gsap.set(children, { y: 40, opacity: 0 });

    const trigger = gsap.to(children, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger,
      ease: 'almkFlow',
      scrollTrigger: {
        trigger: gridRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      if (trigger.scrollTrigger) trigger.scrollTrigger.kill();
      trigger.kill();
    };
  }, [quality, children, stagger]);

  return (
    <div ref={gridRef} className={className} style={style}>
      {children}
    </div>
  );
};

export default StaggerGrid;
