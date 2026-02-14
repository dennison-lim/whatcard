import React from 'react';
import { RecommendationResult } from '../types';

interface CardResultProps {
  result: RecommendationResult;
  rank: number;
}

const CardResult: React.FC<CardResultProps> = ({ result, rank }) => {
  const { card, totalValue, breakdown } = result;
  const isBest = rank === 1;

  return (
    <div className={`relative overflow-hidden rounded-2xl mb-4 transition-all duration-300 ${
      isBest ? 'ring-2 ring-blue-500 shadow-xl scale-[1.02]' : 'bg-white shadow-sm border border-gray-100 opacity-90 hover:opacity-100'
    }`}>
      {/* Card Header Background */}
      <div className={`h-24 ${card.imageColor} relative p-4 flex justify-between items-start`}>
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wide">
          {card.issuer}
        </div>
        {isBest && (
           <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
               <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
             </svg>
             Best Value
           </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 bg-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{card.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Return</p>
          </div>
          <div className="text-right">
             <span className="block text-2xl font-black text-green-600">
               ${totalValue.toFixed(2)}
             </span>
          </div>
        </div>

        {/* Breakdown Tags */}
        <div className="space-y-3">
          
          {/* Points Breakdown */}
          <div className="flex items-center justify-between text-sm group">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span className="font-bold text-xs">{breakdown.pointsEarned.toFixed(0)}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">Points Earned</span>
                <span className="text-xs text-gray-400">
                  {breakdown.matchedCategory} ({card.baseBonusCategories.find(c => c.name === breakdown.matchedCategory)?.multiplier}x)
                </span>
              </div>
            </div>
            <span className="font-semibold text-gray-700">~${breakdown.pointsValue.toFixed(2)}</span>
          </div>

          {/* Benefits Breakdown */}
          {breakdown.benefitsValue > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">Credits Applied</span>
                  <span className="text-xs text-gray-400">Card Benefit</span>
                </div>
              </div>
              <span className="font-semibold text-green-600">+${breakdown.benefitsValue.toFixed(2)}</span>
            </div>
          )}

          {/* Offers Breakdown */}
          {breakdown.offersValue > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.699-3.181a1 1 0 011.758 1.076l-1.699 3.182 1.325.53a1 1 0 010 1.856l-1.325.53 1.699 3.181a1 1 0 11-1.758 1.077L14.954 11.69 11 13.273V18a1 1 0 11-2 0v-4.727l-3.954-1.582-1.699 3.181a1 1 0 11-1.758-1.077l1.699-3.182-1.325-.53a1 1 0 010-1.856l1.325-.53-1.699-3.181a1 1 0 111.758-1.076l1.699 3.182L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">Active Offer</span>
                  <span className="text-xs text-gray-400">Merchant Deal</span>
                </div>
              </div>
              <span className="font-semibold text-green-600">+${breakdown.offersValue.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardResult;