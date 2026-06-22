import { gsap, ScrollTrigger } from './gsap';

export function initSmoothScroll(wrapperId: string, contentId: string) {
  // Return null to let the SmoothScrollProvider render standard DOM and fall back to native scrolling
  return null;
}

export function refreshScroll() {
  if (typeof window !== 'undefined') {
    ScrollTrigger.refresh();
  }
}
