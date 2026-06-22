'use client';

import React from 'react';
import { useTransitionRouter } from '@/components/motion/PageTransition';
import DrawnPath from '@/components/motion/DrawnPath';
import MagneticButton from '@/components/motion/MagneticButton';

export default function NotFound() {
  const { transitionTo } = useTransitionRouter();

  return (
    <div
      style={{
        backgroundColor: '#030712',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '500px', width: '100%' }}>
        
        {/* Animated broken connection lines */}
        <div style={{ width: '200px', height: '100px', margin: '0 auto 2rem' }}>
          <DrawnPath
            d="M 10,50 L 90,50 M 110,50 L 190,50"
            viewBox="0 0 200 100"
            strokeWidth={4}
            color="#ef4444"
          />
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 10px #ef4444',
              margin: '-54px auto 0',
            }}
          />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f3f4f6', letterSpacing: '0.05em' }}>
          TRANSACTION PATH NOT FOUND
        </h1>
        
        <p style={{ color: '#9ca3af', marginTop: '1rem', marginBottom: '2.5rem', lineHeight: 1.5, fontSize: '0.95rem' }}>
          La trajectoire de données demandée n'a pas pu aboutir à sa destination ou n'existe plus. Veuillez revenir à l'accueil pour initier un nouveau transfert.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <MagneticButton
            onClick={() => transitionTo('/')}
            style={{
              backgroundColor: '#c29b68',
              border: 'none',
              color: '#030712',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Retour à l'accueil
          </MagneticButton>

          <MagneticButton
            onClick={() => transitionTo('/status')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f3f4f6',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Statut des services
          </MagneticButton>
        </div>

      </div>
    </div>
  );
}
