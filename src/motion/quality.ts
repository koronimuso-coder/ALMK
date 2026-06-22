export type MotionQuality = 'FULL' | 'BALANCED' | 'ESSENTIAL';

export function detectInitialQuality(): MotionQuality {
  if (typeof window === 'undefined') return 'BALANCED';

  // 1. Reduced Motion Preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return 'ESSENTIAL';

  // 2. Hardware Checks
  const hasLowMemory = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
  const hasLowCores = 'hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  if (hasLowMemory || hasLowCores) {
    return 'ESSENTIAL';
  }

  // Mobile/Tablet defaults to BALANCED, high-end Desktop to FULL
  if (isTouchDevice || window.innerWidth < 1024) {
    return 'BALANCED';
  }

  return 'FULL';
}

export function startFpsMonitoring(onDegrade: (newQuality: MotionQuality) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  let frameCount = 0;
  let lastTime = performance.now();
  let active = true;
  let rafId = 0;
  let lowFpsCount = 0;

  const loop = () => {
    if (!active) return;
    frameCount++;
    const now = performance.now();
    const delta = now - lastTime;

    if (delta >= 1000) {
      const fps = (frameCount * 1000) / delta;
      frameCount = 0;
      lastTime = now;

      if (fps < 40) {
        lowFpsCount++;
        // If FPS drops below 40 for 3 consecutive seconds, degrade quality
        if (lowFpsCount >= 3) {
          const current = localStorage.getItem('almk_motion_quality') as MotionQuality || 'FULL';
          if (current === 'FULL') {
            onDegrade('BALANCED');
          } else if (current === 'BALANCED') {
            onDegrade('ESSENTIAL');
          }
          active = false; // Stop monitoring once degraded
          return;
        }
      } else {
        lowFpsCount = 0;
      }
    }
    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);

  return () => {
    active = false;
    cancelAnimationFrame(rafId);
  };
}
