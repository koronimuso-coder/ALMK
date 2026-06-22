'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface PinnedStoryProps {
  children: React.ReactNode;
  pinTriggerId: string;
}

export const PinnedStory: React.FC<PinnedStoryProps> = ({ children, pinTriggerId }) => {
  const { quality } = useMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quality !== 'FULL' || !containerRef.current) return;

    // Pin the story section
    const pin = gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: `#${pinTriggerId}`,
        start: 'top top',
        end: '+=200%',
        pin: containerRef.current,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      if (pin.scrollTrigger) pin.scrollTrigger.kill();
    };
  }, [quality, pinTriggerId]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%' }}
      className={quality === 'FULL' ? 'pinned-story-desktop' : 'pinned-story-mobile'}
    >
      {children}
    </div>
  );
};

export default PinnedStory;
