'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  tiltRange?: number; // Degrees of rotation
  style?: React.CSSProperties;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  tiltRange = 10,
  style,
}) => {
  const { quality } = useMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quality !== 'FULL' || !cardRef.current) return;

    const card = cardRef.current;
    const glow = glowRef.current;

    const onMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within element
      const y = e.clientY - rect.top;  // y position within element

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (-tiltRange to +tiltRange)
      const rotateY = ((x - centerX) / centerX) * tiltRange;
      const rotateX = -((y - centerY) / centerY) * tiltRange;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 800,
        ease: 'power2.out',
        duration: 0.3,
        overwrite: 'auto',
      });

      if (glow) {
        gsap.to(glow, {
          left: `${x}px`,
          top: `${y}px`,
          opacity: 0.25,
          duration: 0.2,
          overwrite: 'auto',
        });
      }
    };

    const onMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'almkSoft',
        overwrite: 'auto',
      });

      if (glow) {
        gsap.to(glow, {
          opacity: 0,
          duration: 0.5,
          overwrite: 'auto',
        });
      }
    };

    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);

    return () => {
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [tiltRange, quality]);

  return (
    <div
      ref={cardRef}
      className={`interactive-card relative overflow-hidden ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
    >
      {/* Hover radial glow effect */}
      {quality === 'FULL' && (
        <div
          ref={glowRef}
          style={{
            position: 'absolute',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(194, 155, 104, 0.4) 0%, rgba(0,0,0,0) 70%)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            opacity: 0,
            zIndex: 1,
            mixBlendMode: 'screen',
            left: 0,
            top: 0,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};

export default InteractiveCard;
