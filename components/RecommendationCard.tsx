import React from 'react';
import { RecommendationResult } from '../types';

interface RecommendationCardProps {
  result: RecommendationResult;
  rank: number;
  onUseBenefit: (benefitId: string) => void;
  onUseOffer: (offerId: string) => void;
  onUseCard: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ result, rank, onUseCard }) => {
  const { card, totalValue, breakdown } = result;
  const isTopPick = rank === 1;

  return (
    <div className={`group relative flex flex-col bg-neutral-900 rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${
      isTopPick 
        ? 'border-blue-500 ring-8 ring-blue-500/5 shadow-2xl' 
        : 'border-white/5 shadow-lg'
    }`}>
      <div className={`h-1.5 w-full ${card.imageColor}`}></div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
             <div className="flex items-center gap-2 mb-3">
               <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full">{card.issuer}</span>
               {isTopPick && <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-400/20">WINNER</span>}
             </div>
             <h3 className="text-2xl font-black text-white leading-tight tracking-tighter">{card.name}</h3>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-white tracking-tighter leading-none">
              ${totalValue.toFixed(2)}
            </div>
            <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-2">Value Realized</div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between text-neutral-400">
               <span className="flex items-center gap-3">
                 <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                 <span className="font-bold text-white text-sm">
                   {card.baseBonusCategories.find(c => c.name === breakdown.matchedCategory)?.multiplier}x Rewards
                 </span>
                 <span className="text-[10px] font-black text-neutral-500 uppercase">({breakdown.matchedCategory})</span>
               </span>
               <span className="font-black text-white text-sm">${breakdown.pointsValue.toFixed(2)}</span>
            </div>

            {breakdown.benefitsValue > 0 && (
              <div className="flex items-start justify-between">
                <span className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  <span className="font-bold text-white text-sm truncate max-w-[200px]">
                    {breakdown.matchedBenefitNames.join(', ')}
                  </span>
                </span>
                <span className="font-black text-green-400 text-sm">+${breakdown.benefitsValue.toFixed(2)}</span>
              </div>
            )}

            {breakdown.offersValue > 0 && (
              <div className="flex items-start justify-between">
                <span className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="font-bold text-white text-sm truncate max-w-[200px]">
                    {breakdown.matchedOfferNames.join(', ')}
                  </span>
                </span>
                <span className="font-black text-green-400 text-sm">+${breakdown.offersValue.toFixed(2)}</span>
              </div>
            )}
        </div>

        <button 
            onClick={onUseCard}
            className={`w-full mt-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-3 ${
                isTopPick 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' 
                : 'bg-white text-black'
            }`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Commit Transaction
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;