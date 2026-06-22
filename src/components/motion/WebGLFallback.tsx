'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';

export const WebGLFallback: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Pulse the core center
    gsap.to('.fallback-core-center', {
      scale: 1.1,
      opacity: 0.9,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Slow rotation of rings
    gsap.to('.fallback-ring-1', {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: 'none',
    });

    gsap.to('.fallback-ring-2', {
      rotation: -360,
      duration: 15,
      repeat: -1,
      ease: 'none',
    });

    gsap.to('.fallback-ring-3', {
      rotation: 240,
      duration: 20,
      repeat: -1,
      ease: 'none',
    });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(10,15,29,0.5) 0%, rgba(3,7,18,0.9) 80%)',
      }}
    >
      <svg
        viewBox="0 0 400 400"
        style={{
          width: '80%',
          maxWidth: '500px',
          height: 'auto',
          overflow: 'visible',
          opacity: 0.55,
        }}
      >
        {/* Core Center Glow */}
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c29b68" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c29b68" stopOpacity="0" />
          </radialGradient>
          <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="200" cy="200" r="80" fill="url(#centerGlow)" />

        {/* Center monogram node */}
        <g className="fallback-core-center" style={{ transformOrigin: '200px 200px' }}>
          <circle cx="200" cy="200" r="16" fill="none" stroke="#c29b68" strokeWidth="2" filter="url(#neonBlur)" />
          <polygon points="200,190 209,205 191,205" fill="none" stroke="#c29b68" strokeWidth="1.5" />
        </g>

        {/* Outer Ring 1 - Blue (Identity) */}
        <circle
          className="fallback-ring-1"
          cx="200"
          cy="200"
          r="60"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="40 100 80 40"
          style={{ transformOrigin: '200px 200px' }}
          filter="url(#neonBlur)"
        />

        {/* Outer Ring 2 - Bronze (Payment) */}
        <circle
          className="fallback-ring-2"
          cx="200"
          cy="200"
          r="95"
          fill="none"
          stroke="#c29b68"
          strokeWidth="1"
          strokeDasharray="120 60 40 100"
          style={{ transformOrigin: '200px 200px' }}
          filter="url(#neonBlur)"
        />

        {/* Outer Ring 3 - Green (Network) */}
        <circle
          className="fallback-ring-3"
          cx="200"
          cy="200"
          r="130"
          fill="none"
          stroke="#10b981"
          strokeWidth="1"
          strokeDasharray="60 40 180 80"
          style={{ transformOrigin: '200px 200px' }}
          filter="url(#neonBlur)"
        />
      </svg>
    </div>
  );
};

export default WebGLFallback;
