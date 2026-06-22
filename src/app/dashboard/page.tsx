'use client';

import React, { useState, useEffect } from 'react';
import { useTransitionRouter } from '@/components/motion/PageTransition';
import InteractiveCard from '@/components/motion/InteractiveCard';
import AnimatedStatus from '@/components/motion/AnimatedStatus';
import AnimatedCounter from '@/components/motion/AnimatedCounter';
import StaggerGrid from '@/components/motion/StaggerGrid';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserTransactions, TransactionDoc } from '@/lib/db';
import AuthModal from '@/components/auth/AuthModal';
import MagneticButton from '@/components/motion/MagneticButton';

export default function Dashboard() {
  const { transitionTo } = useTransitionRouter();
  const { user, loading, logOut } = useAuth();
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);
  const [fetching, setFetching] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [kycTier, setKycTier] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (user) {
      setFetching(true);
      getUserTransactions(user.uid)
        .then((data) => {
          setTransactions(data);
          // Set KYC Tier based on transaction counts or volume dynamically
          if (data.length > 5) {
            setKycTier(2);
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setFetching(false);
        });
    } else {
      setTransactions([]);
    }
  }, [user]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Calculate stats based on real transactions
  const totalVolumeCDF = transactions
    .filter(tx => tx.status === 'COMPLETED' || tx.status === 'PAYMENT_CONFIRMED')
    .reduce((sum, tx) => sum + tx.amountIn, 0);

  const totalUSDTDelivered = transactions
    .filter(tx => tx.status === 'COMPLETED')
    .reduce((sum, tx) => sum + tx.amountOut, 0);

  const completedCount = transactions.filter(tx => tx.status === 'COMPLETED').length;
  const totalCount = transactions.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02040a]">
        <div className="text-center">
          <div className="text-sm font-extrabold text-[#c29b68] tracking-widest animate-pulse">
            CHARGEMENT DES ACCÈS SÉCURISÉS...
          </div>
        </div>
      </div>
    );
  }

  // Not logged in fallback state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02040a] px-8 relative radial-glow-container overflow-hidden">
        <div className="glow-blob glow-bronze" style={{ top: '25%', left: '25%', opacity: 0.1 }} />
        
        <div className="absolute top-10 left-10">
          <div onClick={() => transitionTo('/')} className="cursor-pointer flex items-center gap-2.5">
            <svg viewBox="0 0 100 100" style={{ width: '32px', height: '32px' }}>
              <path d="M20 80 L50 20 L80 80 M35 55 L65 55" fill="none" stroke="#c29b68" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-lg font-extrabold text-white tracking-wider">ALMK</span>
          </div>
        </div>

        <InteractiveCard className="glass-panel max-w-md w-full text-center p-10" style={{ border: '1px solid rgba(194,155,104,0.2)' }}>
          <div className="text-4xl mb-6">🔒</div>
          <h2 className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Portail Sécurisé</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Veuillez vous authentifier pour accéder à votre tableau de bord, consulter votre historique de transferts et valider vos ordres en attente.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full py-3 rounded-lg bg-[#c29b68] text-[#02040a] font-extrabold text-sm border-none cursor-pointer hover:opacity-90 transition-opacity"
            >
              Se connecter
            </button>
            <button
              onClick={() => transitionTo('/')}
              className="w-full py-3 rounded-lg bg-transparent border border-white/10 text-white font-bold text-xs cursor-pointer hover:bg-white/5 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </InteractiveCard>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="radial-glow-container min-h-screen bg-[#02040a] text-white pt-24 px-8 pb-16">
      <div className="glow-blob glow-bronze" style={{ top: '-10%', left: '10%', opacity: 0.1 }} />
      <div className="glow-blob glow-blue" style={{ bottom: '0', right: '0', opacity: 0.08 }} />

      <div className="max-w-[1200px] mx-auto">
        
        {/* Header bar */}
        <div className="flex flex-wrap justify-between items-center gap-6 mb-12 pb-6 border-b border-white/5">
          <div>
            <span className="text-xs font-bold text-[#c29b68] tracking-widest block uppercase">ESPACE MEMBRE SÉCURISÉ</span>
            <h1 className="text-3xl font-extrabold text-white mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Tableau de Bord</h1>
            <p className="text-gray-400 text-xs font-mono mt-1.5 bg-white/5 px-2.5 py-1 rounded inline-block">
              ID Client : {user.email || user.phoneNumber || user.uid}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => transitionTo('/')}
              className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold rounded-lg cursor-pointer transition-all"
            >
              Nouveau Transfert
            </button>
            <button
              onClick={logOut}
              className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold rounded-lg cursor-pointer transition-all"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* KYC Compliance Status Section */}
        <div className="glass-panel p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" style={{ border: '1px solid rgba(194, 155, 104, 0.2)' }}>
          <div>
            <h4 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>🛡️</span> Statut de Conformité (KYC)
            </h4>
            <p className="text-gray-400 text-xs mt-1">
              Votre compte est vérifié au niveau <strong>Tier {kycTier}</strong>. Limite journalière actuelle :{' '}
              <strong className="text-white">{kycTier === 1 ? '500 USD' : kycTier === 2 ? '5 000 USD' : 'Illimitée'}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Simple Visual Progress Bar */}
            <div className="hidden sm:block w-36 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c29b68] rounded-full transition-all duration-500"
                style={{ width: kycTier === 1 ? '33%' : kycTier === 2 ? '66%' : '100%' }}
              />
            </div>
            {kycTier < 3 && (
              <button
                onClick={() => alert('Veuillez téléverser votre pièce d\'identité officielle dans les paramètres pour augmenter vos limites.')}
                className="px-3.5 py-2 bg-[#c29b68]/10 border border-[#c29b68]/30 hover:bg-[#c29b68]/20 text-[#c29b68] text-xs font-extrabold rounded-lg cursor-pointer transition-all ml-auto md:ml-0"
              >
                Augmenter mes limites ➔
              </button>
            )}
          </div>
        </div>

        {/* Counter cards */}
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <InteractiveCard className="glass-panel p-6 shadow-md">
            <span className="text-[10px] text-[#c29b68] font-bold tracking-wider">VOLUMES TOTALS</span>
            <div className="text-3xl font-extrabold mt-2 text-white">
              <AnimatedCounter value={totalVolumeCDF} suffix=" CDF" />
            </div>
          </InteractiveCard>

          <InteractiveCard className="glass-panel p-6 shadow-md">
            <span className="text-[10px] text-emerald-400 font-bold tracking-wider">JÉTONS LIVRÉS</span>
            <div className="text-3xl font-extrabold mt-2 text-emerald-400">
              <AnimatedCounter value={totalUSDTDelivered} decimals={2} suffix=" USDT" />
            </div>
          </InteractiveCard>

          <InteractiveCard className="glass-panel p-6 shadow-md">
            <span className="text-[10px] text-blue-400 font-bold tracking-wider">SUCCÈS DE TRANSFERT</span>
            <div className="text-3xl font-extrabold mt-2 text-blue-400">
              <AnimatedCounter value={completedCount} suffix={` / ${totalCount}`} />
            </div>
          </InteractiveCard>
        </StaggerGrid>

        {/* Transactions Table Log */}
        <div className="glass-panel shadow-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-base font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Historique des Transferts</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            {fetching ? (
              <div className="py-20 text-center text-gray-400 text-xs">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-t-transparent border-[#c29b68] rounded-full mb-3" />
                <div>Chargement de vos transactions sécurisées...</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
                <div className="text-3xl">📭</div>
                <div>Aucune transaction enregistrée pour le moment.</div>
                <button
                  onClick={() => transitionTo('/')}
                  className="px-4 py-2 bg-[#c29b68] text-[#02040a] font-bold text-xs rounded-lg cursor-pointer border-none mt-2"
                >
                  Effectuer un premier achat
                </button>
              </div>
            ) : (
              <table className="w-full border-collapse text-xs text-left text-gray-300">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 uppercase font-bold tracking-wider" style={{ backgroundColor: 'rgba(2, 4, 10, 0.4)' }}>
                    <th className="px-6 py-4">ID Commande</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Moyen local</th>
                    <th className="px-6 py-4 text-right">Dépôt CDF</th>
                    <th className="px-6 py-4 text-right">USDT Reçu</th>
                    <th className="px-6 py-4">Portefeuille Réception</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-white">{tx.id}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(tx.timestamp).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.method === 'mpesa' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'
                        }`}>
                          {tx.method === 'mpesa' ? 'M-Pesa' : 'Airtel Money'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-white">
                        {tx.amountIn.toLocaleString('fr-FR')} CDF
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-emerald-400">
                        {tx.amountOut.toFixed(2)} USDT
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-400">
                        <div className="flex items-center gap-2">
                          <span>
                            {tx.recipientAddress.substring(0, 8)}...{tx.recipientAddress.substring(tx.recipientAddress.length - 8)}
                          </span>
                          <button
                            onClick={() => handleCopy(tx.recipientAddress, tx.id)}
                            className="bg-white/5 border-none hover:bg-white/10 text-[10px] py-1 px-2 rounded cursor-pointer transition-colors"
                            style={{ color: copiedId === tx.id ? '#34d399' : '#c29b68' }}
                          >
                            {copiedId === tx.id ? 'Copié' : 'Copier'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <AnimatedStatus status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
