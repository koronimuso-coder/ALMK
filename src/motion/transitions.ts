import gsap from './gsap';

export interface TransitionConfig {
  duration: number;
  ease: string;
}

export const pageTransitionConfig: TransitionConfig = {
  duration: 0.7,
  ease: 'almkSnap',
};

export function animateGateIn(gateRef: HTMLElement | null, onComplete: () => void) {
  if (!gateRef) {
    onComplete();
    return;
  }

  // Animate the diagonal mask closed
  gsap.timeline({
    onComplete: onComplete
  })
  .set(gateRef, { display: 'block', clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)', opacity: 1 })
  .to(gateRef, {
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    duration: pageTransitionConfig.duration,
    ease: pageTransitionConfig.ease,
  });
}

export function animateGateOut(gateRef: HTMLElement | null, onComplete?: () => void) {
  if (!gateRef) {
    if (onComplete) onComplete();
    return;
  }

  // Animate the diagonal mask open
  gsap.timeline({
    onComplete: () => {
      gsap.set(gateRef, { display: 'none' });
      if (onComplete) onComplete();
    }
  })
  .to(gateRef, {
    clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
    duration: pageTransitionConfig.duration,
    ease: pageTransitionConfig.ease,
  });
}
