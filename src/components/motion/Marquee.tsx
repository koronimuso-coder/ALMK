'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';

interface MarqueeProps {
  children: string[];
  speed?: number;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({ children, speed = 40, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const totalWidth = el.scrollWidth / 2;

    const anim = gsap.to(el, {
      x: -totalWidth,
      duration: speed,
      ease: 'none',
      repeat: -1,
    });

    return () => {
      anim.kill();
    };
  }, [speed, children]);

  // Duplicate items for loop
  const duplicated = [...children, ...children];

  return (
    <div className={`overflow-hidden w-full ${className}`} style={{ whiteSpace: 'nowrap' }}>
      <div
        ref={containerRef}
        className="inline-flex"
        style={{ display: 'inline-flex', willChange: 'transform' }}
      >
        {duplicated.map((text, idx) => (
          <span key={idx} className="inline-block px-12 text-sm font-semibold tracking-wider text-bronze uppercase">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
