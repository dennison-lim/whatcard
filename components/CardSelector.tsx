import React from 'react';
import { CreditCard } from '../types';

interface CardSelectorProps {
  cards: CreditCard[];
  activeCardIds: string[];
  onToggleActive: (cardId: string) => void;
  onOpenDetails: (cardId: string) => void;
  feeBalances: Record<string, number>;
}

const CardSelector: React.FC<CardSelectorProps> = ({ cards, activeCardIds, onToggleActive, onOpenDetails, feeBalances }) => {
  return (
    <div className="w-full overflow-x-auto pb-6 hide-scrollbar">
      <div className="flex gap-5 px-1">
        {cards.map((card) => {
          const isActive = activeCardIds.includes(card.id);
          const fee = feeBalances[card.id] ?? card.annualFee;
          const isProfit = fee < 0;

          return (
            <div key={card.id} className="relative flex-shrink-0 group">
              <button
                onClick={() => onToggleActive(card.id)}
                className={`relative w-40 h-28 rounded-[2rem] transition-all duration-500 overflow-hidden text-left p-4 flex flex-col justify-between shadow-lg active:scale-95 ${
                  isActive ? card.imageColor : 'bg-neutral-800 border border-white/5'
                }`}
              >
                {/* Active Indicator */}
                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-white shadow-lg' : 'bg-neutral-700 border border-white/10'
                }`}>
                  {isActive && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-black">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Card Label */}
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit ${
                    isActive ? 'bg-white/30 backdrop-blur-sm text-black/80' : 'bg-neutral-700 text-neutral-400'
                  }`}>
                    {card.issuer}
                  </div>

                  <div>
                    <div className={`text-xs font-black tracking-tight leading-tight truncate mb-1.5 ${
                      isActive ? 'text-black' : 'text-neutral-500'
                    }`}>
                      {card.name}
                    </div>
                    <div className={`text-[8px] font-black px-2 py-0.5 rounded-full w-fit uppercase tracking-widest transition-all ${
                      isActive 
                        ? (isProfit ? 'bg-green-400 text-black' : 'bg-black text-white')
                        : 'bg-neutral-900 text-neutral-600'
                    }`}>
                      {isProfit ? 'PROFIT' : `$${fee.toFixed(0)} DUE`}
                    </div>
                  </div>
                </div>

                {/* Aesthetic gradients */}
                {isActive && (
                  <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                )}
              </button>

              {/* Info Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(card.id);
                }}
                className={`absolute -bottom-2 -right-1 p-2 rounded-full border transition-all shadow-md active:scale-90 ${
                  isActive 
                    ? 'bg-neutral-900 border-white/10 text-white hover:bg-neutral-800' 
                    : 'bg-neutral-800 border-white/5 text-neutral-600'
                }`}
                title="Card Details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15h.03a.75.75 0 000-1.5h-.03a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardSelector;