import React, { useEffect, useMemo } from 'react';
import { guessCategory, getBenefitIcon } from '../utils/merchantUtils';
import { CreditCard } from '../types';

interface InputSectionProps {
  merchant: string;
  setMerchant: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  selectedBenefit: string;
  setSelectedBenefit: (val: string) => void;
  onCalculate: () => void;
  isAutoCategorized: boolean;
  setIsAutoCategorized: (val: boolean) => void;
  cards: CreditCard[];
  benefitBalances: Record<string, number>;
}

const CATEGORIES = [
  { id: 'Dining', label: 'Dining', icon: '🍔' },
  { id: 'Travel', label: 'Travel', icon: '✈️' },
  { id: 'Groceries', label: 'Groceries', icon: '🛒' },
  { id: 'Drugstore', label: 'Pharma', icon: '💊' },
  { id: 'Gas', label: 'Gas', icon: '⛽' },
  { id: 'Streaming', label: 'Stream', icon: '📺' },
  { id: 'Shopping', label: 'Shop', icon: '🛍️' },
  { id: 'Other', label: 'Other', icon: '💳' },
];

const InputSection: React.FC<InputSectionProps> = ({
    merchant, setMerchant, amount, setAmount, category, setCategory,
    selectedBenefit, setSelectedBenefit, onCalculate,
    isAutoCategorized, setIsAutoCategorized, cards, benefitBalances
}) => {

  useEffect(() => {
    if (!merchant) {
      setIsAutoCategorized(false);
      return;
    }
    const timer = setTimeout(() => {
      const guessed = guessCategory(merchant);
      if (guessed && guessed !== category) {
        setCategory(guessed);
        setIsAutoCategorized(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [merchant]);

  const handleCategorySelect = (id: string) => {
    setCategory(id);
    setIsAutoCategorized(false);
  };

  const selectedBenefitSummary = useMemo(() => {
    if (!selectedBenefit) return null;
    for (const card of cards) {
      const benefit = card.benefits.find(b => b.name === selectedBenefit);
      if (benefit) {
        return {
          cardName: card.name,
          issuer: card.issuer,
          balance: benefitBalances[benefit.id] ?? benefit.amount,
          color: card.imageColor
        };
      }
    }
    return null;
  }, [selectedBenefit, cards, benefitBalances]);

  return (
    <div className="bg-neutral-900 rounded-[2.5rem] p-8 border border-white/5 relative shadow-2xl overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 to-indigo-600" />

      <form onSubmit={(e) => {e.preventDefault(); onCalculate();}} className="space-y-10">
        {/* Amount Input */}
        <div className="flex flex-col items-center">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Purchase Amount</label>
            <div className="flex items-center justify-center gap-2 text-white">
                <span className={`text-4xl font-black ${amount ? 'text-white' : 'text-neutral-700'}`}>$</span>
                <input
                    type="number" step="0.01" min="0" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="text-6xl font-black text-center w-48 bg-transparent outline-none placeholder-neutral-800 transition-all caret-blue-500"
                    required
                />
            </div>
        </div>

        {/* Merchant Input */}
        <div className="relative group">
             <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
                </svg>
             </div>
             <input
                type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)}
                placeholder="Where are you shopping?"
                className="w-full bg-neutral-800 text-white text-lg font-bold rounded-2xl pl-14 pr-6 py-5 focus:bg-neutral-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all border border-transparent placeholder-neutral-600 outline-none shadow-inner"
                required
             />
        </div>

        {/* Category Selector */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Category</label>
            {isAutoCategorized && (
              <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full animate-fade-in border border-blue-400/20 uppercase">
                <span>✨</span> Auto-Matched
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id} type="button" onClick={() => handleCategorySelect(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 active:scale-95 ${
                  category === cat.id
                    ? 'bg-white text-black shadow-xl scale-105'
                    : 'bg-neutral-800 text-neutral-500 border border-white/5 hover:bg-neutral-700'
                }`}
              >
                <span className="text-2xl mb-1">{cat.icon}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${category === cat.id ? 'text-black' : 'text-neutral-500'}`}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Override Summary */}
        {selectedBenefitSummary ? (
            <div className="animate-fade-in">
                <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl p-5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${selectedBenefitSummary.color} flex items-center justify-center text-black shadow-lg`}>
                            <span className="text-[10px] font-black uppercase tracking-tighter">
                                {selectedBenefitSummary.issuer}
                            </span>
                        </div>
                        <div>
                            <div className="text-[10px] text-neutral-500 font-black uppercase mb-0.5 tracking-widest">Active Override</div>
                            <div className="text-sm font-black text-white">{selectedBenefit}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-2xl font-black text-green-400">${selectedBenefitSummary.balance.toFixed(0)}</div>
                            <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Remaining</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedBenefit(selectedBenefit)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-700 hover:bg-neutral-600 text-neutral-400 hover:text-white transition-colors"
                            title="Clear override"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            <p className="text-[10px] text-neutral-600 italic px-1 text-center">Tap a perk badge below to set override</p>
        )}

        <button
          type="submit"
          className="w-full py-5 rounded-[1.5rem] font-black text-white shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-sm bg-blue-600 hover:bg-blue-500 shadow-blue-500/30"
        >
          Optimize This Spend
        </button>
      </form>
    </div>
  );
};

export default React.memo(InputSection);
