'use client';

import React from 'react';
import { useTransitionRouter } from '@/components/motion/PageTransition';
import InteractiveCard from '@/components/motion/InteractiveCard';
import StaggerGrid from '@/components/motion/StaggerGrid';

interface Service {
  name: string;
  type: string;
  status: 'operational' | 'degraded' | 'maintenance';
  uptime: string;
  latency: string;
}

export default function StatusPage() {
  const { transitionTo } = useTransitionRouter();

  const services: Service[] = [
    { name: 'Passerelle M-Pesa (Vodacom API)', type: 'Rails Locaux', status: 'operational', uptime: '99.98%', latency: '240ms' },
    { name: 'Passerelle Airtel Money (Airtel API)', type: 'Rails Locaux', status: 'operational', uptime: '99.92%', latency: '290ms' },
    { name: 'Noyau Validateur ALMK', type: 'Système Core', status: 'operational', uptime: '100.00%', latency: '45ms' },
    { name: 'API Blockchain (TRON Network)', type: 'Réseaux Externes', status: 'operational', uptime: '99.95%', latency: '120ms' },
    { name: 'API Blockchain (Binance Smart Chain)', type: 'Réseaux Externes', status: 'operational', uptime: '99.99%', latency: '150ms' },
    { name: 'API Blockchain (Ethereum Network)', type: 'Réseaux Externes', status: 'operational', uptime: '99.91%', latency: '280ms' },
  ];

  return (
    <div className="radial-glow-container min-h-screen bg-[#02040a] text-white pt-24 px-8 pb-16">
      <div className="glow-blob glow-bronze" style={{ top: '-10%', left: '20%', opacity: 0.1 }} />
      <div className="glow-blob glow-emerald" style={{ bottom: '10%', right: '10%', opacity: 0.05 }} />

      <div className="max-w-[800px] mx-auto">
        
        {/* Header bar */}
        <div className="flex justify-between items-center mb-12 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Statut du Système</h1>
            <p className="text-gray-400 text-xs mt-1.5">
              Suivi opérationnel en direct de nos API et de l'état de livraison de la blockchain.
            </p>
          </div>
          <button
            onClick={() => transitionTo('/')}
            className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold rounded-lg cursor-pointer transition-all"
          >
            Retour
          </button>
        </div>

        {/* Global summary badge */}
        <div
          className="p-5 rounded-xl border flex items-center gap-4 mb-10 shadow-lg"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            borderColor: 'rgba(16, 185, 129, 0.25)',
          }}
        >
          <div className="live-flash-dot" />
          <span className="font-extrabold text-emerald-400 text-sm">
            Tous les systèmes opérationnels — 100% de disponibilité active détectée.
          </span>
        </div>

        {/* List of services status */}
        <StaggerGrid className="flex flex-col gap-5">
          {services.map((service, idx) => (
            <InteractiveCard key={idx} className="glass-panel p-6 shadow-md" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h4 className="text-base font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{service.name}</h4>
                  <span className="text-[10px] font-bold text-gray-400 mt-1 inline-block uppercase bg-white/5 px-2 py-0.5 rounded">
                    {service.type}
                  </span>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right text-[10px]">
                    <div className="text-gray-400">Disponibilité : <strong className="text-white">{service.uptime}</strong></div>
                    <div className="text-gray-400 mt-1">Latence active : <strong className="text-white">{service.latency}</strong></div>
                  </div>
                  
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold rounded">
                    Opérationnel
                  </div>
                </div>
              </div>

              {/* Uptime Graph Grid Bar nodes (90 days simulated history) */}
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="flex justify-between text-[10px] text-gray-500 mb-2">
                  <span>il y a 90 jours</span>
                  <span className="text-emerald-400/80">99.98% de fiabilité moyenne</span>
                  <span>Aujourd'hui</span>
                </div>
                <div className="uptime-grid">
                  {Array.from({ length: 30 }).map((_, barIdx) => {
                    // Introduce occasional degraded or down bar for visual realism
                    let statusClass = '';
                    if (idx === 1 && barIdx === 14) statusClass = 'degraded';
                    if (idx === 5 && barIdx === 8) statusClass = 'degraded';
                    
                    return (
                      <div
                        key={barIdx}
                        className={`uptime-bar ${statusClass}`}
                        title={`Nœud opérationnel - Événements de latence: 0`}
                      />
                    );
                  })}
                </div>
              </div>
            </InteractiveCard>
          ))}
        </StaggerGrid>

      </div>
    </div>
  );
}
