'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface DrawnPathProps {
  d: string;
  className?: string;
  svgClassName?: string;
  duration?: number;
  delay?: number;
  viewBox?: string;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  pulse?: boolean;
  pulseColor?: string;
  pulseDuration?: number;
}

export const DrawnPath: React.FC<DrawnPathProps> = ({
  d,
  className = '',
  svgClassName = '',
  duration = 1.2,
  delay = 0,
  viewBox = '0 0 100 100',
  color = '#c29b68',
  strokeWidth = 2,
  fill = 'none',
  pulse = false,
  pulseColor = '#c29b68',
  pulseDuration = 2.5,
}) => {
  const { quality } = useMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !pathRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength();

    // Setup initial dash properties
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    // Animate the line drawing
    gsap.to(path, {
      strokeDashoffset: 0,
      duration,
      delay,
      ease: 'almkFlow',
      scrollTrigger: {
        trigger: svgRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Animate the transaction pulse along the path using MotionPathPlugin
    if (pulse && pulseRef.current) {
      gsap.to(pulseRef.current, {
        motionPath: {
          path: path,
          align: path,
          alignOrigin: [0.5, 0.5],
        },
        duration: pulseDuration,
        repeat: -1,
        ease: 'none',
      });
    }
  }, [d, quality, duration, delay, pulse, pulseDuration]);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className={svgClassName}
      style={{ overflow: 'visible', width: '100%', height: '100%' }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Main Path Line */}
      <path
        ref={pathRef}
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        fill={fill}
        className={className}
        style={quality === 'ESSENTIAL' ? undefined : { willChange: 'stroke-dashoffset' }}
      />

      {/* Animated Pulse (only on BALANCED/FULL quality) */}
      {pulse && quality !== 'ESSENTIAL' && (
        <circle
          ref={pulseRef}
          r={strokeWidth * 1.5}
          fill={pulseColor}
          filter="url(#glow)"
          style={{ transformOrigin: '0px 0px' }}
        />
      )}
    </svg>
  );
};

export default DrawnPath;
