'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { ConfirmationResult } from 'firebase/auth';
import InteractiveCard from '../motion/InteractiveCard';
import MagneticButton from '../motion/MagneticButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'select' | 'email-signin' | 'email-signup' | 'phone-send' | 'phone-verify';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    setupRecaptcha,
    sendVerificationCode
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const recaptchaInitialized = useRef(false);

  useEffect(() => {
    if (isOpen && (mode === 'phone-send' || mode === 'phone-verify') && !recaptchaInitialized.current) {
      // Small timeout to ensure container is in DOM
      const timer = setTimeout(() => {
        setupRecaptcha('recaptcha-container');
        recaptchaInitialized.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, setupRecaptcha]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setMode('select');
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'email-signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erreur d’authentification');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }
    setLoading(true);
    try {
      const result = await sendVerificationCode(phone);
      setConfirmationResult(result);
      setMode('phone-verify');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’envoi du code SMS. Assurez-vous du format international (+243...)');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code || !confirmationResult) {
      setError('Veuillez entrer le code de confirmation');
      return;
    }
    setLoading(true);
    try {
      await confirmationResult.confirm(code);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Code de confirmation incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }} onClick={handleClose} />

      <InteractiveCard
        className="glass-panel p-8 max-w-md w-full relative"
        style={{
          padding: '2.5rem',
          backgroundColor: 'rgba(10, 15, 29, 0.95)',
          maxWidth: '440px',
          width: '90%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>

        {/* Modal Title */}
        <h3
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#f3f4f6',
            marginBottom: '1.5rem',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          {mode === 'select' && 'CONNEXION SÉCURISÉE'}
          {mode === 'email-signin' && 'CONNEXION EMAIL'}
          {mode === 'email-signup' && 'CRÉER UN COMPTE'}
          {(mode === 'phone-send' || mode === 'phone-verify') && 'AUTHENTIFICATION SMS'}
        </h3>

        {error && (
          <div
            className="animate-slide-up"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {/* Invisible Recaptcha Anchor */}
        <div id="recaptcha-container"></div>

        {/* mode: select */}
        {mode === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f3f4f6',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="#ea4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.882-6.437-6.437 0-3.555 2.882-6.437 6.437-6.437 1.543 0 2.957.543 4.07 1.457l3.143-3.143C18.914 1.886 15.829.8 12.24.8 5.922.8.8 5.922.8 12.24s5.122 11.44 11.44 11.44c6.331 0 11.4-5.126 11.4-11.44 0-.686-.069-1.372-.189-1.955H12.24z"
                />
              </svg>
              Continuer avec Google
            </button>

            <button
              onClick={() => setMode('email-signin')}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: '1px solid #c29b68',
                color: '#c29b68',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(194, 155, 104, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Continuer avec Email
            </button>

            <button
              onClick={() => setMode('phone-send')}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#9ca3af',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.color = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              Continuer par Téléphone (SMS)
            </button>
          </div>
        )}

        {/* mode: email-signin / email-signup */}
        {(mode === 'email-signin' || mode === 'email-signup') && (
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#c29b68', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                ADRESSE EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  outline: 'none',
                }}
                placeholder="nom@exemple.com"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#c29b68', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                MOT DE PASSE
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  outline: 'none',
                }}
                placeholder="******"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: '#c29b68',
                color: '#030712',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Connexion...' : mode === 'email-signin' ? 'Se connecter' : 'Créer un compte'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>
              {mode === 'email-signin' ? (
                <span>
                  Pas de compte ?{' '}
                  <span
                    onClick={() => setMode('email-signup')}
                    style={{ color: '#c29b68', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Créer un compte
                  </span>
                </span>
              ) : (
                <span>
                  Déjà inscrit ?{' '}
                  <span
                    onClick={() => setMode('email-signin')}
                    style={{ color: '#c29b68', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Se connecter
                  </span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMode('select')}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'underline',
              }}
            >
              Retour aux options
            </button>
          </form>
        )}

        {/* mode: phone-send */}
        {mode === 'phone-send' && (
          <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#c29b68', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                NUMÉRO DE TÉLÉPHONE (FORMAT INTERNATIONAL)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  outline: 'none',
                  fontSize: '1.125rem',
                }}
                placeholder="+243812345678"
              />
              <span style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'block', marginTop: '0.5rem' }}>
                Ex: +243 (RDC), +33 (France), +1 (USA).
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: '#c29b68',
                color: '#030712',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Envoi...' : 'Envoyer le code SMS'}
            </button>

            <button
              type="button"
              onClick={() => setMode('select')}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'underline',
              }}
            >
              Retour aux options
            </button>
          </form>
        )}

        {/* mode: phone-verify */}
        {mode === 'phone-verify' && (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#c29b68', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                CODE DE VERIFICATION SMS
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  outline: 'none',
                  fontSize: '1.25rem',
                  textAlign: 'center',
                  letterSpacing: '0.3em',
                }}
                maxLength={6}
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: '#c29b68',
                color: '#030712',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Vérification...' : 'Valider le code'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span
                onClick={() => setMode('phone-send')}
                style={{ color: '#c29b68', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Renvoyer le code
              </span>
              <span
                onClick={() => setMode('select')}
                style={{ color: '#9ca3af', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Changer de méthode
              </span>
            </div>
          </form>
        )}
      </InteractiveCard>
    </div>
  );
};

export default AuthModal;
