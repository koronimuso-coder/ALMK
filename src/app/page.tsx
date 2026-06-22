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

  // --- SIMULATOR & WISE CALCULATOR STATES ---
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
      progress += Math.floor(Math.random() * 12) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setLoaderVisible(false);
        }, 800);
      }
      setLoaderProgress(progress);

      if (progress > 30 && progress <= 65) {
        setLoaderConcept('VERIFY');
      } else if (progress > 65) {
        setLoaderConcept('TRANSFER');
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // --- SCROLL COMPRESSION HEADER ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
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
      y: 45,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'almkLaunch',
    });

    // Pinned scroll for 'Comment ça marche'
    if (quality === 'FULL') {
      const steps = gsap.utils.toArray('.step-node-item');
      steps.forEach((step: any) => {
        gsap.fromTo(
          step,
          { opacity: 0.25, scale: 0.96 },
          {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              trigger: step,
              start: 'top 80%',
              end: 'bottom 50%',
              scrub: true,
            },
          }
        );
      });
    }

    // Connect Lines in Pricing calculation
    if (quality !== 'ESSENTIAL' && calcRowRef.current) {
      gsap.from('.calc-connector-line', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: calcRowRef.current,
          start: 'top 85%',
        },
      });
    }
  }, [loaderVisible, quality]);

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
    <div className="radial-glow-container min-h-screen text-[#f3f4f6] font-sans selection:bg-[#c29b68]/30 selection:text-white" style={{ backgroundColor: '#02040a' }}>
      
      {/* Decorative Aurora Glowing Background Blobs */}
      <div className="glow-blob glow-bronze" style={{ top: '5%', left: '-5%', opacity: 0.15 }} />
      <div className="glow-blob glow-blue" style={{ top: '35%', right: '-10%', opacity: 0.12 }} />
      <div className="glow-blob glow-pink" style={{ bottom: '15%', left: '5%', opacity: 0.08 }} />
      <div className="glow-blob glow-emerald" style={{ top: '65%', right: '15%', opacity: 0.12 }} />

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
          <div style={{ textAlign: 'center' }}>
            <svg viewBox="0 0 120 120" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#c29b68"
                strokeWidth="2.5"
                style={{
                  strokeDasharray: '314',
                  strokeDashoffset: 314 - (314 * loaderProgress) / 100,
                  transition: 'stroke-dashoffset 0.1s linear',
                }}
              />
              <path
                d="M40 80 L60 35 L80 80 M50 65 L70 65"
                fill="none"
                stroke="#c29b68"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f3f4f6', letterSpacing: '0.15em' }}>
              ALMK
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c29b68', letterSpacing: '0.25em', marginTop: '0.5rem' }}>
              {loaderConcept}
            </div>
            <div
              style={{
                width: '180px',
                height: '2px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                margin: '1.5rem auto 0',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${loaderProgress}%`,
                  height: '100%',
                  backgroundColor: '#c29b68',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- LIVE TRANSACTION TICKER --- */}
      <div className="live-ticker-wrap">
        <div className="live-ticker-track">
          {[1, 2].map((loopIdx) => (
            <React.Fragment key={loopIdx}>
              <div className="ticker-item">
                <span className="ticker-badge bg-emerald-500/10 text-emerald-400">LIVE</span>
                <span>Achat Réussi:</span>
                <strong className="text-white">145.00 USDT</strong>
                <span>par M-Pesa</span>
                <span className="text-[#c29b68]">TX: 0x7c...2e</span>
                <span className="text-gray-400">(il y a 1 min)</span>
              </div>
              <div className="ticker-item">
                <span className="ticker-badge bg-blue-500/10 text-blue-400">RATE</span>
                <span>Taux de change garanti :</span>
                <strong className="text-white">1 USDT = 2800 CDF</strong>
                <span className="live-flash-dot" />
              </div>
              <div className="ticker-item">
                <span className="ticker-badge bg-emerald-500/10 text-emerald-400">LIVE</span>
                <span>Achat Réussi:</span>
                <strong className="text-white">350.00 USDT</strong>
                <span>par Airtel Money</span>
                <span className="text-[#c29b68]">TX: 0x9a...1a</span>
                <span className="text-gray-400">(il y a 3 min)</span>
              </div>
              <div className="ticker-item">
                <span className="ticker-badge bg-rose-500/10 text-rose-400">SECURITY</span>
                <span>Passerelle TRC-20 opérationnelle</span>
                <span className="text-emerald-400">[99.98% uptime]</span>
              </div>
              <div className="ticker-item">
                <span className="ticker-badge bg-emerald-500/10 text-emerald-400">LIVE</span>
                <span>Achat Réussi:</span>
                <strong className="text-white">85.00 USDT</strong>
                <span>par M-Pesa</span>
                <span className="text-[#c29b68]">TX: 0x3d...8b</span>
                <span className="text-gray-400">(il y a 5 min)</span>
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
          backgroundColor: scrolled ? 'rgba(2, 4, 10, 0.85)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(194,155,104,0.15)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          padding: scrolled ? '0.75rem 2rem' : '1.25rem 2rem',
        }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div
            onClick={() => transitionTo('/')}
            className="cursor-pointer flex items-center gap-2.5"
          >
            <svg viewBox="0 0 100 100" style={{ width: '36px', height: '36px' }}>
              <path
                d="M20 80 L50 20 L80 80 M35 55 L65 55"
                fill="none"
                stroke="#c29b68"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xl font-extrabold tracking-wider text-white">
              ALMK <span className="text-[#c29b68] text-xs font-semibold align-super">FLOW</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#devis" className="text-sm font-semibold text-gray-400 hover:text-[#c29b68] transition-colors no-underline">Calculateur</a>
            <a href="#how-to" className="text-sm font-semibold text-gray-400 hover:text-[#c29b68] transition-colors no-underline">Parcours</a>
            <a href="#rails" className="text-sm font-semibold text-gray-400 hover:text-[#c29b68] transition-colors no-underline">Rails Locaux</a>
            <a href="#kyc" className="text-sm font-semibold text-gray-400 hover:text-[#c29b68] transition-colors no-underline">Limites</a>
            <a href="#security" className="text-sm font-semibold text-gray-400 hover:text-[#c29b68] transition-colors no-underline">Sécurité</a>
            <a href="#tarifs" className="text-sm font-semibold text-gray-400 hover:text-[#c29b68] transition-colors no-underline">Frais</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden lg:inline text-xs text-gray-400 font-mono">
                  {user.email || user.phoneNumber || user.uid.substring(0, 8)}
                </span>
                <MagneticButton
                  onClick={() => transitionTo('/dashboard')}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #c29b68',
                    color: '#c29b68',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Dashboard
                </MagneticButton>
                <MagneticButton
                  onClick={logOut}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Sortir
                </MagneticButton>
              </>
            ) : (
              <>
                <MagneticButton
                  onClick={() => setIsAuthOpen(true)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#f3f4f6',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Connexion
                </MagneticButton>
                <MagneticButton
                  onClick={() => transitionTo('/status')}
                  style={{
                    backgroundColor: '#c29b68',
                    border: 'none',
                    color: '#02040a',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  Acheter
                </MagneticButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- HERO & INTERACTIVE CALCULATOR SECTION --- */}
      <section
        id="devis"
        className="relative min-h-screen flex items-center pt-32 pb-16 overflow-hidden"
      >
        <WebGLScene />

        <div className="max-w-[1200px] mx-auto w-full px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7">
            <span
              className="hero-reveal text-xs font-extrabold text-[#c29b68] uppercase tracking-widest block mb-3"
              style={{ letterSpacing: '0.2em' }}
            >
              🚀 PASSERELLE BLOCKCHAIN AFRIQUE CENTRALE
            </span>
            <h1
              className="hero-reveal font-extrabold tracking-tight text-white mb-6 text-6xl lg:text-7xl"
              style={{ fontFamily: "'Outfit', sans-serif", lineHeight: 1.1 }}
            >
              Achetez vos USDT <br />
              <span className="bg-gradient-to-r from-[#c29b68] to-[#d9b48f] bg-clip-text text-transparent">
                Payez localement.
              </span>
            </h1>
            <p className="hero-reveal text-base text-gray-400 mb-8 max-w-xl leading-relaxed">
              ALMK Flow convertit instantanément vos Francs Congolais (CDF) depuis M-Pesa ou Airtel Money en USDT (TRC-20) directement vers votre portefeuille crypto. Une exécution automatisée, transparente et 100% sécurisée.
            </p>
            
            {/* Live Trust Metrics */}
            <div className="hero-reveal grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div>
                <h4 className="text-2xl font-extrabold text-white">&lt; 3 min</h4>
                <p className="text-xs text-gray-400 mt-1">Délai Moyen de Livraison</p>
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-[#c29b68]">0%</h4>
                <p className="text-xs text-gray-400 mt-1">Frais de Change Cachés</p>
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-emerald-400">99.98%</h4>
                <p className="text-xs text-gray-400 mt-1">Disponibilité des Rails</p>
              </div>
            </div>
          </div>

          {/* Right Calculator Column (Wise-Style Stepper) */}
          <div className="hero-reveal lg:col-span-5" ref={simPanelRef}>
            <InteractiveCard className="glass-panel w-full mx-auto shadow-2xl p-8" style={{ border: '1px solid rgba(194,155,104,0.25)' }}>
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Acheter des USDT</h3>
                {quoteLocked ? (
                  <span className="text-rose-500 text-xs font-bold font-mono bg-rose-500/10 px-2.5 py-1 rounded">
                    ⏱️ EXPIRE DANS {quoteTimer}S
                  </span>
                ) : (
                  <span className="live-flash-dot" />
                )}
              </div>

              {/* Devise Picker */}
              <div className="flex gap-3 mb-5">
                <div
                  onClick={() => !quoteLocked && handlePayMethodChange('mpesa')}
                  className="flex-1 py-2.5 text-center cursor-pointer rounded-lg font-extrabold text-xs transition-all duration-300"
                  style={{
                    cursor: quoteLocked ? 'not-allowed' : 'pointer',
                    border: payMethod === 'mpesa' ? '1.5px solid #c29b68' : '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: payMethod === 'mpesa' ? 'rgba(194, 155, 104, 0.05)' : 'transparent',
                    color: payMethod === 'mpesa' ? '#c29b68' : '#9ca3af',
                  }}
                >
                  M-Pesa (CDF)
                </div>
                <div
                  onClick={() => !quoteLocked && handlePayMethodChange('airtel')}
                  className="flex-1 py-2.5 text-center cursor-pointer rounded-lg font-extrabold text-xs transition-all duration-300"
                  style={{
                    cursor: quoteLocked ? 'not-allowed' : 'pointer',
                    border: payMethod === 'airtel' ? '1.5px solid #c29b68' : '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: payMethod === 'airtel' ? 'rgba(194, 155, 104, 0.05)' : 'transparent',
                    color: payMethod === 'airtel' ? '#c29b68' : '#9ca3af',
                  }}
                >
                  Airtel CDF
                </div>
              </div>

              {/* Amount In Input */}
              <div className="relative mb-4">
                <label className="text-[10px] text-[#c29b68] font-bold block mb-1.5 tracking-wider">
                  VOUS PAYEZ
                </label>
                <div className="relative">
                  <input
                    type="number"
                    disabled={quoteLocked}
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    className="w-full bg-[#02040a]/60 border border-white/10 px-4 py-3 rounded-lg text-white text-xl font-bold outline-none focus:border-[#c29b68]/40 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold text-sm">
                    CDF
                  </span>
                </div>
              </div>

              {/* Wise-Style Stepper Calculator details */}
              <div className="calculator-stepper">
                <div className="stepper-node">
                  <div className="stepper-dot">−</div>
                  <div className="stepper-content">
                    Frais de traitement ALMK (1.5%) :{' '}
                    <strong className="text-white">{calcFee.toLocaleString('fr-FR')} CDF</strong>
                  </div>
                </div>
                <div className="stepper-node">
                  <div className="stepper-dot">=</div>
                  <div className="stepper-content">
                    Montant net converti :{' '}
                    <strong className="text-white">{calcNet.toLocaleString('fr-FR')} CDF</strong>
                  </div>
                </div>
                <div className="stepper-node active">
                  <div className="stepper-dot" style={{ border: 'none' }}><span className="live-flash-dot" /></div>
                  <div className="stepper-content">
                    Taux garanti (15s) :{' '}
                    <strong className="text-[#c29b68]">1 USDT = {calcRate} CDF</strong>
                  </div>
                </div>
                <div className="stepper-node">
                  <div className="stepper-dot">−</div>
                  <div className="stepper-content">
                    Frais réseau blockchain : <strong className="text-rose-400">1.2 USDT</strong>
                  </div>
                </div>
              </div>

              {/* Amount Out Output */}
              <div className="relative mb-5">
                <label className="text-[10px] text-[#c29b68] font-bold block mb-1.5 tracking-wider">
                  VOUS RECEVEZ
                </label>
                <div className="flex items-center bg-[#02040a]/40 border border-white/5 px-4 py-3 rounded-lg">
                  <RollingNumber value={amountOut} className="font-extrabold text-white text-xl" />
                  <span className="ml-auto text-emerald-400 font-extrabold text-base">
                    USDT
                  </span>
                </div>
                {calcSavings > 0 && (
                  <div className="text-[10px] text-emerald-400 mt-2 font-semibold flex items-center gap-1">
                    <span>💡</span> Économisez environ {Math.round(calcSavings).toLocaleString('fr-FR')} CDF par rapport aux banques.
                  </div>
                )}
              </div>

              {/* Locked Quote inputs */}
              {quoteLocked && (
                <div className="flex flex-col gap-3 mb-5 animate-slide-up">
                  <div className="px-3.5 py-3 bg-[#c29b68]/5 rounded-lg border border-[#c29b68]/15 text-xs">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-gray-400">ID Devis :</span>
                      <span className="font-mono font-bold text-white">{quoteHash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Réseau d'envoi :</span>
                      <span className="text-white font-bold">TRC-20 (TRON)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-[#c29b68] font-bold block mb-1.5">
                      ADRESSE DE RÉCEPTION USDT (TRC-20)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: TXyZ9... (Doit commencer par T)"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full bg-[#02040a] border border-[#c29b68]/30 px-3.5 py-2.5 rounded-lg text-white text-xs font-mono outline-none focus:border-[#c29b68] transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                onClick={handleLockQuote}
                className="w-full py-3.5 rounded-lg text-[#02040a] font-extrabold text-sm border-none cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90 shadow-lg shadow-[#c29b68]/10"
                style={{
                  backgroundColor: quoteLocked ? '#10b981' : '#c29b68',
                }}
              >
                {quoteLocked ? (txSaving ? 'Création...' : 'Confirmer le transfert') : 'Générer mon devis'}
              </button>
            </InteractiveCard>
          </div>
        </div>
      </section>

      {/* --- COMMENT ÇA MARCHE --- */}
      <section id="how-to" className="py-32 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-8">
          <SectionIntro
            tagline="PARCOURS D'ÉCHANGE"
            title="Comment ça marche ?"
            description="Le parcours de vos fonds locaux jusqu'à leur livraison sur votre adresse blockchain."
          />

          <div ref={stepsContainerRef} className="flex flex-col gap-20 relative mt-16">
            {/* Step 1 */}
            <div className="step-node-item grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-center">
              <div>
                <span className="text-5xl font-extrabold text-[#c29b68]/10 leading-none">01</span>
                <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">Simuler et Verrouiller</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Indiquez le montant en Francs Congolais (CDF). Notre moteur interroge instantanément les cours globaux de l'USDT et sécurise le taux de change pendant 15 secondes pour vous protéger des fluctuations du marché.
                </p>
              </div>
              <InteractiveCard className="glass-panel p-8 flex justify-center items-center min-h-[180px] shadow-lg">
                <span className="text-3xl font-extrabold text-[#c29b68]">CDF ➔ USDT</span>
              </InteractiveCard>
            </div>

            {/* Step 2 */}
            <div className="step-node-item grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-center">
              <div>
                <span className="text-5xl font-extrabold text-[#c29b68]/10 leading-none">02</span>
                <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">Vérification Réseau</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Nous vérifions instantanément que l'adresse USDT fournie (format TRC-20) est valide et active sur la blockchain TRON afin de bloquer tout envoi vers un nœud erroné.
                </p>
              </div>
              <InteractiveCard className="glass-panel p-8 flex justify-center items-center min-h-[180px] shadow-lg">
                <AnimatedStatus status="PAYMENT_UNDER_REVIEW" message="Nœud récepteur en cours d'analyse..." />
              </InteractiveCard>
            </div>

            {/* Step 3 */}
            <div className="step-node-item grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-center">
              <div>
                <span className="text-5xl font-extrabold text-[#c29b68]/10 leading-none">03</span>
                <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">Dépôt Local Rapide</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Procédez au transfert CDF via votre application ou menu Mobile Money habituel (M-Pesa / Airtel Money). Vos fonds arrivent sur nos comptes séquestres locaux automatisés.
                </p>
              </div>
              <InteractiveCard className="glass-panel p-8 flex justify-center items-center min-h-[180px] shadow-lg">
                <AnimatedStatus status="AWAITING_PAYMENT" message="Dépôt Telco local requis..." />
              </InteractiveCard>
            </div>

            {/* Step 4 */}
            <div className="step-node-item grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-center">
              <div>
                <span className="text-5xl font-extrabold text-[#c29b68]/10 leading-none">04</span>
                <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">Validation Automatique</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Nos connexions directes aux API Telco détectent la confirmation de votre transaction de paiement. La commande est immédiatement validée par notre validateur central.
                </p>
              </div>
              <InteractiveCard className="glass-panel p-8 flex justify-center items-center min-h-[180px] shadow-lg">
                <AnimatedStatus status="PAYMENT_CONFIRMED" message="Paiement local reçu." />
              </InteractiveCard>
            </div>

            {/* Step 5 */}
            <div className="step-node-item grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-center">
              <div>
                <span className="text-5xl font-extrabold text-[#c29b68]/10 leading-none">05</span>
                <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">Libération Blockchain</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  ALMK Core libère automatiquement l'équivalent en jetons USDT depuis notre réserve globale de liquidité et l'expédie vers votre portefeuille. Le hash de la transaction (TXID) est généré en direct.
                </p>
              </div>
              <InteractiveCard className="glass-panel p-8 flex justify-center items-center min-h-[180px] shadow-lg">
                <AnimatedStatus status="COMPLETED" message="Tokens expédiés avec succès !" />
              </InteractiveCard>
            </div>
          </div>
        </div>
      </section>

      {/* --- LOCAL RAILS --- */}
      <section id="rails" className="py-32 border-t border-white/5 bg-[#02040a]/40">
        <div className="max-w-[1200px] mx-auto px-8">
          <SectionIntro
            tagline="RAILS MONÉTAIRES DIRECTS"
            title="Connexion Réseaux Locaux"
            description="Visualisez et survolez la passerelle d'acheminement qui transfère vos dépôts vers le Secure Core d'ALMK."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
            
            {/* Map visualization */}
            <div className="relative h-[350px] bg-[#02040a]/80 rounded-2xl border border-[#c29b68]/15 flex items-center justify-center overflow-hidden shadow-inner">
              <div className="absolute inset-0 w-full h-full">
                {/* M-Pesa line */}
                <DrawnPath
                  d="M50 300 C100 200, 150 150, 200 150"
                  viewBox="0 0 400 400"
                  strokeWidth={3}
                  color={activeRail === 'mpesa' ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)'}
                  pulse={activeRail === 'mpesa'}
                  pulseColor="#3b82f6"
                  pulseDuration={1.5}
                />
                {/* Airtel Money line */}
                <DrawnPath
                  d="M350 300 C300 200, 250 150, 200 150"
                  viewBox="0 0 400 400"
                  strokeWidth={3}
                  color={activeRail === 'airtel' ? '#ec4899' : 'rgba(236, 72, 153, 0.2)'}
                  pulse={activeRail === 'airtel'}
                  pulseColor="#ec4899"
                  pulseDuration={1.5}
                />
              </div>

              <div className="relative w-16 h-16 rounded-full border-2 border-[#c29b68] bg-[#02040a] flex items-center justify-center font-bold text-xs text-[#c29b68] shadow-[0_0_30px_rgba(194,155,104,0.25)]">
                CORE
              </div>
            </div>

            {/* Content controls */}
            <div className="flex flex-col gap-6">
              <div
                onMouseEnter={() => setActiveRail('mpesa')}
                onMouseLeave={() => setActiveRail('none')}
                className="p-6 rounded-xl border cursor-pointer transition-all duration-300"
                style={{
                  border: activeRail === 'mpesa' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: activeRail === 'mpesa' ? 'rgba(59, 130, 246, 0.04)' : 'rgba(255,255,255,0.01)',
                }}
              >
                <h4 className="text-lg font-extrabold text-[#3b82f6] mb-2">M-Pesa (Vodacom)</h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Passerelle de transfert connectée en direct aux serveurs API Vodacom RDC. Taux de succès historique supérieur à 99.8% avec validation asynchrone ultra-stable.
                </p>
              </div>

              <div
                onMouseEnter={() => setActiveRail('airtel')}
                onMouseLeave={() => setActiveRail('none')}
                className="p-6 rounded-xl border cursor-pointer transition-all duration-300"
                style={{
                  border: activeRail === 'airtel' ? '1px solid #ec4899' : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: activeRail === 'airtel' ? 'rgba(236, 72, 153, 0.04)' : 'rgba(255,255,255,0.01)',
                }}
              >
                <h4 className="text-lg font-extrabold text-[#ec4899] mb-2">Airtel Money</h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Canal direct connecté au réseau régional Airtel RDC. Assure une exécution instantanée avec basculement automatique sur canal auxiliaire en cas de congestion du réseau mobile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BLOCKCHAIN NETWORKS --- */}
      <section id="networks" className="py-32 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-8">
          <SectionIntro
            tagline="DISTRIBUTION BLOCKCHAIN"
            title="Réseaux Pris en Charge"
            description="Convertissez vos devises locales vers n'importe quel protocole cryptographique de votre choix."
          />

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <InteractiveCard className="glass-panel p-6 shadow-lg">
              <div className="text-[10px] font-extrabold text-emerald-400 uppercase mb-2 tracking-wider">
                RECOMMANDÉ (RAPIDE)
              </div>
              <h4 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>TRC-20 (TRON)</h4>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                Le protocole de transfert d'USDT le plus économique. Idéal pour les paiements de montants standards avec des frais réseau quasi nuls.
              </p>
              <div className="flex flex-col gap-2 text-xs border-t border-white/5 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Frais réseau :</span>
                  <span className="text-emerald-400 font-bold">1.2 USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Délai moyen :</span>
                  <span className="text-white font-bold">~ 1 min</span>
                </div>
              </div>
            </InteractiveCard>

            <InteractiveCard className="glass-panel p-6 shadow-lg">
              <div className="text-[10px] font-extrabold text-blue-400 uppercase mb-2 tracking-wider">
                STANDARD
              </div>
              <h4 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>BEP-20 (BSC)</h4>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                Le réseau BNB Chain. Propose des frais fixes minimes et une excellente compatibilité avec les portefeuilles Trust Wallet et DeFi.
              </p>
              <div className="flex flex-col gap-2 text-xs border-t border-white/5 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Frais réseau :</span>
                  <span className="text-[#c29b68] font-bold">0.8 USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Délai moyen :</span>
                  <span className="text-white font-bold">~ 2 mins</span>
                </div>
              </div>
            </InteractiveCard>

            <InteractiveCard className="glass-panel p-6 shadow-lg">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase mb-2 tracking-wider">
                HAUTE COMPATIBILITÉ
              </div>
              <h4 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>ERC-20 (Ethereum)</h4>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                Le réseau d'origine d'Ethereum. Offre une sécurité maximale pour les transferts professionnels de gros volumes.
              </p>
              <div className="flex flex-col gap-2 text-xs border-t border-white/5 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Frais réseau :</span>
                  <span className="text-rose-400 font-bold">4.5 USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Délai moyen :</span>
                  <span className="text-white font-bold">~ 5 mins</span>
                </div>
              </div>
            </InteractiveCard>
          </StaggerGrid>
        </div>
      </section>

      {/* --- KYC PLAFONDS & TIERS GRID --- */}
      <section id="kyc" className="py-32 border-t border-white/5 bg-[#02040a]/40">
        <div className="max-w-[1200px] mx-auto px-8">
          <SectionIntro
            tagline="LIMITES & NIVEAUX DE KYC"
            title="Limites & Conformité"
            description="Consultez nos paliers de vérification d'identité réglementaires pour augmenter vos capacités de transaction."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <InteractiveCard className="glass-panel p-8 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-[#c29b68]">TIER 1</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold">Inscription</span>
              </div>
              <h4 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>500 USD / jour</h4>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Limite d'entrée idéale pour les besoins courants et les tests d'intégration rapides.
              </p>
              <div className="border-t border-white/5 pt-4 text-xs text-gray-400">
                <strong>Exigences :</strong> Validation du numéro de téléphone par SMS/OTP.
              </div>
            </InteractiveCard>

            <InteractiveCard className="glass-panel p-8 shadow-lg" style={{ border: '1.5px solid rgba(194, 155, 104, 0.4)' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-[#c29b68]">TIER 2</span>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold">Recommandé</span>
              </div>
              <h4 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>5 000 USD / jour</h4>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Idéal pour les traders actifs, les importateurs et les paiements commerciaux réguliers.
              </p>
              <div className="border-t border-white/5 pt-4 text-xs text-gray-400">
                <strong>Exigences :</strong> Validation de la pièce d'identité officielle (Passeport / ID).
              </div>
            </InteractiveCard>

            <InteractiveCard className="glass-panel p-8 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-[#c29b68]">TIER 3</span>
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-[10px] font-bold">Sur Mesure</span>
              </div>
              <h4 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Sans Limite</h4>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Pour les institutions financières, grands comptes de courtage et trésorerie d'entreprise.
              </p>
              <div className="border-t border-white/5 pt-4 text-xs text-gray-400">
                <strong>Exigences :</strong> Justificatif de provenance des fonds & entretien visuel direct.
              </div>
            </InteractiveCard>
          </div>
        </div>
      </section>

      {/* --- SECURITY SECTION (VERIFY BEFORE TRANSFER) --- */}
      <section id="security" className="py-32 border-t border-white/5 bg-rose-500/[0.01]">
        <div className="max-w-[1200px] mx-auto px-8">
          <SectionIntro
            tagline="SÉCURITÉ STRICTE"
            title="Verify Before You Transfer"
            description="Ne faites jamais confiance aux communications non vérifiées. Utilisez nos protocoles de sécurité."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
            
            {/* Warning Block */}
            <div className="p-8 rounded-xl border border-rose-500/25 bg-rose-500/5 shadow-lg">
              <div className="text-4xl mb-4">⚠️</div>
              <h4 className="text-xl font-extrabold text-rose-500 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Mise en garde contre les fraudes
              </h4>
              <p className="text-rose-300 text-sm leading-relaxed">
                <strong>ALMK ne vous demandera JAMAIS</strong> de fournir votre clé privée, votre phrase de récupération de portefeuille blockchain, ou votre code PIN confidentiel Mobile Money. Si un contact ou un agent prétend parler au nom d'ALMK et vous demande ces données, il s'agit d'une tentative d'arnaque. Veuillez immédiatement le signaler.
              </p>
            </div>

            {/* Retro Cyber Security Terminal */}
            <div className="cyber-terminal rounded-xl overflow-hidden flex flex-col shadow-2xl" style={{ minHeight: '340px' }}>
              <div className="cyber-terminal-header">
                <div>
                  <span className="dot-btn bg-rose-500" />
                  <span className="dot-btn bg-yellow-500" />
                  <span className="dot-btn bg-emerald-500" />
                  <span className="ml-2 opacity-80">secure-handshake.almk</span>
                </div>
                <span>v2.10-sec</span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between relative">
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
                      boxShadow: '0 0 10px #10b981',
                    }}
                  />
                )}

                <div>
                  <p className="text-[#6ee7b7] text-xs mb-4">
                    Saisissez l'adresse e-mail ou l'ID d'un agent ALMK pour vérifier sa signature cryptographique officielle :
                  </p>

                  <form onSubmit={handleVerify} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: agent-007 ou verify@almk.io"
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                      className="flex-1 bg-black border border-[#10b981] text-[#6ee7b7] px-3 py-2 rounded font-mono text-xs outline-none"
                    />
                    <button
                      type="submit"
                      disabled={verifyStatus === 'scanning'}
                      className="bg-[#10b981] text-[#02040a] px-4 py-2 rounded font-mono font-bold text-xs border-none cursor-pointer"
                    >
                      Scanner
                    </button>
                  </form>
                </div>

                {verifyStatus !== 'idle' && (
                  <div className="mt-6 bg-black/40 border border-[#10b981]/30 p-4 rounded text-xs text-[#6ee7b7] animate-slide-up">
                    <div className="border-b border-[#10b981]/20 pb-2 mb-2 flex justify-between font-bold">
                      <span>CONSOLE DE SÉCURITÉ</span>
                      <span className={verifyStatus === 'scanning' ? 'text-blue-400' : verifyResult === 'OFFICIAL' ? 'text-emerald-400' : 'text-rose-500'}>
                        {verifyStatus === 'scanning' ? 'ANALYSING...' : 'FINISH'}
                      </span>
                    </div>
                    <div>&gt; target_identity: {verifyInput}</div>
                    {verifyStatus === 'scanning' ? (
                      <div>&gt; decrypting_signatures: PENDING...</div>
                    ) : (
                      <>
                        <div>&gt; signature: {verifyResult === 'OFFICIAL' ? 'OFFICIAL_ALMK_SIGNATURE' : verifyResult === 'SUSPICIOUS' ? 'WARN_SUSPICIOUS_THREAT' : 'NOT_FOUND_NODE'}</div>
                        <div className="flex justify-between mt-3 font-bold text-sm">
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

      {/* --- TARIFICATION --- */}
      <section id="tarifs" className="py-32 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-8">
          <SectionIntro
            tagline="TRANSPARENCE TOTALE DES COÛTS"
            title="Pas de Frais Cachés"
            description="Le détail exact de notre tarification, sans marge cachée sur le taux de change global."
          />

          <div
            ref={calcRowRef}
            className="flex flex-col gap-6 bg-white/[0.01] border border-white/5 rounded-xl p-8 mt-16"
          >
            {quality !== 'ESSENTIAL' && (
              <div
                className="calc-connector-line"
                style={{
                  height: '2px',
                  background: 'linear-gradient(90deg, #c29b68, #3b82f6, #ec4899, #10b981)',
                  width: '100%',
                  borderRadius: '2px',
                  transformOrigin: 'left center',
                }}
              />
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <span className="text-[10px] text-[#c29b68] font-bold">TAUX DE RÉFÉRENCE BINANCE</span>
                <div className="text-xl font-extrabold mt-1">Index temps réel</div>
              </div>

              <div>
                <span className="text-[10px] text-blue-400 font-bold">MARGE OPÉRATIONNELLE</span>
                <div className="text-xl font-extrabold mt-1">1.5% fixe</div>
              </div>

              <div>
                <span className="text-[10px] text-pink-400 font-bold">COMMISSION OPÉRATEUR RDC</span>
                <div className="text-xl font-extrabold mt-1">0% inclus</div>
              </div>

              <div>
                <span className="text-[10px] text-emerald-400 font-bold">GAS FEE BLOCKCHAIN</span>
                <div className="text-xl font-extrabold mt-1">1.2 USDT fixe</div>
              </div>
            </div>

            <div className="w-full h-px bg-white/10 my-4" />

            <div className="flex justify-between items-center flex-wrap gap-4">
              <span className="text-sm font-bold text-gray-400">Notre engagement de transparence :</span>
              <span className="text-2xl font-extrabold text-emerald-400">
                Aucune marge cachée
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-32 border-t border-white/5 bg-[#02040a]/40">
        <div className="max-w-[800px] mx-auto px-8">
          <SectionIntro
            tagline="FAQ"
            title="Des questions ?"
            description="Retrouvez toutes les réponses concernant les transferts locaux et les délais de distribution."
          />

          <div className="flex flex-col gap-4 mt-16">
            
            {/* FAQ 1 */}
            <div className="border border-white/5 rounded-lg bg-white/[0.01] overflow-hidden">
              <div
                onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)}
                className="p-5 flex justify-between items-center cursor-pointer font-bold"
              >
                <span>Quel est le délai moyen de réception des USDT ?</span>
                <span>{activeFaq === 0 ? '−' : '+'}</span>
              </div>
              {activeFaq === 0 && (
                <div className="px-5 pb-5 text-gray-400 text-xs leading-relaxed animate-fade-in">
                  Dans plus de 90% des cas, vos USDT sont envoyés en moins de 3 minutes après réception de votre dépôt Mobile Money. Parfois, lors d'une forte congestion de la blockchain, cela peut prendre jusqu'à 10 minutes.
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="border border-white/5 rounded-lg bg-white/[0.01] overflow-hidden">
              <div
                onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
                className="p-5 flex justify-between items-center cursor-pointer font-bold"
              >
                <span>Est-il possible d'utiliser un autre réseau que TRON (TRC-20) ?</span>
                <span>{activeFaq === 1 ? '−' : '+'}</span>
              </div>
              {activeFaq === 1 && (
                <div className="px-5 pb-5 text-gray-400 text-xs leading-relaxed animate-fade-in">
                  Oui, nous supportons également les réseaux BEP-20 (Binance Smart Chain) et ERC-20 (Ethereum). Par défaut, notre simulateur utilise le réseau TRON (TRC-20) en raison de ses frais de gaz exceptionnellement bas.
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="border border-white/5 rounded-lg bg-white/[0.01] overflow-hidden">
              <div
                onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
                className="p-5 flex justify-between items-center cursor-pointer font-bold"
              >
                <span>Comment contacter l'assistance en cas de problème ?</span>
                <span>{activeFaq === 2 ? '−' : '+'}</span>
              </div>
              {activeFaq === 2 && (
                <div className="px-5 pb-5 text-gray-400 text-xs leading-relaxed animate-fade-in">
                  Notre équipe support est à votre écoute 24h/24 par ticket directement dans votre espace client, ou par chat officiel sur notre passerelle sécurisée.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 py-20 text-gray-400 text-xs">
        <div className="max-w-[1200px] mx-auto px-8 flex flex-col gap-12">
          
          {/* Regulatory Trust Icons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-white/5 pb-12">
            <div>
              <h5 className="text-white font-extrabold mb-2">🔐 Sécurité Séquestre</h5>
              <p className="text-[10px] leading-relaxed">
                Toutes les transactions CDF transitent par des comptes séquestres locaux certifiés.
              </p>
            </div>
            <div>
              <h5 className="text-white font-extrabold mb-2">💼 Garde Institutionnelle</h5>
              <p className="text-[10px] leading-relaxed">
                Les réserves d'USDT sont gardées sur des portefeuilles multi-signature Fireblocks conformes.
              </p>
            </div>
            <div>
              <h5 className="text-white font-extrabold mb-2">🏛️ Régulé & Conforme</h5>
              <p className="text-[10px] leading-relaxed">
                Conformité stricte aux exigences de la Banque Centrale du Congo (BCC) et de la CENAREF.
              </p>
            </div>
            <div>
              <h5 className="text-white font-extrabold mb-2">💳 Certification PCI-DSS</h5>
              <p className="text-[10px] leading-relaxed">
                Standard international le plus élevé pour le chiffrement des données de paiement.
              </p>
            </div>
          </div>

          {/* Main Footer Links */}
          <div className="flex flex-col md:flex-row md:justify-between gap-8">
            <div>
              <div className="text-white font-extrabold text-lg mb-2 tracking-wider">
                ALMK <span className="text-[#c29b68]">FLOW</span>
              </div>
              <p className="max-w-xs leading-relaxed">
                La passerelle financière cinématique et ultrasécurisée reliant l'Afrique Centrale à la blockchain globale.
              </p>
            </div>
            <div className="flex gap-16 flex-wrap">
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-white">Ressources</span>
                <a href="#devis" className="hover:text-white no-underline text-gray-400">Calculateur</a>
                <a href="#kyc" className="hover:text-white no-underline text-gray-400">Limites KYC</a>
                <a href="#security" className="hover:text-white no-underline text-gray-400">Verify-Handshake</a>
                <a href="#tarifs" className="hover:text-white no-underline text-gray-400">Tarifs</a>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-white">Légal</span>
                <a href="#" className="hover:text-white no-underline text-gray-400">Politique de Confidentialité</a>
                <a href="#" className="hover:text-white no-underline text-gray-400">Conditions Générales (CGU)</a>
                <a href="#" className="hover:text-white no-underline text-gray-400">Mentions Légales</a>
              </div>
            </div>
          </div>

          <div className="text-center mt-4 border-t border-white/5 pt-8 text-[10px]">
            &copy; {new Date().getFullYear()} ALMK Flow. Tous droits réservés.
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
