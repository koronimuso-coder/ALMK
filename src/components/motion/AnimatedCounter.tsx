'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.5,
  delay = 0,
  suffix = '',
  prefix = '',
  decimals = 0,
}) => {
  const { quality } = useMotion();
  const [count, setCount] = useState<number>(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const counterObj = useRef({ val: 0 });

  useGSAP(() => {
    if (quality === 'ESSENTIAL') {
      setCount(value);
      return;
    }

    counterObj.current.val = 0;

    gsap.to(counterObj.current, {
      val: value,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        setCount(counterObj.current.val);
      },
    });
  }, [value, duration, delay, quality]);

  return (
    <span ref={containerRef} aria-live="polite">
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
