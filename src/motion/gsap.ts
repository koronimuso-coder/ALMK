import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

let isRegistered = false;

export function registerGSAP() {
  if (typeof window !== 'undefined' && !isRegistered) {
    gsap.registerPlugin(
      ScrollTrigger,
      CustomEase,
      Flip,
      Observer,
      MotionPathPlugin
    );
    isRegistered = true;
  }
}

export { gsap, ScrollTrigger, CustomEase, Flip, Observer, MotionPathPlugin };
export default gsap;
