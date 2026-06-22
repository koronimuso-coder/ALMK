'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface HorizontalStoryProps {
  children: React.ReactNode;
  itemCount: number;
}

export const HorizontalStory: React.FC<HorizontalStoryProps> = ({ children, itemCount }) => {
  const { quality } = useMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quality !== 'FULL' || !outerRef.current || !innerRef.current) return;

    const scrollWidth = innerRef.current.scrollWidth;
    const viewportWidth = window.innerWidth;
    const xVal = -(scrollWidth - viewportWidth);

    const pin = gsap.to(innerRef.current, {
      x: xVal,
      ease: 'none',
      scrollTrigger: {
        trigger: outerRef.current,
        start: 'top top',
        end: () => `+=${scrollWidth - viewportWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      if (pin.scrollTrigger) pin.scrollTrigger.kill();
    };
  }, [quality, itemCount]);

  if (quality !== 'FULL') {
    return (
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          display: 'flex',
          gap: '1.5rem',
          padding: '1.5rem',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div ref={outerRef} style={{ width: '100%', overflow: 'hidden' }}>
      <div
        ref={innerRef}
        style={{
          display: 'flex',
          width: 'max-content',
          height: '100vh',
          alignItems: 'center',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default HorizontalStory;
