'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';
import TextSplitter from './TextSplitter';

type AllowedTags = 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'section';

interface SplitRevealProps {
  children: string;
  type?: 'lines' | 'words' | 'chars';
  className?: string;
  tag?: AllowedTags;
  delay?: number;
}

export const SplitReveal: React.FC<SplitRevealProps> = ({
  children,
  type = 'words',
  className = '',
  tag: Tag = 'div',
  delay = 0,
}) => {
  const { quality } = useMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !containerRef.current) return;

    // Determine the targets based on the type
    const targets = type === 'lines'
      ? containerRef.current.querySelectorAll('.line-word-container')
      : type === 'words'
      ? containerRef.current.querySelectorAll('.split-word')
      : containerRef.current.querySelectorAll('.split-char');

    if (targets.length === 0) return;

    // Set initial position
    gsap.set(targets, { yPercent: 100, opacity: 0 });

    // Animate reveal
    gsap.to(targets, {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      stagger: type === 'lines' ? 0.15 : type === 'words' ? 0.05 : 0.02,
      ease: 'almkLaunch',
      delay,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }, [children, type, quality, delay]);

  // Use a wrapper div to anchor the ref (avoids polymorphic ref union complexity),
  // then render the semantic Tag inside it.
  return (
    <div ref={containerRef} style={{ display: 'contents' }}>
      <Tag className={className} aria-label={children}>
        <span
          aria-hidden="true"
          style={{ display: 'block' }}
          className={quality === 'ESSENTIAL' ? 'animate-fade-in' : ''}
        >
          <TextSplitter
            text={children}
            type={type}
            wordClassName="split-word"
            charClassName="split-char"
            lineClassName="split-line"
          />
        </span>
      </Tag>
    </div>
  );
};

export default SplitReveal;
