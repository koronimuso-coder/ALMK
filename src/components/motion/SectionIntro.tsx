'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';
import SplitReveal from './SplitReveal';

interface SectionIntroProps {
  title: string;
  tagline?: string;
  description?: string;
  className?: string;
}

export const SectionIntro: React.FC<SectionIntroProps> = ({
  title,
  tagline,
  description,
  className = '',
}) => {
  const { quality } = useMotion();
  const descRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !containerRef.current) return;

    const anims: any[] = [];

    if (descRef.current) {
      anims.push(
        gsap.from(descRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: 'almkFlow',
          scrollTrigger: {
            trigger: descRef.current,
            start: 'top 85%',
          },
        })
      );
    }

    return () => {
      anims.forEach((a) => {
        if (a && a.scrollTrigger) a.scrollTrigger.kill();
        a?.kill();
      });
    };
  }, [quality]);

  return (
    <div ref={containerRef} className={`mb-12 text-center max-w-3xl mx-auto ${className}`}>
      {tagline && (
        <span
          style={{
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: '#c29b68',
            fontWeight: 700,
            display: 'inline-block',
            marginBottom: '0.5rem',
          }}
          className={quality === 'ESSENTIAL' ? 'animate-fade-in' : ''}
        >
          {tagline}
        </span>
      )}
      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f3f4f6', lineHeight: 1.2 }}>
        <SplitReveal type="words">{title}</SplitReveal>
      </h2>
      {description && (
        <p
          ref={descRef}
          className={quality === 'ESSENTIAL' ? 'animate-fade-in' : ''}
          style={{
            fontSize: '1.125rem',
            color: '#9ca3af',
            marginTop: '1rem',
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionIntro;
