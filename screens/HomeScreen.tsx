import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import InputSection from '../components/InputSection';
import RecommendationCard from '../components/RecommendationCard';
import CardSelector from '../components/CardSelector';
import OfferInput from '../components/OfferInput';
import CardDetailsModal from '../components/CardDetailsModal';
import AllOffersList from '../components/AllOffersList';
import BenefitsList from '../components/BenefitsList';
import { allCards as initialCards, sampleOffers } from '../data';
import { calculateBestCards } from '../utils/calculations';
import { getStoredState, setStoredState, clearStoredState, type PersistedState } from '../utils/storage';
import { RecommendationResult, UserOffer, CreditCard, CardBenefit, TransactionRecord, TransactionOffsetDetail } from '../types';
import { getCategoryForBenefit } from '../utils/merchantUtils';

function getDefaultPersistedState(): PersistedState {
  const defaultBenefitBalances: Record<string, number> = {};
  initialCards.forEach(card => card.benefits.forEach(b => { defaultBenefitBalances[b.id] = b.amount; }));
  const defaultFeeBalances: Record<string, number> = {};
  initialCards.forEach(c => defaultFeeBalances[c.id] = c.annualFee);
  const mockDate = new Date();
  mockDate.setMonth(mockDate.getMonth() - 2);
  const dateStr = mockDate.toISOString().split('T')[0];
  const defaultFeeDates: Record<string, string> = {};
  initialCards.forEach(c => defaultFeeDates[c.id] = dateStr);
  return {
    cards: initialCards,
    activeCardIds: initialCards.map(c => c.id),
    activeOffers: sampleOffers,
    transactionHistory: [] as TransactionRecord[],
    benefitBalances: defaultBenefitBalances,
    customAnnualFees: {} as Record<string, number>,
    annualFeeBalances: defaultFeeBalances,
    annualFeeDates: defaultFeeDates,
  };
}

/** Merge stored state with defaults so new cards/benefits from data.ts get default balances/dates. */
function mergeWithDefaults(stored: PersistedState): PersistedState {
  const defaults = getDefaultPersistedState();
  return {
    ...stored,
    benefitBalances: { ...defaults.benefitBalances, ...stored.benefitBalances },
    annualFeeBalances: { ...defaults.annualFeeBalances, ...stored.annualFeeBalances },
    annualFeeDates: { ...defaults.annualFeeDates, ...stored.annualFeeDates },
  };
}

const HomeScreen: React.FC = () => {
  const [hydrated] = useState(() => {
    const stored = getStoredState();
    if (stored) return mergeWithDefaults(stored);
    return getDefaultPersistedState();
  });

  const [cards, setCards] = useState<CreditCard[]>(hydrated.cards);
  const [activeCardIds, setActiveCardIds] = useState<string[]>(hydrated.activeCardIds);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Dining');
  const [isAutoCategorized, setIsAutoCategorized] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState('');
  const [results, setResults] = useState<RecommendationResult[] | null>(null);
  const [activeOffers, setActiveOffers] = useState<UserOffer[]>(hydrated.activeOffers);
  const [transactionHistory, setTransactionHistory] = useState<TransactionRecord[]>(hydrated.transactionHistory);

  const [benefitBalances, setBenefitBalances] = useState<Record<string, number>>(hydrated.benefitBalances);
  const [customAnnualFees, setCustomAnnualFees] = useState<Record<string, number>>(hydrated.customAnnualFees);
  const [annualFeeBalances, setAnnualFeeBalances] = useState<Record<string, number>>(hydrated.annualFeeBalances);
  const [annualFeeDates, setAnnualFeeDates] = useState<Record<string, string>>(hydrated.annualFeeDates);

  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    persistTimeoutRef.current = setTimeout(() => {
      setStoredState({
        cards,
        activeCardIds,
        activeOffers,
        transactionHistory,
        benefitBalances,
        customAnnualFees,
        annualFeeBalances,
        annualFeeDates,
      });
      persistTimeoutRef.current = null;
    }, 400);
    return () => {
      if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    };
  }, [cards, activeCardIds, activeOffers, transactionHistory, benefitBalances, customAnnualFees, annualFeeBalances, annualFeeDates]);

  const [showAddOffer, setShowAddOffer] = useState(false);
  const [editingOffer, setEditingOffer] = useState<UserOffer | null>(null);
  const [selectedWalletCardId, setSelectedWalletCardId] = useState<string | null>(null);

  const validOffers = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activeOffers.filter(offer => {
      if (offer.isUsed) return false;
      if (!activeCardIds.includes(offer.cardId)) return false;
      if (!offer.expirationDate) return true;
      const exp = new Date(offer.expirationDate);
      return exp >= today;
    });
  }, [activeOffers, activeCardIds]);

  const handleCalculate = useCallback(() => {
    const amountFloat = parseFloat(amount) || 0;
    const filteredCards = cards.filter(c => activeCardIds.includes(c.id));

    const rankedResults = calculateBestCards(
        filteredCards,
        validOffers,
        merchant,
        amountFloat,
        category,
        benefitBalances,
        selectedBenefit
    );
    setResults(rankedResults);
  }, [amount, cards, activeCardIds, validOffers, merchant, category, benefitBalances, selectedBenefit]);

  const handleUseCard = useCallback((result: RecommendationResult) => {
      const currentFee = annualFeeBalances[result.card.id] ?? (customAnnualFees[result.card.id] ?? result.card.annualFee);

      const cashIncentiveValue = result.breakdown.benefitsValue + result.breakdown.offersValue;
      const newFee = currentFee - cashIncentiveValue;

      setAnnualFeeBalances(prev => ({ ...prev, [result.card.id]: newFee }));

      const offsetDetails: TransactionOffsetDetail[] = [];
      result.breakdown.benefitDetails.forEach(bd => {
          const benefit = result.card.benefits.find(b => b.id === bd.benefitId);
          if (benefit) {
              offsetDetails.push({ name: benefit.name, type: 'perk', value: bd.usedAmount });
          }
      });
      result.breakdown.offerDetails.forEach(od => {
          offsetDetails.push({ name: od.offerName, type: 'offer', value: od.usedAmount });
      });

      const newRecord: TransactionRecord = {
          id: `tx-${Date.now()}`,
          cardId: result.card.id,
          merchantName: merchant || 'Purchase',
          date: new Date().toISOString(),
          amount: parseFloat(amount) || 0,
          feeOffset: cashIncentiveValue,
          offsetDetails
      };
      setTransactionHistory(prev => [newRecord, ...prev]);

      const offersUsedIds = result.breakdown.matchedOfferIds;
      if (offersUsedIds.length > 0) {
          setActiveOffers(prev => prev.map(o =>
             offersUsedIds.includes(o.id) ? { ...o, isUsed: true } : o
          ));
      }

      const benefitDetails = result.breakdown.benefitDetails;
      if (benefitDetails.length > 0) {
          setBenefitBalances(prev => {
              const next = { ...prev };
              benefitDetails.forEach(d => {
                  const current = next[d.benefitId] ?? 0;
                  next[d.benefitId] = Math.max(0, current - d.usedAmount);
              });
              return next;
          });
      }
      setAmount('');
      setMerchant('');
      setResults(null);
  }, [annualFeeBalances, customAnnualFees, merchant, amount]);

  const handleSelectBenefit = useCallback((benefitName: string) => {
      if (selectedBenefit === benefitName) {
          setSelectedBenefit('');
      } else {
          setSelectedBenefit(benefitName);
          const mappedCategory = getCategoryForBenefit(benefitName);
          setCategory(mappedCategory);
          setIsAutoCategorized(true);
      }
  }, [selectedBenefit]);

  const handleToggleActiveCard = useCallback((cardId: string) => {
    setActiveCardIds(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  }, []);

  const handleAddOffer = useCallback((offer: UserOffer) => {
    setActiveOffers(prev => [...prev, offer]);
    setShowAddOffer(false);
  }, []);

  const handleUpdateOffer = useCallback((updatedOffer: UserOffer) => {
      setActiveOffers(prev => prev.map(o => o.id === updatedOffer.id ? updatedOffer : o));
      setShowAddOffer(false);
      setEditingOffer(null);
  }, []);

  const handleDeleteOffer = useCallback((offerId: string) => {
    setActiveOffers(prev => prev.filter(o => o.id !== offerId));
  }, []);

  const handleMarkOfferUsed = useCallback((offerId: string) => {
      setActiveOffers(prev => prev.map(o => o.id === offerId ? { ...o, isUsed: true } : o));
  }, []);

  const handleUpdateFee = useCallback((cardId: string, newBalance: number, newDate: string, totalFee: number) => {
      setAnnualFeeBalances(prev => ({ ...prev, [cardId]: newBalance }));
      setAnnualFeeDates(prev => ({ ...prev, [cardId]: newDate }));
      setCustomAnnualFees(prev => ({ ...prev, [cardId]: totalFee }));
  }, []);

  const handleAddBenefit = useCallback((cardId: string, benefit: CardBenefit) => {
    setCards(prevCards => prevCards.map(c => {
        if (c.id === cardId) {
            return { ...c, benefits: [...c.benefits, benefit] };
        }
        return c;
    }));
    setBenefitBalances(prev => ({ ...prev, [benefit.id]: benefit.amount }));
  }, []);

  const handleUpdateBenefit = useCallback((cardId: string, updatedBenefit: CardBenefit) => {
      setCards(prevCards => prevCards.map(c => {
          if (c.id === cardId) {
              return {
                  ...c,
                  benefits: c.benefits.map(b => b.id === updatedBenefit.id ? updatedBenefit : b)
              };
          }
          return c;
      }));
      setBenefitBalances(prev => ({ ...prev, [updatedBenefit.id]: updatedBenefit.amount }));
  }, []);

  const handleDeleteBenefit = useCallback((cardId: string, benefitId: string) => {
      setCards(prevCards => prevCards.map(c => {
          if (c.id === cardId) {
              return { ...c, benefits: c.benefits.filter(b => b.id !== benefitId) };
          }
          return c;
      }));
      setBenefitBalances(prev => {
          const next = { ...prev };
          delete next[benefitId];
          return next;
      });
  }, []);

  const handleUpdateBenefitBalance = useCallback((benefitId: string, newAmount: number) => {
    setBenefitBalances(prev => ({ ...prev, [benefitId]: newAmount }));
  }, []);

  const handleResetToFreshState = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Clear all saved data and reset to fresh state with mock data? This cannot be undone.')) return;
    clearStoredState();
    window.location.reload();
  }, []);

  const selectedWalletCard = cards.find(c => c.id === selectedWalletCardId);

  const selectedWalletCardOffers = useMemo(
    () => activeOffers.filter(o => o.cardId === selectedWalletCardId),
    [activeOffers, selectedWalletCardId]
  );

  return (
    <div className="min-h-screen bg-black text-white pb-32 safe-bottom">
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 safe-top">
        <div className="max-w-lg mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3">
            <span className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </span>
            WhatCard
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToFreshState}
              className="text-[10px] font-bold text-neutral-500 hover:text-neutral-400 active:scale-95 px-3 py-2 rounded-full transition-all uppercase tracking-widest"
              title="Clear saved data and reset to mock data"
            >
              Reset data
            </button>
            <button
              onClick={() => {
                setEditingOffer(null);
                setShowAddOffer(!showAddOffer);
              }}
              className="text-sm font-bold bg-white/10 hover:bg-white/20 active:scale-95 px-5 py-2.5 rounded-full transition-all"
            >
              {showAddOffer ? 'Close' : '+ Offer'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 space-y-10">
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
             <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">My Wallet</h2>
             <span className="text-[10px] font-bold text-neutral-400 bg-neutral-900 border border-white/5 px-3 py-1 rounded-full">{activeCardIds.length} Active / {cards.length} Total</span>
          </div>
          <CardSelector
            cards={cards}
            activeCardIds={activeCardIds}
            onToggleActive={handleToggleActiveCard}
            onOpenDetails={(id) => setSelectedWalletCardId(id)}
            feeBalances={annualFeeBalances}
          />
        </section>

        {showAddOffer && (
          <section className="animate-slide-up">
             <OfferInput
               cards={cards}
               initialOffer={editingOffer}
               onAddOffer={handleAddOffer}
               onUpdateOffer={handleUpdateOffer}
               onCancel={() => {
                   setShowAddOffer(false);
                   setEditingOffer(null);
               }}
             />
          </section>
        )}

        <BenefitsList
            cards={cards}
            activeCardIds={activeCardIds}
            balances={benefitBalances}
            selectedBenefit={selectedBenefit}
            onSelectBenefit={handleSelectBenefit}
            onUpdateBalance={handleUpdateBenefitBalance}
        />

        <AllOffersList
          offers={validOffers}
          cards={cards}
          onDeleteOffer={handleDeleteOffer}
          onMarkUsed={handleMarkOfferUsed}
          onEditOffer={(o) => {setEditingOffer(o); setShowAddOffer(true);}}
          onSelectOffer={(o) => {setMerchant(o.merchantName); setAmount(o.minSpend?.toString() || '');}}
        />

        <section>
          <InputSection
            merchant={merchant} setMerchant={setMerchant}
            amount={amount} setAmount={setAmount}
            category={category} setCategory={setCategory}
            selectedBenefit={selectedBenefit} setSelectedBenefit={handleSelectBenefit}
            onCalculate={handleCalculate}
            isAutoCategorized={isAutoCategorized} setIsAutoCategorized={setIsAutoCategorized}
            cards={cards} activeCardIds={activeCardIds} benefitBalances={benefitBalances}
          />
        </section>

        {results && (
          <section className="space-y-4 animate-fade-in pb-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-black text-2xl">Ranking</h3>
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Optimized By Value</span>
            </div>
            <div className="space-y-6">
              {results.map((result, index) => (
                <RecommendationCard
                  key={result.card.id}
                  result={result}
                  rank={index + 1}
                  onUseBenefit={() => {}}
                  onUseOffer={handleMarkOfferUsed}
                  onUseCard={() => handleUseCard(result)}
                />
              ))}
            </div>
          </section>
        )}

        {selectedWalletCard && (
            <CardDetailsModal
                key={selectedWalletCard.id}
                card={selectedWalletCard}
                offers={selectedWalletCardOffers}
                benefitBalances={benefitBalances}
                annualFeeBalance={annualFeeBalances[selectedWalletCard.id] ?? (customAnnualFees[selectedWalletCard.id] ?? selectedWalletCard.annualFee)}
                totalAnnualFee={customAnnualFees[selectedWalletCard.id] ?? selectedWalletCard.annualFee}
                lastFeeDate={annualFeeDates[selectedWalletCard.id] ?? new Date().toISOString().split('T')[0]}
                transactionHistory={transactionHistory.filter(t => t.cardId === selectedWalletCard.id)}
                onUpdateFee={handleUpdateFee}
                onUseBenefit={handleUpdateBenefitBalance}
                onClose={() => setSelectedWalletCardId(null)}
                onAddBenefit={handleAddBenefit}
                onUpdateBenefit={handleUpdateBenefit}
                onDeleteBenefit={handleDeleteBenefit}
                onAddOffer={handleAddOffer}
                onDeleteOffer={handleDeleteOffer}
                onUpdateOffer={handleUpdateOffer}
                onMarkOfferUsed={handleMarkOfferUsed}
            />
        )}
      </main>
    </div>
  );
};

export default HomeScreen;
