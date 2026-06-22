'use client';

import React from 'react';
import { useMotion } from './MotionProvider';

interface MotionSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const MotionSafe: React.FC<MotionSafeProps> = ({ children, fallback }) => {
  const { quality } = useMotion();

  if (quality === 'ESSENTIAL') {
    return fallback ? <>{fallback}</> : <div className="opacity-fade-in">{children}</div>;
  }

  return <>{children}</>;
};

export default MotionSafe;
