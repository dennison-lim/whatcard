import React, { useState } from 'react';
import { CreditCard, CardBenefit } from '../types';
import { getBenefitIcon } from '../utils/merchantUtils';

interface BenefitsListProps {
  cards: CreditCard[];
  activeCardIds: string[];
  balances: Record<string, number>;
  selectedBenefit: string;
  onSelectBenefit: (benefitName: string) => void;
  onUpdateBalance: (benefitId: string, newAmount: number) => void;
}

const BenefitsList: React.FC<BenefitsListProps> = ({ cards, activeCardIds, balances, selectedBenefit, onSelectBenefit, onUpdateBalance }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState('');

  const handleEditClick = (benefit: CardBenefit, currentBalance: number) => {
    setEditingId(benefit.id);
    setTempAmount(currentBalance.toString());
  };

  const handleSave = (benefitId: string) => {
    const val = parseFloat(tempAmount);
    if (!isNaN(val) && val >= 0) onUpdateBalance(benefitId, val);
    setEditingId(null);
  };

  const handleQuickUse = (e: React.MouseEvent, benefitId: string) => {
    e.stopPropagation();
    onUpdateBalance(benefitId, 0);
  };

  const allBenefits = cards
    .filter(card => activeCardIds.includes(card.id))
    .flatMap(card => 
      card.benefits.map(benefit => ({ ...benefit, cardName: card.name, issuer: card.issuer, cardColor: card.imageColor }))
    );

  if (allBenefits.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between px-1 mb-4">
        <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Perks</h2>
        <span className="text-[10px] font-bold text-neutral-600 bg-white/5 px-2.5 py-1 rounded-full">{allBenefits.length} Active</span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 px-1 hide-scrollbar snap-x">
        {allBenefits.map(benefit => {
          const balance = balances[benefit.id] ?? benefit.amount;
          const isUsed = balance <= 0;
          const isSelected = selectedBenefit === benefit.name;
          const benefitName = benefit.name; // Capture for closure

          return (
            <div 
                key={benefit.id} 
                onClick={() => !isUsed && editingId !== benefit.id && onSelectBenefit(isSelected ? '' : benefitName)}
                className={`flex-shrink-0 w-[180px] bg-neutral-900 rounded-[2rem] border p-5 flex flex-col justify-between snap-start transition-all cursor-pointer relative ${
                    isUsed 
                    ? 'opacity-30 border-white/5 grayscale' 
                    : isSelected 
                        ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-xl' 
                        : 'border-white/5 shadow-lg'
                }`}
            >
              {/* Header: Icon + Card Tag */}
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl bg-neutral-800 ${isSelected ? 'text-blue-400' : 'text-pink-500'}`}>
                   {getBenefitIcon(benefit.name)}
                </div>
                <div className="text-[9px] font-black px-2 py-1 rounded-full bg-white/5 text-neutral-400 uppercase tracking-widest truncate max-w-[80px]">
                   {benefit.cardName}
                </div>
              </div>

              {/* Body: Name + Frequency */}
              <div className="mb-4">
                  <div className={`font-black text-sm leading-tight tracking-tight truncate ${isUsed ? 'text-neutral-600 line-through' : 'text-white'}`}>
                      {benefit.name}
                  </div>
                  <div className="text-[11px] font-bold text-neutral-500 mt-1 uppercase tracking-widest truncate">
                      {benefit.frequency}
                  </div>
              </div>

              {/* Footer: Balance + Actions */}
              <div className="pt-4 border-t border-white/5">
                 {editingId === benefit.id ? (
                     <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                         <input 
                            type="number" autoFocus value={tempAmount}
                            onChange={(e) => setTempAmount(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-neutral-800 text-white text-xs font-black p-2 rounded-xl border border-blue-500 outline-none"
                         />
                         <button onClick={(e) => { e.stopPropagation(); handleSave(benefit.id); }} className="bg-green-600 text-white p-2 rounded-xl">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                         </button>
                     </div>
                 ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Left</div>
                            <div className={`font-black text-xl leading-none ${isUsed ? 'text-neutral-700' : 'text-green-400'}`}>
                                ${balance.toFixed(0)}
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {!isUsed && (
                              <button 
                                onClick={(e) => handleQuickUse(e, benefit.id)}
                                className="p-2 text-neutral-600 hover:text-green-400 transition-colors"
                                title="Mark Used"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                              </button>
                            )}
                            {!isUsed && (
                                <button onClick={(e) => {e.stopPropagation(); handleEditClick(benefit, balance);}} className="p-2 text-neutral-600 hover:text-white transition-colors" title="Edit Balance">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(BenefitsList);