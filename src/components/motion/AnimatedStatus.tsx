'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/motion/gsap';
import { useMotion } from './MotionProvider';

export type OrderStatus =
  | 'QUOTE_ACTIVE'
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_UNDER_REVIEW'
  | 'PAYMENT_CONFIRMED'
  | 'PAYOUT_PREPARATION'
  | 'BLOCKCHAIN_PENDING'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'REJECTED'
  | 'ERROR';

interface AnimatedStatusProps {
  status: OrderStatus;
  message?: string;
  onTimerExpire?: () => void;
}

export const AnimatedStatus: React.FC<AnimatedStatusProps> = ({
  status,
  message = '',
  onTimerExpire,
}) => {
  const { quality } = useMotion();
  const iconRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quality === 'ESSENTIAL' || !iconRef.current) return;

    const el = iconRef.current;

    // Reset animations
    gsap.killTweensOf(el);
    gsap.set(el, { rotation: 0, scale: 1, x: 0, y: 0, opacity: 1 });

    switch (status) {
      case 'QUOTE_ACTIVE':
        // Pulsing scale
        gsap.to(el, {
          scale: 1.12,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
        break;
      case 'AWAITING_PAYMENT':
        // Slow rotative loop
        gsap.to(el, {
          rotation: 360,
          duration: 6,
          repeat: -1,
          ease: 'none',
        });
        break;
      case 'PAYMENT_UNDER_REVIEW':
        // Floating motion
        gsap.to(el, {
          y: -6,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
        break;
      case 'PAYMENT_CONFIRMED':
        // Scale pop and settle
        gsap.fromTo(
          el,
          { scale: 0.4, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'almkLock' }
        );
        break;
      case 'BLOCKCHAIN_PENDING':
        // Fast rotation
        gsap.to(el, {
          rotation: -360,
          duration: 2.5,
          repeat: -1,
          ease: 'none',
        });
        break;
      case 'COMPLETED':
        // Big lock scale punch
        gsap.fromTo(
          el,
          { scale: 1.5, filter: 'brightness(1.5)' },
          { scale: 1, filter: 'brightness(1)', duration: 0.8, ease: 'almkLock' }
        );
        break;
      case 'ON_HOLD':
        // Suspended swing
        gsap.to(el, {
          rotation: 12,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
        break;
      case 'REJECTED':
        // Short snap
        gsap.fromTo(
          el,
          { scale: 0.8, x: -10 },
          { scale: 1, x: 0, duration: 0.4, ease: 'almkEmergency' }
        );
        break;
      case 'ERROR':
        // Tiny component shake
        if (containerRef.current) {
          gsap.fromTo(
            containerRef.current,
            { x: -8 },
            { x: 0, duration: 0.08, repeat: 4, yoyo: true, ease: 'none' }
          );
        }
        break;
    }
  }, [status, quality]);

  // Color mapping
  const styles: Record<OrderStatus, { bg: string; border: string; text: string; label: string; icon: string }> = {
    QUOTE_ACTIVE: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#60a5fa', label: 'Devis Actif', icon: '⏱️' },
    AWAITING_PAYMENT: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#fbbf24', label: 'En attente de paiement', icon: '🪙' },
    PAYMENT_UNDER_REVIEW: { bg: 'rgba(99, 102, 241, 0.1)', border: '#6366f1', text: '#818cf8', label: 'Vérification en cours', icon: '🔍' },
    PAYMENT_CONFIRMED: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#34d399', label: 'Paiement Confirmé', icon: '✔️' },
    PAYOUT_PREPARATION: { bg: 'rgba(236, 72, 153, 0.1)', border: '#ec4899', text: '#f472b6', label: 'Préparation du transfert', icon: '⚙️' },
    BLOCKCHAIN_PENDING: { bg: 'rgba(139, 92, 246, 0.1)', border: '#8b5cf6', text: '#a78bfa', label: 'Confirmation Blockchain', icon: '⛓️' },
    COMPLETED: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#34d399', label: 'Transfert Terminé', icon: '🔒' },
    ON_HOLD: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fbbf24', label: 'Suspendu', icon: '⚠️' },
    REJECTED: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4848', text: '#f87171', label: 'Rejeté', icon: '❌' },
    ERROR: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4848', text: '#f87171', label: 'Erreur', icon: '🚨' },
  };

  const currentStyle = styles[status];

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        backgroundColor: currentStyle.bg,
        border: `1px solid ${currentStyle.border}`,
        width: 'fit-content',
      }}
    >
      <div
        ref={iconRef}
        style={{
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {currentStyle.icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: currentStyle.text }}>
          {currentStyle.label}
        </span>
        {message && (
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.125rem' }}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
};

export default AnimatedStatus;
