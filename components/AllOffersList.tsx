import React, { useState } from 'react';
import { UserOffer, CreditCard } from '../types';
import { getBenefitIcon } from '../utils/merchantUtils';

interface AllOffersListProps {
  offers: UserOffer[];
  cards: CreditCard[];
  onDeleteOffer: (offerId: string) => void;
  onMarkUsed: (offerId: string) => void;
  onEditOffer: (offer: UserOffer) => void;
  onSelectOffer: (offer: UserOffer) => void;
}

const AllOffersList: React.FC<AllOffersListProps> = ({ offers, cards, onDeleteOffer, onMarkUsed, onEditOffer, onSelectOffer }) => {
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);

  if (offers.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between px-1 mb-4">
        <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Available Offers</h2>
        <span className="text-[10px] font-bold text-neutral-600 bg-white/5 px-2.5 py-1 rounded-full">{offers.length} Deals</span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 px-1 hide-scrollbar snap-x">
        {offers.map(offer => (
          <div 
            key={offer.id} 
            className="flex-shrink-0 w-[180px] bg-neutral-900 rounded-[2rem] border border-white/5 p-5 flex flex-col justify-between snap-start shadow-lg hover:border-amber-500/30 transition-all cursor-pointer group active:scale-95"
            onClick={() => onSelectOffer(offer)}
          >
            {/* Header: Icon + Card Tag */}
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl bg-neutral-800 text-amber-500">
                   {getBenefitIcon(offer.merchantName)}
                </div>
                <div className="text-[9px] font-black px-2 py-1 rounded-full bg-white/5 text-neutral-400 uppercase tracking-widest truncate max-w-[80px]">
                   {cards.find(c => c.id === offer.cardId)?.name}
                </div>
            </div>

            {/* Body: Name + Description */}
            <div className="mb-4">
               <div className="font-black text-sm text-white leading-tight tracking-tight truncate">
                   {offer.merchantName}
               </div>
               <div className="text-[11px] font-bold text-neutral-500 mt-1 line-clamp-2 h-8 leading-tight">
                  {offer.offerType === 'spend_X_get_Y' 
                    ? `Get $${offer.fixedReward} on $${offer.minSpend}` 
                    : `${offer.percentBack}% Cashback`}
               </div>
            </div>

            {/* Footer: Expiry + Actions */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                   <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Expires</div>
                   <div className="font-black text-[11px] text-neutral-400 uppercase">
                       {offer.expirationDate ? new Date(offer.expirationDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'No Expiry'}
                   </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onMarkUsed(offer.id); }} className="p-2 text-neutral-600 hover:text-green-400 transition-colors" title="Mark Used"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg></button>
                    <button onClick={(e) => { e.stopPropagation(); setOfferToDelete(offer.id); }} className="p-2 text-neutral-600 hover:text-red-400 transition-colors" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {offerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOfferToDelete(null)}></div>
            <div className="bg-neutral-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative border border-white/10 text-white animate-fade-in text-center">
                <h3 className="text-xl font-black mb-3">Delete Offer?</h3>
                <p className="text-sm text-neutral-400 mb-8">Removing "{offers.find(o => o.id === offerToDelete)?.merchantName}".</p>
                <div className="flex gap-4">
                    <button onClick={() => setOfferToDelete(null)} className="flex-1 py-4 bg-neutral-800 text-neutral-300 font-black rounded-2xl uppercase text-xs">Back</button>
                    <button onClick={() => {onDeleteOffer(offerToDelete!); setOfferToDelete(null);}} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-xs">Delete</button>
                </div>
            </div>
        </div>
      )}
    </section>
  );
};

export default React.memo(AllOffersList);