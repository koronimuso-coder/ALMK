'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface VelocityTickerProps {
  children: string[];
  speed?: number;
  className?: string;
}

export const VelocityTicker: React.FC<VelocityTickerProps> = ({ children, speed = 50, className = '' }) => {
  const { quality } = useMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    if (!trackRef.current) return;

    const track = trackRef.current;
    const items = track.children;
    if (items.length === 0) return;

    // Duplicate text items to create seamless loop
    const totalWidth = track.scrollWidth / 2;

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(track, {
      x: -totalWidth,
      duration: speed,
      ease: 'none',
    });
    timelineRef.current = tl;

    if (quality === 'ESSENTIAL') return;

    // Track scroll velocity and adjust ticker timescale
    const trigger = ScrollTrigger.create({
      trigger: track,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const vel = Math.abs(self.getVelocity());
        // Map velocity to speed factor (min 1x speed, max 5x speed)
        const scale = gsap.utils.mapRange(0, 3000, 1, 4, vel);
        gsap.to(tl, { timeScale: scale, duration: 0.3, ease: 'power2.out' });
      },
    });

    return () => {
      if (trigger) trigger.kill();
      tl.kill();
    };
  }, [speed, quality, children]);

  // Duplicate list to achieve seamless repeat
  const renderedItems = [...children, ...children];

  return (
    <div className={`overflow-hidden w-full ${className}`} style={{ whiteSpace: 'nowrap' }}>
      <div
        ref={trackRef}
        className="inline-flex"
        style={{ display: 'inline-flex', willChange: 'transform' }}
      >
        {renderedItems.map((text, idx) => (
          <span key={idx} className="inline-block px-8 text-lg font-medium text-copper">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default VelocityTicker;
