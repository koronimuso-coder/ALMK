import { CustomEase } from './gsap';

export function initCustomEasings() {
  if (typeof window !== 'undefined') {
    CustomEase.create('almkLaunch', 'M0,0 C0.1,0.8 0.2,1 1,1');
    CustomEase.create('almkFlow', 'M0,0 C0.25,1 0.5,1 1,1');
    CustomEase.create('almkLock', 'M0,0 C0.15,0.85 0.35,1.12 1,1');
    CustomEase.create('almkSnap', 'M0,0 C0.7,0 0.3,1 1,1');
    CustomEase.create('almkSoft', 'M0,0 C0.4,0 0.2,1 1,1');
    CustomEase.create('almkEmergency', 'M0,0 C0.8,0 0.2,1.3 1,1');
  }
}

export const easings = {
  launch: 'almkLaunch',
  flow: 'almkFlow',
  lock: 'almkLock',
  snap: 'almkSnap',
  soft: 'almkSoft',
  emergency: 'almkEmergency',
};

export default easings;
