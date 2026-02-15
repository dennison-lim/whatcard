import React, { useMemo } from 'react';
import { CreditCard } from '../types';
import { getBenefitIcon } from '../utils/merchantUtils';

interface PerksBadgesProps {
  cards: CreditCard[];
  activeCardIds: string[];
  balances: Record<string, number>;
  selectedBenefit: string;
  onSelectBenefit: (benefitName: string) => void;
}

const PerksBadges: React.FC<PerksBadgesProps> = ({ cards, activeCardIds, balances, selectedBenefit, onSelectBenefit }) => {
  const activeBenefits = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return cards
      .filter(card => activeCardIds.includes(card.id))
      .flatMap(card =>
        card.benefits
          .filter(b => {
            const isExpired = b.expirationDate && new Date(b.expirationDate) < today;
            const balance = balances[b.id] ?? b.amount;
            return !isExpired && balance > 0;
          })
          .map(b => ({
            ...b,
            cardName: card.name,
            balance: balances[b.id] ?? b.amount,
          }))
      );
  }, [cards, activeCardIds, balances]);

  if (activeBenefits.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between px-1 mb-3">
        <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Perks</h2>
        <span className="text-[10px] font-bold text-neutral-600 bg-white/5 px-2.5 py-1 rounded-full">{activeBenefits.length} Active</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeBenefits.map(b => {
          const isSelected = selectedBenefit === b.name;
          const icon = getBenefitIcon(b.name);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelectBenefit(b.name)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                isSelected
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-neutral-900 border-white/5 text-neutral-400 hover:border-blue-500/30'
              }`}
            >
              <span>{icon}</span>
              <span>{b.name.replace(' Credit', '')}</span>
              <span className={`${isSelected ? 'text-blue-200' : 'text-green-400'}`}>${b.balance.toFixed(0)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(PerksBadges);
