'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, Flip } from '@/motion/gsap';
import { useMotion } from '@/components/motion/MotionProvider';
import { useTransitionRouter } from '@/components/motion/PageTransition';
import WebGLScene from '@/components/motion/WebGLScene';
import SplitReveal from '@/components/motion/SplitReveal';
import RollingNumber from '@/components/motion/RollingNumber';
import InteractiveCard from '@/components/motion/InteractiveCard';
import MagneticButton from '@/components/motion/MagneticButton';
import AnimatedStatus from '@/components/motion/AnimatedStatus';
import SectionIntro from '@/components/motion/SectionIntro';
import StaggerGrid from '@/components/motion/StaggerGrid';
import DrawnPath from '@/components/motion/DrawnPath';
import { useAuth } from '@/components/auth/AuthProvider';
import { createTransaction } from '@/lib/db';
import AuthModal from '@/components/auth/AuthModal';

export default function Home() {
  const { quality, userSetting, setUserSetting, isWebGLSupported } = useMotion();
  const { transitionTo } = useTransitionRouter();
  const { user, logOut } = useAuth();

  // --- GENERAL STATES ---
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [txSaving, setTxSaving] = useState(false);

  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaderConcept, setLoaderConcept] = useState('CONNECT');
  const [scrolled, setScrolled] = useState(false);

  // --- SIMULATOR & CALCULATOR STATES ---
  const [payMethod, setPayMethod] = useState<'mpesa' | 'airtel'>('mpesa');
  const [amountIn, setAmountIn] = useState('150000');
  const [amountOut, setAmountOut] = useState('51.85');
  const [quoteLocked, setQuoteLocked] = useState(false);
  const [quoteTimer, setQuoteTimer] = useState(15);
  const [quoteHash, setQuoteHash] = useState('');

  // Detailed fee steps
  const [calcRate, setCalcRate] = useState(2800);
  const [calcFee, setCalcFee] = useState(2250);
  const [calcNet, setCalcNet] = useState(147750);
  const [calcSavings, setCalcSavings] = useState(6750);

  // --- LOCAL RAILS STATES ---
  const [activeRail, setActiveRail] = useState<'none' | 'mpesa' | 'airtel'>('none');

  // --- CONTACT VERIFICATION STATES ---
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'scanning' | 'result'>('idle');
  const [verifyResult, setVerifyResult] = useState<'OFFICIAL' | 'SUSPICIOUS' | 'NOT_FOUND'>('NOT_FOUND');
  const [verifyDecryptedText, setVerifyDecryptedText] = useState('');

  // --- FAQ STATES ---
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // --- REFS ---
  const headerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const simPanelRef = useRef<HTMLDivElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const calcRowRef = useRef<HTMLDivElement>(null);

  // --- PRELOADER SIMULATION ---
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setLoaderVisible(false);
        }, 600);
      }
      setLoaderProgress(progress);

      if (progress > 30 && progress <= 65) {
        setLoaderConcept('SECURE_GATE');
      } else if (progress > 65) {
        setLoaderConcept('STABLE_FLOW');
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // --- SCROLL COMPRESSION HEADER ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- SIMULATOR DEVISE CALCULATION (Wise-Style Stepper) ---
  useEffect(() => {
    const num = parseFloat(amountIn);
    if (!isNaN(num) && num > 0) {
      const rate = payMethod === 'mpesa' ? 2800 : 2820;
      const processingFee = num * 0.015; // 1.5% fee
      const netAmount = num - processingFee;
      const gasFee = 1.2; // 1.2 USDT Gas Fee
      
      setCalcRate(rate);
      setCalcFee(processingFee);
      setCalcNet(netAmount);
      setCalcSavings(processingFee + (num * 0.03)); // Represent 4.5% total bank markup savings

      const finalUsdt = Math.max(0, (netAmount / rate) - gasFee);
      setAmountOut(finalUsdt.toFixed(2));
    } else {
      setCalcRate(payMethod === 'mpesa' ? 2800 : 2820);
      setCalcFee(0);
      setCalcNet(0);
      setCalcSavings(0);
      setAmountOut('0.00');
    }
  }, [amountIn, payMethod]);

  // --- SIMULATOR LOCK COUNTDOWN ---
  useEffect(() => {
    if (!quoteLocked) return;
    if (quoteTimer <= 0) {
      setQuoteLocked(false);
      setQuoteTimer(15);
      return;
    }
    const timer = setTimeout(() => {
      setQuoteTimer((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [quoteLocked, quoteTimer]);

  // --- GSAP TRIGGER REFRESH & ANIMATIONS ---
  useGSAP(() => {
    if (loaderVisible) return;

    ScrollTrigger.refresh();

    // Fade in Navigation & Hero Content
    gsap.from('.hero-reveal', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'almkLaunch',
    });

    // Pinned scroll / scroll reveals for sections
    const blocks = gsap.utils.toArray('.blueprint-section');
    blocks.forEach((block: any) => {
      gsap.fromTo(
        block.querySelectorAll('.reveal-on-scroll'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'almkSoft',
          scrollTrigger: {
            trigger: block,
            start: 'top 80%',
          },
        }
      );
    });

  }, [loaderVisible]);

  // --- ACTIONS ---
  const handlePayMethodChange = (method: 'mpesa' | 'airtel') => {
    if (quality === 'ESSENTIAL') {
      setPayMethod(method);
      return;
    }

    const state = Flip.getState('.simulator-method-card');
    setPayMethod(method);
    setTimeout(() => {
      Flip.from(state, {
        duration: 0.4,
        ease: 'almkSoft',
        absolute: true,
      });
    }, 0);
  };

  const handleLockQuote = async () => {
    if (quoteLocked) {
      if (!recipientAddress.trim()) {
        alert('Veuillez entrer une adresse de réception USDT (TRC-20).');
        return;
      }

      if (!user) {
        setIsAuthOpen(true);
        return;
      }

      setTxSaving(true);
      try {
        await createTransaction({
          id: quoteHash,
          userId: user.uid,
          amountIn: parseFloat(amountIn),
          amountOut: parseFloat(amountOut),
          currencyIn: 'CDF',
          currencyOut: 'USDT',
          method: payMethod,
          status: 'AWAITING_PAYMENT',
          timestamp: Date.now(),
          recipientAddress: recipientAddress.trim(),
        });
        transitionTo('/dashboard');
      } catch (error) {
        console.error('Error creating transaction:', error);
        alert('Une erreur est survenue lors de l’enregistrement de la transaction.');
      } finally {
        setTxSaving(false);
      }
      return;
    }
    setQuoteLocked(true);
    setQuoteTimer(15);
    setQuoteHash('ALMK-' + Math.random().toString(36).substr(2, 9).toUpperCase());
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;

    setVerifyStatus('scanning');
    setVerifyDecryptedText('********');
    
    gsap.fromTo(
      '.verify-scan-line',
      { yPercent: 0 },
      { yPercent: 400, duration: 0.5, ease: 'none', repeat: 1, yoyo: true }
    );

    let count = 0;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    const interval = setInterval(() => {
      let rand = '';
      for (let i = 0; i < 8; i++) {
        rand += chars[Math.floor(Math.random() * chars.length)];
      }
      setVerifyDecryptedText(rand);
      count++;
      if (count >= 10) {
        clearInterval(interval);
      }
    }, 100);

    setTimeout(() => {
      setVerifyStatus('result');
      const val = verifyInput.toLowerCase();
      if (val.includes('almk.io') || val.includes('agent-007')) {
        setVerifyResult('OFFICIAL');
        setVerifyDecryptedText('ACCESS_GRANTED');
      } else if (val.includes('hack') || val.includes('promo')) {
        setVerifyResult('SUSPICIOUS');
        setVerifyDecryptedText('WARNING_THREAT');
      } else {
        setVerifyResult('NOT_FOUND');
        setVerifyDecryptedText('NODE_NOT_FOUND');
      }
    }, 1200);
  };

  return (
    <div className="radial-glow-container min-h-screen text-[#f3f4f6] font-sans selection:bg-[#c29b68]/30 selection:text-white" style={{ backgroundColor: '#02040b' }}>
      
      {/* Decorative Aurora Glowing Background Blobs */}
      <div className="glow-blob glow-bronze" style={{ top: '5%', left: '-5%', opacity: 0.08 }} />
      <div className="glow-blob glow-blue" style={{ top: '35%', right: '-10%', opacity: 0.07 }} />
      <div className="glow-blob glow-pink" style={{ bottom: '15%', left: '5%', opacity: 0.05 }} />

      {/* --- PRELOADER OVERLAY --- */}
      {loaderVisible && (
        <div
          ref={loaderRef}
          className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: '#02040a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }} className="animate-fade-in">
            <svg viewBox="0 0 120 120" style={{ width: '60px', height: '60px', margin: '0 auto 1.5rem' }}>
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#c29b68"
                strokeWidth="2"
                style={{
                  strokeDasharray: '314',
                  strokeDashoffset: 314 - (314 * loaderProgress) / 100,
                  transition: 'stroke-dashoffset 0.08s linear',
                }}
              />
              <path
                d="M40 80 L60 35 L80 80 M50 65 L70 65"
                fill="none"
                stroke="#c29b68"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f3f4f6', letterSpacing: '0.2em' }}>
              ALMK
            </div>
            <div style={{ fontSize: '0.65rem', color: '#c29b68', letterSpacing: '0.3em', marginTop: '0.5rem' }}>
              {loaderConcept}
            </div>
            <div
              style={{
                width: '140px',
                height: '1px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                margin: '1.25rem auto 0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${loaderProgress}%`,
                  height: '100%',
                  backgroundColor: '#c29b68',
                  transition: 'width 0.08s linear',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- TOP BRANDING BANNER --- */}
      <div className="live-ticker-wrap">
        <div className="live-ticker-track">
          {[1, 2].map((loopIdx) => (
            <React.Fragment key={loopIdx}>
              <div className="ticker-item">
                <span className="ticker-badge bg-emerald-500/10 text-emerald-400">NETWORK OK</span>
                <span>MPESA RDC ➔ TRC-20</span>
                <span className="text-emerald-400">[99.98% UPTIME]</span>
              </div>
              <div className="ticker-item">
                <span className="ticker-badge bg-blue-500/10 text-blue-400">RATE</span>
                <span>Index temps réel : 1 USDT = 2800 CDF</span>
                <span className="live-flash-dot" />
              </div>
              <div className="ticker-item">
                <span className="ticker-badge bg-emerald-500/10 text-emerald-400">SUCCESS</span>
                <span>TX: 0x7c...2e | 145.00 USDT | Airtel CDF</span>
              </div>
              <div className="ticker-item">
                <span className="ticker-badge bg-[#c29b68]/15 text-[#c29b68]">COMPLIANCE</span>
                <span>BCC & CENAREF Régulé</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* --- HEADER & NAVIGATION --- */}
      <header
        ref={headerRef}
        style={{
          position: 'fixed',
          top: '2.5rem',
          left: 0,
          width: '100%',
          zIndex: 9990,
          transition: 'all 0.3s ease',
          backgroundColor: scrolled ? 'rgba(2, 4, 10, 0.95)' : 'transparent',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          padding: '1.25rem 2rem',
        }}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div
            onClick={() => transitionTo('/')}
            className="cursor-pointer flex items-center gap-3"
          >
            <svg viewBox="0 0 100 100" style={{ width: '28px', height: '28px' }}>
              <path
                d="M20 80 L50 20 L80 80 M35 55 L65 55"
                fill="none"
                stroke="#c29b68"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-lg font-extrabold tracking-widest text-white uppercase">
              ALMK <span className="text-[#c29b68] text-[9px] font-semibold align-super">FLOW</span>
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-10">
            <a href="#devis" className="text-[11px] font-extrabold tracking-wider uppercase text-gray-400 hover:text-white transition-colors no-underline">Calculateur</a>
            <a href="#parcours" className="text-[11px] font-extrabold tracking-wider uppercase text-gray-400 hover:text-white transition-colors no-underline">Parcours</a>
            <a href="#technique" className="text-[11px] font-extrabold tracking-wider uppercase text-gray-400 hover:text-white transition-colors no-underline">Fiche Technique</a>
            <a href="#sécurité" className="text-[11px] font-extrabold tracking-wider uppercase text-gray-400 hover:text-white transition-colors no-underline">Sécurité</a>
            <a href="#tarifs" className="text-[11px] font-extrabold tracking-wider uppercase text-gray-400 hover:text-white transition-colors no-underline">Tarifs</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden xl:inline text-[10px] text-gray-400 font-mono">
                  {user.email || user.phoneNumber || user.uid.substring(0, 8)}
                </span>
                <button
                  onClick={() => transitionTo('/dashboard')}
                  className="bg-transparent border border-[#c29b68]/30 text-[#c29b68] px-4 py-2 rounded text-[11px] font-extrabold tracking-wider uppercase cursor-pointer hover:border-[#c29b68] hover:bg-[#c29b68]/5 transition-all"
                >
                  Dashboard
                </button>
                <button
                  onClick={logOut}
                  className="bg-transparent border border-rose-500/20 text-rose-400 px-4 py-2 rounded text-[11px] font-extrabold tracking-wider uppercase cursor-pointer hover:bg-rose-500/5 transition-all"
                >
                  Sortir
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-transparent border border-white/10 text-white px-5 py-2 rounded text-[11px] font-extrabold tracking-wider uppercase cursor-pointer hover:border-white/20 transition-all"
                >
                  Connexion
                </button>
                <button
                  onClick={() => transitionTo('/status')}
                  className="bg-[#c29b68] border-none text-[#02040a] px-5 py-2 rounded text-[11px] font-extrabold tracking-wider uppercase cursor-pointer hover:opacity-90 transition-all"
                >
                  Uptime
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================
          SECTION 1: HERO SCREEN (Minimalist 3D Core Spotlight)
          ======================================================== */}
      <section className="relative min-h-screen flex items-center blueprint-border-b pt-24">
        {/* Left Vertical Line Grid */}
        <div className="absolute left-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />
        <div className="absolute right-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />

        <div className="max-w-[1400px] mx-auto w-full px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Brand Presentation Column */}
          <div className="lg:col-span-6 flex flex-col justify-center hero-reveal">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-1.5 w-1.5 bg-[#c29b68] rounded-full" />
              <span className="text-[10px] font-extrabold tracking-[0.3em] text-[#c29b68] uppercase">
                ALMK CORE ENGINE
              </span>
            </div>

            <div className="flex flex-col mb-8 select-none">
              <h1 className="display-title text-outline-premium">ALMK</h1>
              <h1 className="display-title text-white">CORE</h1>
              <h1 className="display-title text-[#c29b68]">FLOW</h1>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-10">
              Passerelle financière cinématique et automatisée reliant l'Afrique Centrale à la blockchain globale. Convertissez instantanément vos devises locales Mobiles Money en stablecoins USDT vers votre portefeuille.
            </p>

            <div className="flex gap-4">
              <a href="#devis" className="no-underline">
                <button className="bg-[#c29b68] text-black border-none px-8 py-4 rounded text-xs font-extrabold tracking-widest uppercase cursor-pointer hover:opacity-95 transition-all">
                  Lancer le Convertisseur
                </button>
              </a>
              <a href="#parcours" className="no-underline">
                <button className="bg-transparent border border-white/10 text-white px-8 py-4 rounded text-xs font-extrabold tracking-widest uppercase cursor-pointer hover:border-white/20 transition-all">
                  Découvrir
                </button>
              </a>
            </div>
          </div>

          {/* 3D Asset Spotlight Column */}
          <div className="lg:col-span-6 flex justify-center items-center relative hero-reveal">
            <div className="w-full max-w-[500px] aspect-square rounded-xl border border-white/5 bg-black/40 corner-ticks relative overflow-hidden flex items-center justify-center">
              <div className="tick-tr" />
              <div className="tick-bl" />
              
              {/* WebGL Scene Container */}
              <div className="absolute inset-0 w-full h-full">
                <WebGLScene />
              </div>
              
              {/* Overlay Blueprint Info Overlay */}
              <div className="absolute bottom-6 left-6 font-mono text-[9px] text-gray-500 flex flex-col gap-1 z-20 bg-black/60 px-3 py-2 rounded border border-white/5">
                <div>SYS_STATUS: OPERATIONAL</div>
                <div>CORE_TEMP: OPTIMAL</div>
                <div>ENTROPY_KEY: 0x8a..7c</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: CONVERTISSEUR & LIVE EVENT LOG (100vh)
          ======================================================== */}
      <section id="devis" className="relative min-h-screen flex items-center blueprint-border-b py-24 blueprint-section">
        <div className="absolute left-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />
        <div className="absolute right-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />

        <div className="max-w-[1400px] mx-auto w-full px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Wise Calculator container */}
          <div className="lg:col-span-6 reveal-on-scroll">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#c29b68] uppercase">01 / TRANSACTION SIMULATOR</span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-white mb-6 uppercase tracking-tight">Convertir mes fonds</h2>
            
            <div className="glass-panel p-8 corner-ticks relative border border-white/5">
              <div className="tick-tr" />
              <div className="tick-bl" />

              <div className="mb-6 flex justify-between items-center">
                <span className="text-xs font-mono text-gray-400">CDF ➔ USDT (TRC-20)</span>
                {quoteLocked ? (
                  <span className="text-rose-500 text-[10px] font-bold font-mono bg-rose-500/10 px-2 py-0.5 rounded">
                    QUOTE SECURED: {quoteTimer}S
                  </span>
                ) : (
                  <span className="live-flash-dot" />
                )}
              </div>

              {/* Devise Picker */}
              <div className="flex gap-2.5 mb-6">
                <div
                  onClick={() => !quoteLocked && handlePayMethodChange('mpesa')}
                  className="flex-1 py-3 text-center cursor-pointer rounded border font-mono text-[11px] font-extrabold tracking-wider uppercase transition-all duration-300"
                  style={{
                    cursor: quoteLocked ? 'not-allowed' : 'pointer',
                    borderColor: payMethod === 'mpesa' ? '#c29b68' : 'rgba(255,255,255,0.05)',
                    backgroundColor: payMethod === 'mpesa' ? 'rgba(194, 155, 104, 0.04)' : 'transparent',
                    color: payMethod === 'mpesa' ? '#c29b68' : '#9ca3af',
                  }}
                >
                  M-Pesa CDF
                </div>
                <div
                  onClick={() => !quoteLocked && handlePayMethodChange('airtel')}
                  className="flex-1 py-3 text-center cursor-pointer rounded border font-mono text-[11px] font-extrabold tracking-wider uppercase transition-all duration-300"
                  style={{
                    cursor: quoteLocked ? 'not-allowed' : 'pointer',
                    borderColor: payMethod === 'airtel' ? '#c29b68' : 'rgba(255,255,255,0.05)',
                    backgroundColor: payMethod === 'airtel' ? 'rgba(194, 155, 104, 0.04)' : 'transparent',
                    color: payMethod === 'airtel' ? '#c29b68' : '#9ca3af',
                  }}
                >
                  Airtel Money CDF
                </div>
              </div>

              {/* Amount In */}
              <div className="relative mb-5">
                <label className="text-[9px] text-gray-500 font-extrabold block mb-2 tracking-widest uppercase">
                  Montant en Francs Congolais
                </label>
                <div className="relative">
                  <input
                    type="number"
                    disabled={quoteLocked}
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    className="w-full bg-black/60 border border-white/5 px-4 py-3.5 rounded text-white text-lg font-bold font-mono outline-none focus:border-[#c29b68]/30 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold text-xs font-mono">
                    CDF
                  </span>
                </div>
              </div>

              {/* Stepper Details */}
              <div className="calculator-stepper">
                <div className="stepper-node">
                  <div className="stepper-dot">−</div>
                  <div className="stepper-content">
                    Frais de traitement ALMK (1.5%) :{' '}
                    <strong className="text-white font-mono">{calcFee.toLocaleString('fr-FR')} CDF</strong>
                  </div>
                </div>
                <div className="stepper-node">
                  <div className="stepper-dot">=</div>
                  <div className="stepper-content">
                    Montant net converti :{' '}
                    <strong className="text-white font-mono">{calcNet.toLocaleString('fr-FR')} CDF</strong>
                  </div>
                </div>
                <div className="stepper-node active">
                  <div className="stepper-dot" style={{ border: 'none' }}><span className="live-flash-dot" /></div>
                  <div className="stepper-content">
                    Taux garanti (15s) :{' '}
                    <strong className="text-[#c29b68] font-mono">1 USDT = {calcRate} CDF</strong>
                  </div>
                </div>
                <div className="stepper-node">
                  <div className="stepper-dot">−</div>
                  <div className="stepper-content">
                    Frais réseau blockchain : <strong className="text-rose-400 font-mono">1.2 USDT</strong>
                  </div>
                </div>
              </div>

              {/* Amount Out */}
              <div className="relative mb-6">
                <label className="text-[9px] text-gray-500 font-extrabold block mb-2 tracking-widest uppercase">
                  USDT Estimés
                </label>
                <div className="flex items-center bg-black/40 border border-white/5 px-4 py-3.5 rounded">
                  <RollingNumber value={amountOut} className="font-bold text-white text-lg font-mono" />
                  <span className="ml-auto text-emerald-400 font-extrabold text-xs font-mono">
                    USDT
                  </span>
                </div>
                {calcSavings > 0 && (
                  <div className="text-[9px] text-emerald-400/80 mt-2 font-mono flex items-center gap-1.5">
                    <span>⚡</span> Économie de {Math.round(calcSavings).toLocaleString('fr-FR')} CDF face aux intermédiaires bancaires.
                  </div>
                )}
              </div>

              {/* Lock Quote Fields */}
              {quoteLocked && (
                <div className="flex flex-col gap-4 mb-6 animate-slide-up bg-black/30 p-4 rounded border border-[#c29b68]/10">
                  <div className="flex justify-between text-[10px] font-mono text-gray-400 border-b border-white/5 pb-2">
                    <span>DEV_HASH :</span>
                    <span className="font-bold text-[#c29b68]">{quoteHash}</span>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 font-extrabold block mb-1.5 tracking-widest uppercase">
                      ADRESSE BLOCKCHAIN DE RÉCEPTION (TRC-20)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: TXyZ9... (Doit commencer par T)"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full bg-black border border-white/10 px-4 py-2.5 rounded text-white text-xs font-mono outline-none focus:border-[#c29b68]/40 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleLockQuote}
                className="w-full py-4 rounded text-black font-extrabold text-xs tracking-widest uppercase border-none cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{
                  backgroundColor: quoteLocked ? '#10b981' : '#c29b68',
                }}
              >
                {quoteLocked ? (txSaving ? 'PROCESS...' : 'Confirmer le transfert') : 'Obtenir le Taux de change'}
              </button>
            </div>
          </div>

          {/* High-tech Operations Panel Column */}
          <div className="lg:col-span-6 reveal-on-scroll">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#c29b68] uppercase">02 / CORE OPERATIONS HANDSHAKE</span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-white mb-6 uppercase tracking-tight">Handshake Moniteur</h2>
            
            <div className="cyber-terminal rounded-xl overflow-hidden flex flex-col shadow-2xl p-6 relative border border-white/5" style={{ minHeight: '380px' }}>
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">LIVE_OPERATIONS_FEED</span>
                </div>
                <span className="text-[9px] font-mono text-gray-500">SYS_V: 10.92</span>
              </div>

              <div className="flex-1 flex flex-col justify-between font-mono text-[11px] text-[#6ee7b7]">
                <div className="flex flex-col gap-2.5">
                  <div className="text-gray-500">&gt; initialising web_socket connection...</div>
                  <div className="text-[#c29b68]">&gt; channel connected to Vodacom RDC API. latency: 12ms</div>
                  <div>&gt; gas fee calculation complete: 1.20 USDT</div>
                  <div>&gt; exchange rate matching Binance market feed: 2,800 CDF/USDT</div>
                  <div className="text-gray-500">&gt; security layers check: Fireblocks vault secure.</div>
                  <div className="text-emerald-400 font-bold">&gt; gateway: online. Waiting for user transfer.</div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="border border-white/5 p-2 rounded">
                      <div className="text-gray-500 text-[8px] uppercase tracking-wider">M-Pesa status</div>
                      <div className="text-emerald-400 font-bold text-xs mt-1">ONLINE</div>
                    </div>
                    <div className="border border-white/5 p-2 rounded">
                      <div className="text-gray-500 text-[8px] uppercase tracking-wider">Airtel status</div>
                      <div className="text-emerald-400 font-bold text-xs mt-1">ONLINE</div>
                    </div>
                    <div className="border border-white/5 p-2 rounded">
                      <div className="text-gray-500 text-[8px] uppercase tracking-wider">Vault status</div>
                      <div className="text-emerald-400 font-bold text-xs mt-1">LOCKED</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 3: PARCOURS / STEPPER (100vh Layout)
          ======================================================= */}
      <section id="parcours" className="relative min-h-screen flex items-center blueprint-border-b py-24 blueprint-section">
        <div className="absolute left-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />
        <div className="absolute right-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />

        <div className="max-w-[1400px] mx-auto w-full px-8">
          <div className="flex items-center gap-2 mb-4 reveal-on-scroll">
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#c29b68] uppercase">03 / FLOW PARCOURS</span>
          </div>
          
          <h2 className="text-4xl font-extrabold text-white mb-16 uppercase tracking-tight reveal-on-scroll">Étapes du Transfert</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 reveal-on-scroll">
            
            {/* Step 1 */}
            <div className="glass-panel p-6 border border-white/5 corner-ticks relative flex flex-col justify-between" style={{ minHeight: '220px' }}>
              <div className="tick-tr" />
              <div>
                <span className="text-outline-premium text-4xl font-mono font-bold">01</span>
                <h4 className="text-sm font-extrabold text-white uppercase mt-4 mb-2 tracking-wide">Simulation</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Saisissez les Francs Congolais (CDF) et récupérez notre taux garanti stable sans frais cachés.
                </p>
              </div>
              <div className="text-[9px] font-mono text-[#c29b68] mt-4 uppercase">Lock: 15s</div>
            </div>

            {/* Step 2 */}
            <div className="glass-panel p-6 border border-white/5 corner-ticks relative flex flex-col justify-between" style={{ minHeight: '220px' }}>
              <div className="tick-tr" />
              <div>
                <span className="text-outline-premium text-4xl font-mono font-bold">02</span>
                <h4 className="text-sm font-extrabold text-white uppercase mt-4 mb-2 tracking-wide">Adresse</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Renseignez l'adresse de réception USDT de votre portefeuille blockchain.
                </p>
              </div>
              <div className="text-[9px] font-mono text-[#c29b68] mt-4 uppercase">Network check</div>
            </div>

            {/* Step 3 */}
            <div className="glass-panel p-6 border border-white/5 corner-ticks relative flex flex-col justify-between" style={{ minHeight: '220px' }}>
              <div className="tick-tr" />
              <div>
                <span className="text-outline-premium text-4xl font-mono font-bold">03</span>
                <h4 className="text-sm font-extrabold text-white uppercase mt-4 mb-2 tracking-wide">Dépôt Telco</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Envoyez les fonds CDF depuis votre menu mobile (M-Pesa / Airtel Money).
                </p>
              </div>
              <div className="text-[9px] font-mono text-[#c29b68] mt-4 uppercase">Telco secure</div>
            </div>

            {/* Step 4 */}
            <div className="glass-panel p-6 border border-white/5 corner-ticks relative flex flex-col justify-between" style={{ minHeight: '220px' }}>
              <div className="tick-tr" />
              <div>
                <span className="text-outline-premium text-4xl font-mono font-bold">04</span>
                <h4 className="text-sm font-extrabold text-white uppercase mt-4 mb-2 tracking-wide">Validation</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Nos serveurs API valident instantanément la réception du paiement Mobile Money.
                </p>
              </div>
              <div className="text-[9px] font-mono text-[#c29b68] mt-4 uppercase">Async verification</div>
            </div>

            {/* Step 5 */}
            <div className="glass-panel p-6 border border-white/5 corner-ticks relative flex flex-col justify-between" style={{ minHeight: '220px' }}>
              <div className="tick-tr" />
              <div>
                <span className="text-outline-premium text-4xl font-mono font-bold">05</span>
                <h4 className="text-sm font-extrabold text-white uppercase mt-4 mb-2 tracking-wide">USDT Reçus</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Les tokens USDT sont libérés de la réserve et expédiés vers votre portefeuille.
                </p>
              </div>
              <div className="text-[9px] font-mono text-[#10b981] mt-4 uppercase font-bold">Done in &lt; 3min</div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 4: TECHNICAL SHEETS (Rails, Networks, Tiers Grid)
          ======================================================== */}
      <section id="technique" className="relative min-h-screen flex items-center blueprint-border-b py-24 blueprint-section">
        <div className="absolute left-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />
        <div className="absolute right-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />

        <div className="max-w-[1400px] mx-auto w-full px-8">
          <div className="flex items-center gap-2 mb-4 reveal-on-scroll">
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#c29b68] uppercase">04 / SPECIFICATIONS & LIMITS</span>
          </div>
          
          <h2 className="text-4xl font-extrabold text-white mb-16 uppercase tracking-tight reveal-on-scroll">Fiche Technique</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch reveal-on-scroll">
            
            {/* Local Rails Panel */}
            <div className="glass-panel p-8 border border-white/5 corner-ticks relative flex flex-col justify-between">
              <div className="tick-tr" />
              <div>
                <h4 className="text-base font-extrabold text-white uppercase tracking-wider border-b border-white/5 pb-4 mb-6">
                  🔌 RAILS D'ACCÈS LOCAUX
                </h4>
                <div className="flex flex-col gap-5">
                  <div
                    onMouseEnter={() => setActiveRail('mpesa')}
                    onMouseLeave={() => setActiveRail('none')}
                    className="p-4 rounded border transition-all"
                    style={{
                      borderColor: activeRail === 'mpesa' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                      backgroundColor: activeRail === 'mpesa' ? 'rgba(59, 130, 246, 0.04)' : 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <div className="font-extrabold text-[#3b82f6] text-xs font-mono mb-1">M-PESA VODACOM RDC</div>
                    <div className="text-[10px] text-gray-400">Canal asynchrone principal. Taux de réussite: 99.8%.</div>
                  </div>

                  <div
                    onMouseEnter={() => setActiveRail('airtel')}
                    onMouseLeave={() => setActiveRail('none')}
                    className="p-4 rounded border transition-all"
                    style={{
                      borderColor: activeRail === 'airtel' ? '#ec4899' : 'rgba(255,255,255,0.05)',
                      backgroundColor: activeRail === 'airtel' ? 'rgba(236, 72, 153, 0.04)' : 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <div className="font-extrabold text-[#ec4899] text-xs font-mono mb-1">AIRTEL MONEY</div>
                    <div className="text-[10px] text-gray-400">Passerelle de secours. Redondance multi-canaux active.</div>
                  </div>
                </div>
              </div>
              <div className="text-[9px] font-mono text-gray-500 mt-8">SELECT_TELCO_RAIL: HOVER_TO_INSPECT</div>
            </div>

            {/* Blockchain Networks Panel */}
            <div className="glass-panel p-8 border border-white/5 corner-ticks relative flex flex-col justify-between">
              <div className="tick-tr" />
              <div>
                <h4 className="text-base font-extrabold text-white uppercase tracking-wider border-b border-white/5 pb-4 mb-6">
                  🔗 PROTOCOLES CRYPTO
                </h4>
                <div className="flex flex-col gap-4 font-mono text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">TRC-20 (TRON) :</span>
                    <span className="text-emerald-400 font-bold">1.2 USDT Gas | ~1 min</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">BEP-20 (BSC) :</span>
                    <span className="text-[#c29b68] font-bold">0.8 USDT Gas | ~2 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ERC-20 (ETH) :</span>
                    <span className="text-rose-400 font-bold">4.5 USDT Gas | ~5 mins</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed mt-6">
                  Par défaut, TRON (TRC-20) est recommandé pour assurer une rapidité optimale et minimiser les frais de transfert réseau blockchain.
                </p>
              </div>
              <div className="text-[9px] font-mono text-gray-500 mt-8">TARGET_BLOCKCHAIN: TRON_MAINNET</div>
            </div>

            {/* KYC Compliance Levels Panel */}
            <div className="glass-panel p-8 border border-white/5 corner-ticks relative flex flex-col justify-between">
              <div className="tick-tr" />
              <div>
                <h4 className="text-base font-extrabold text-white uppercase tracking-wider border-b border-white/5 pb-4 mb-6">
                  🛡️ LIMITES KYC & TIERS
                </h4>
                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white font-extrabold">TIER 1 (SMS)</span>
                    <span className="text-[#c29b68] font-mono">500 USD / Jour</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white font-extrabold">TIER 2 (Pièce ID)</span>
                    <span className="text-[#c29b68] font-mono">5 000 USD / Jour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white font-extrabold">TIER 3 (Justificatif)</span>
                    <span className="text-emerald-400 font-mono">Illimité</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed mt-6">
                  Paliers requis pour garantir le respect strict des réglementations en vigueur édictées par la Banque Centrale du Congo.
                </p>
              </div>
              <div className="text-[9px] font-mono text-gray-500 mt-8">COMPLIANCE_LEVEL: REGULATED</div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 5: SECURITY VERIFICATION (Verify Handshake)
          ======================================================== */}
      <section id="sécurité" className="relative min-h-screen flex items-center blueprint-border-b py-24 blueprint-section bg-rose-500/[0.01]">
        <div className="absolute left-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />
        <div className="absolute right-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />

        <div className="max-w-[1400px] mx-auto w-full px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Warning Column */}
          <div className="lg:col-span-6 reveal-on-scroll">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-extrabold tracking-[0.2em] text-rose-400 uppercase">05 / RISK PREVENT</span>
            </div>
            
            <h2 className="text-4xl font-extrabold text-white mb-6 uppercase tracking-tight">Vigilance & Risques</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              ALMK Flow emploie des signatures cryptographiques uniques. Ne faites confiance à aucune communication qui ne provient pas d'un canal officiel ou d'un agent enregistré.
            </p>

            <div className="p-6 rounded border border-rose-500/20 bg-rose-500/5">
              <div className="text-2xl mb-2">⚠️ RULE_01</div>
              <p className="text-rose-300/80 text-[11px] leading-relaxed">
                ALMK ne vous demandera <strong>JAMAIS</strong> vos clés privées, codes PIN Mobile Money ou mots de passe. Protégez vos informations confidentielles contre toute tentative de phishing.
              </p>
            </div>
          </div>

          {/* Verification Console Column */}
          <div className="lg:col-span-6 reveal-on-scroll">
            <div className="cyber-terminal rounded-xl overflow-hidden flex flex-col shadow-2xl p-6 relative border border-[#10b981]/20">
              {verifyStatus === 'scanning' && (
                <div
                  className="verify-scan-line"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                  }}
                />
              )}

              <div className="flex justify-between items-center border-b border-[#10b981]/20 pb-4 mb-4">
                <span className="text-[10px] font-mono text-[#10b981] uppercase tracking-widest">SIGNATURE_DECRYPTOR</span>
                <span className="text-[9px] font-mono text-gray-500">v2.10-sec</span>
              </div>

              <div className="flex-1 flex flex-col justify-between font-mono text-[11px]">
                <div>
                  <p className="text-[#6ee7b7] text-[10px] mb-4">
                    Saisissez l'ID ou le domaine d'un agent ALMK pour tester son intégrité cryptographique :
                  </p>

                  <form onSubmit={handleVerify} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: agent-007 ou verify@almk.io"
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                      className="flex-1 bg-black border border-[#10b981]/40 text-[#6ee7b7] px-3.5 py-2 rounded text-xs outline-none focus:border-[#10b981]"
                    />
                    <button
                      type="submit"
                      disabled={verifyStatus === 'scanning'}
                      className="bg-[#10b981] text-black px-4 py-2 rounded font-bold text-xs border-none cursor-pointer"
                    >
                      Scanner
                    </button>
                  </form>
                </div>

                {verifyStatus !== 'idle' && (
                  <div className="mt-6 bg-black/40 border border-[#10b981]/20 p-4 rounded text-[#6ee7b7]">
                    <div className="flex justify-between font-bold border-b border-[#10b981]/10 pb-2 mb-2">
                      <span>VERIFICATION LOG</span>
                      <span className={verifyStatus === 'scanning' ? 'text-blue-400' : verifyResult === 'OFFICIAL' ? 'text-emerald-400' : 'text-rose-500'}>
                        {verifyStatus === 'scanning' ? 'ANALYSING...' : 'FINISH'}
                      </span>
                    </div>
                    <div>&gt; TARGET_NODE: {verifyInput}</div>
                    {verifyStatus === 'scanning' ? (
                      <div>&gt; DECRYPTING... PENDING</div>
                    ) : (
                      <>
                        <div>&gt; NODE_SIGNATURE: {verifyResult === 'OFFICIAL' ? 'ALMK_VERIFIED_SIGNATURE' : verifyResult === 'SUSPICIOUS' ? 'ALERT_DUBIOUS_SIGNATURE' : 'NOT_FOUND_NODE'}</div>
                        <div className="flex justify-between mt-3 font-bold text-xs border-t border-[#10b981]/10 pt-2">
                          <span>VERDICT_DECRYPTION:</span>
                          <span className={verifyResult === 'OFFICIAL' ? 'text-emerald-400' : verifyResult === 'SUSPICIOUS' ? 'text-rose-500' : 'text-yellow-500'}>
                            {verifyDecryptedText}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 6: TARIFICATION & FAQ & FOOTER
          ======================================================== */}
      <section id="tarifs" className="relative blueprint-section py-24">
        <div className="absolute left-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />
        <div className="absolute right-[8%] top-0 bottom-0 w-px bg-white/5 pointer-events-none hidden md:block" />

        <div className="max-w-[1400px] mx-auto px-8 border-t border-white/5 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Pricing Details */}
            <div className="lg:col-span-5 reveal-on-scroll">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#c29b68] uppercase">06 / COST ACCURACY</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-6 uppercase tracking-tight">Index Tarifs Fixes</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Taux de base interbancaire avec une transparence de frais garantie, sans surcharge inattendue.
              </p>

              <div className="flex flex-col gap-4 font-mono text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Index Marché :</span>
                  <span className="text-white">Binance live feed</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Marge ALMK :</span>
                  <span className="text-[#c29b68] font-bold">1.5% fixe</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Marge Opérateurs Telco :</span>
                  <span className="text-white">0% (Intégré)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Réseau Blockchain Gas :</span>
                  <span className="text-emerald-400 font-bold">1.2 USDT fixe</span>
                </div>
              </div>
            </div>

            {/* Accordion FAQ Column */}
            <div className="lg:col-span-7 reveal-on-scroll">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#c29b68] uppercase">07 / ACCORDION HELPDESK</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-8 uppercase tracking-tight">Questions Fréquentes</h2>

              <div className="flex flex-col gap-3">
                {/* Accordion 1 */}
                <div className="border border-white/5 rounded bg-black/20 overflow-hidden">
                  <div
                    onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)}
                    className="p-4 flex justify-between items-center cursor-pointer font-bold text-xs uppercase tracking-wider"
                  >
                    <span>Délai moyen de traitement Mobile Money ?</span>
                    <span className="text-gray-400">{activeFaq === 0 ? '−' : '+'}</span>
                  </div>
                  {activeFaq === 0 && (
                    <div className="px-4 pb-4 text-gray-400 text-xs leading-relaxed animate-fade-in font-sans">
                      Les transactions de Mobile money sont traitées de manière synchrone par nos connexions API avec Airtel & M-Pesa. Vos tokens USDT arrivent sur votre adresse de destination dans un délai de 3 minutes environ.
                    </div>
                  )}
                </div>

                {/* Accordion 2 */}
                <div className="border border-white/5 rounded bg-black/20 overflow-hidden">
                  <div
                    onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
                    className="p-4 flex justify-between items-center cursor-pointer font-bold text-xs uppercase tracking-wider"
                  >
                    <span>Puis-je utiliser d'autres réseaux blockchain ?</span>
                    <span className="text-gray-400">{activeFaq === 1 ? '−' : '+'}</span>
                  </div>
                  {activeFaq === 1 && (
                    <div className="px-4 pb-4 text-gray-400 text-xs leading-relaxed animate-fade-in font-sans">
                      Oui, nous supportons également les réseaux BEP-20 (Binance Smart Chain) et ERC-20 (Ethereum). Par défaut, notre simulateur utilise le réseau TRON (TRC-20) en raison de ses frais de gaz exceptionnellement bas.
                    </div>
                  )}
                </div>

                {/* Accordion 3 */}
                <div className="border border-white/5 rounded bg-black/20 overflow-hidden">
                  <div
                    onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
                    className="p-4 flex justify-between items-center cursor-pointer font-bold text-xs uppercase tracking-wider"
                  >
                    <span>Comment joindre le support technique d'ALMK ?</span>
                    <span className="text-gray-400">{activeFaq === 2 ? '−' : '+'}</span>
                  </div>
                  {activeFaq === 2 && (
                    <div className="px-4 pb-4 text-gray-400 text-xs leading-relaxed animate-fade-in font-sans">
                      Notre équipe support est disponible par ticket depuis votre espace client (Dashboard) 24h/24 et 7j/7 ou directement par courriel.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER & TRUST GRID --- */}
      <footer className="border-t border-white/10 py-16 text-gray-400 text-xs">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col gap-12">
          
          {/* Regulatory Trust Icons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-white/5 pb-12">
            <div className="border-l border-white/5 pl-4">
              <h5 className="text-white font-extrabold text-[11px] uppercase tracking-wider mb-2">🔐 Sécurité Séquestre</h5>
              <p className="text-[10px] leading-relaxed">
                Toutes les transactions CDF transitent par des comptes séquestres locaux certifiés.
              </p>
            </div>
            <div className="border-l border-white/5 pl-4">
              <h5 className="text-white font-extrabold text-[11px] uppercase tracking-wider mb-2">💼 Garde Institutionnelle</h5>
              <p className="text-[10px] leading-relaxed">
                Les réserves d'USDT sont gardées sur des portefeuilles multi-signature Fireblocks conformes.
              </p>
            </div>
            <div className="border-l border-white/5 pl-4">
              <h5 className="text-white font-extrabold text-[11px] uppercase tracking-wider mb-2">🏛️ Régulé & Conforme</h5>
              <p className="text-[10px] leading-relaxed">
                Conformité stricte aux exigences de la Banque Centrale du Congo (BCC) et de la CENAREF.
              </p>
            </div>
            <div className="border-l border-white/5 pl-4">
              <h5 className="text-white font-extrabold text-[11px] uppercase tracking-wider mb-2">💳 Certification PCI-DSS</h5>
              <p className="text-[10px] leading-relaxed">
                Standard international le plus élevé pour le chiffrement des données de paiement.
              </p>
            </div>
          </div>

          {/* Main Footer Links */}
          <div className="flex flex-col md:flex-row md:justify-between gap-8">
            <div>
              <div className="text-white font-extrabold text-base mb-2 tracking-widest uppercase">
                ALMK <span className="text-[#c29b68]">FLOW</span>
              </div>
              <p className="max-w-xs leading-relaxed text-[11px]">
                La passerelle financière cinématique et ultrasécurisée reliant l'Afrique Centrale à la blockchain globale.
              </p>
            </div>
            <div className="flex gap-16 flex-wrap">
              <div className="flex flex-col gap-2 font-mono text-[10px]">
                <span className="font-extrabold text-white uppercase tracking-wider mb-1">Ressources</span>
                <a href="#devis" className="hover:text-white no-underline text-gray-400">Calculateur</a>
                <a href="#technique" className="hover:text-white no-underline text-gray-400">Fiche Technique</a>
                <a href="#sécurité" className="hover:text-white no-underline text-gray-400">Verify-Handshake</a>
                <a href="#tarifs" className="hover:text-white no-underline text-gray-400">Tarifs</a>
              </div>
              <div className="flex flex-col gap-2 font-mono text-[10px]">
                <span className="font-extrabold text-white uppercase tracking-wider mb-1">Légal</span>
                <a href="#" className="hover:text-white no-underline text-gray-400">Confidentialité</a>
                <a href="#" className="hover:text-white no-underline text-gray-400">CGU</a>
                <a href="#" className="hover:text-white no-underline text-gray-400">Mentions Légales</a>
              </div>
            </div>
          </div>

          <div className="text-center mt-4 border-t border-white/5 pt-8 text-[9px] font-mono">
            &copy; {new Date().getFullYear()} ALMK Flow. TOUS DROITS RÉSERVÉS.
          </div>
        </div>
      </footer>

      {/* --- DEBUG DEVELOPER MOTION PANEL --- */}
      {process.env.NODE_ENV !== 'production' && (
        <div
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(2, 4, 10, 0.95)',
            border: '1px solid #c29b68',
            borderRadius: '8px',
            padding: '1rem',
            width: '240px',
            zIndex: 99999,
            fontSize: '0.75rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontWeight: 800, color: '#c29b68', borderBottom: '1px solid rgba(194, 155, 104, 0.3)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
            ALMK FLOW CONTROL
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Qualité active :</span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>{quality}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>WebGL :</span>
              <span style={{ fontWeight: 700, color: isWebGLSupported ? '#10b981' : '#ef4444' }}>
                {isWebGLSupported ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Mode de Mouvement :</label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(['full', 'reduced', 'off'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setUserSetting(mode)}
                    className="flex-1 py-1 border-none rounded cursor-pointer font-bold text-[10px] transition-colors"
                    style={{
                      backgroundColor: userSetting === mode ? '#c29b68' : 'rgba(255,255,255,0.05)',
                      color: userSetting === mode ? '#02040a' : '#f3f4f6',
                    }}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- AUTH MODAL DIALOG --- */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

    </div>
  );
}
