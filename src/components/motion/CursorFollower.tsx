'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

export const CursorFollower: React.FC = () => {
  const { quality } = useMotion();
  const [label, setLabel] = useState<string>('');
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quality !== 'FULL') return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Cache mouse coordinates
    const mouse = { x: 0, y: 0 };
    const dotPos = { x: 0, y: 0 };
    const ringPos = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Update dot immediately
      gsap.to(dot, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.1,
        overwrite: 'auto',
      });

      // Update ring with a slight lag
      gsap.to(ring, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: 'auto',
      });

      // Read cursor labels
      const target = e.target as HTMLElement;
      const hoverTarget = target.closest('[data-cursor]');
      if (hoverTarget) {
        const cursorText = hoverTarget.getAttribute('data-cursor') || '';
        setLabel(cursorText);
        gsap.to(ring, { scale: 2.2, duration: 0.3 });
        gsap.to(dot, { scale: 0, duration: 0.2 });
      } else {
        setLabel('');
        gsap.to(ring, { scale: 1, duration: 0.3 });
        gsap.to(dot, { scale: 1, duration: 0.2 });
      }

      // Check if hovering over input fields, textareas, buttons, or links
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.isContentEditable;

      if (isInput) {
        gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
      } else {
        gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [quality]);

  if (quality !== 'FULL') return null;

  return (
    <>
      {/* Tiny Center Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          backgroundColor: '#c29b68',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      {/* Outer Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '36px',
          height: '36px',
          border: '1px solid rgba(194, 155, 104, 0.7)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 99998,
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {label && (
          <span
            style={{
              fontSize: '8px',
              fontWeight: 700,
              color: '#c29b68',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </span>
        )}
      </div>
    </>
  );
};

export default CursorFollower;
