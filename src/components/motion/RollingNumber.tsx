'use client';

import React, { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface RollingNumberProps {
  value: number | string;
  className?: string;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({ value, className = '' }) => {
  const { quality } = useMotion();
  const containerRef = useRef<HTMLSpanElement>(null);

  const stringValue = String(value);
  const chars = stringValue.split('');

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !containerRef.current) return;

    // Select all digit reel containers
    const reels = containerRef.current.querySelectorAll('.digit-reel');
    
    reels.forEach((reel) => {
      const targetDigit = (reel as HTMLElement).dataset.digit;
      if (targetDigit === undefined) return;

      const digitNum = parseInt(targetDigit, 10);
      if (isNaN(digitNum)) return;

      // Translate the strip to the correct digit (each digit occupies 10% height)
      gsap.to(reel, {
        y: `-${digitNum * 10}%`,
        duration: 0.6,
        ease: 'almkSoft',
        overwrite: 'auto',
      });
    });
  }, [value, quality]);

  if (quality === 'ESSENTIAL') {
    return <span className={className}>{value}</span>;
  }

  return (
    <span
      ref={containerRef}
      className={`inline-flex overflow-hidden ${className}`}
      style={{ height: '1.2em', lineHeight: '1.2em' }}
    >
      {chars.map((char, idx) => {
        const isDigit = !isNaN(parseInt(char, 10)) && char !== ' ';
        if (!isDigit) {
          return (
            <span key={idx} className="char-static" style={{ display: 'inline-block' }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        }

        return (
          <span
            key={idx}
            className="digit-container"
            style={{
              position: 'relative',
              width: '0.6em',
              height: '1.2em',
              display: 'inline-block',
              overflow: 'hidden',
            }}
          >
            <span
              className="digit-reel"
              data-digit={char}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                willChange: 'transform',
                transform: 'translateY(0%)',
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <span
                  key={n}
                  style={{
                    height: '1.2em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

export default RollingNumber;
