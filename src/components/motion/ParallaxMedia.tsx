'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface ParallaxMediaProps {
  src: string;
  alt: string;
  className?: string;
  intensity?: number; // Parallax y value
}

export const ParallaxMedia: React.FC<ParallaxMediaProps> = ({
  src,
  alt,
  className = '',
  intensity = 50,
}) => {
  const { quality } = useMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !containerRef.current || !mediaRef.current) return;

    gsap.set(mediaRef.current, { scale: 1.15, yPercent: -intensity / 2 });

    gsap.to(mediaRef.current, {
      yPercent: intensity / 2,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, [intensity, quality]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ overflow: 'hidden', position: 'relative', width: '100%', height: '100%' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={mediaRef}
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};

export default ParallaxMedia;
