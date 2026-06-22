'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';
import TextSplitter from './TextSplitter';

interface LineRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export const LineReveal: React.FC<LineRevealProps> = ({ children, className = '', delay = 0 }) => {
  const { quality } = useMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !containerRef.current) return;

    const targets = containerRef.current.querySelectorAll('.line-word-container');
    if (targets.length === 0) return;

    gsap.set(targets, { y: 30, opacity: 0 });

    gsap.to(targets, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'almkFlow',
      delay,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }, [children, quality, delay]);

  return (
    <div
      ref={containerRef}
      className={`${className} ${quality === 'ESSENTIAL' ? 'animate-fade-in' : ''}`}
    >
      <TextSplitter
        text={children}
        type="lines"
        lineClassName="split-line"
      />
    </div>
  );
};

export default LineReveal;
