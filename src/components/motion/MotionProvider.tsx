'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { registerGSAP } from '@/motion/gsap';
import { initCustomEasings } from '@/motion/easings';
import { detectInitialQuality, MotionQuality, startFpsMonitoring } from '@/motion/quality';

export type UserMotionSetting = 'full' | 'reduced' | 'off';

interface MotionContextProps {
  quality: MotionQuality;
  userSetting: UserMotionSetting;
  setUserSetting: (setting: UserMotionSetting) => void;
  isWebGLSupported: boolean;
}

const MotionContext = createContext<MotionContextProps | undefined>(undefined);

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userSetting, setUserSettingState] = useState<UserMotionSetting>('full');
  const [quality, setQuality] = useState<MotionQuality>('FULL');
  const [isWebGLSupported, setIsWebGLSupported] = useState(false);

  useEffect(() => {
    // Register GSAP plugins and custom easings
    registerGSAP();
    initCustomEasings();

    // Check WebGL
    try {
      const canvas = document.createElement('canvas');
      const supported = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setIsWebGLSupported(supported);
    } catch (e) {
      setIsWebGLSupported(false);
    }

    // Load initial settings
    const savedSetting = localStorage.getItem('almk_motion_setting') as UserMotionSetting;
    if (savedSetting) {
      setUserSettingState(savedSetting);
      if (savedSetting === 'off') setQuality('ESSENTIAL');
      else if (savedSetting === 'reduced') setQuality('BALANCED');
      else setQuality(detectInitialQuality());
    } else {
      const initial = detectInitialQuality();
      setQuality(initial);
      setUserSettingState(initial === 'FULL' ? 'full' : initial === 'BALANCED' ? 'reduced' : 'off');
    }
  }, []);

  // Monitor FPS to degrade automatically if settings are 'full'
  useEffect(() => {
    if (userSetting !== 'full') return;

    const stopFps = startFpsMonitoring((degraded) => {
      console.warn(`[ALMK Flow] Performance degraded to ${degraded} due to FPS drops`);
      setQuality(degraded);
    });

    return () => {
      stopFps();
    };
  }, [userSetting]);

  const setUserSetting = (setting: UserMotionSetting) => {
    setUserSettingState(setting);
    localStorage.setItem('almk_motion_setting', setting);
    if (setting === 'off') {
      setQuality('ESSENTIAL');
    } else if (setting === 'reduced') {
      setQuality('BALANCED');
    } else {
      setQuality(detectInitialQuality());
    }
  };

  return (
    <MotionContext.Provider value={{ quality, userSetting, setUserSetting, isWebGLSupported }}>
      {children}
    </MotionContext.Provider>
  );
};

export const useMotion = () => {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
};
export default MotionProvider;
