'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';
import TextSplitter from './TextSplitter';

interface CharacterRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export const CharacterReveal: React.FC<CharacterRevealProps> = ({ children, className = '', delay = 0 }) => {
  const { quality } = useMotion();
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !textRef.current) return;

    const targets = textRef.current.querySelectorAll('.split-char');
    if (targets.length === 0) return;

    gsap.set(targets, { opacity: 0, scale: 0.8, y: 10 });

    gsap.to(targets, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.02,
      ease: 'almkLock',
      delay,
      scrollTrigger: {
        trigger: textRef.current,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  }, [children, quality, delay]);

  return (
    <span
      ref={textRef}
      className={`${className} ${quality === 'ESSENTIAL' ? 'animate-fade-in' : ''}`}
      aria-label={children}
      style={{ display: 'inline-block' }}
    >
      <span aria-hidden={quality !== 'ESSENTIAL'}>
        <TextSplitter
          text={children}
          type="chars"
          charClassName="split-char"
        />
      </span>
    </span>
  );
};

export default CharacterReveal;
