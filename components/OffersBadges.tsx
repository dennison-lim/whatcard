import React from 'react';
import { UserOffer, CreditCard } from '../types';
import { getBenefitIcon } from '../utils/merchantUtils';

interface OffersBadgesProps {
  offers: UserOffer[];
  cards: CreditCard[];
  onSelectOffer: (offer: UserOffer) => void;
}

const OffersBadges: React.FC<OffersBadgesProps> = ({ offers, cards, onSelectOffer }) => {
  if (offers.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between px-1 mb-3">
        <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Available Offers</h2>
        <span className="text-[10px] font-bold text-neutral-600 bg-white/5 px-2.5 py-1 rounded-full">{offers.length} Deals</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {offers.map(offer => {
          const icon = getBenefitIcon(offer.merchantName);
          const deal = offer.offerType === 'spend_X_get_Y'
            ? `$${offer.fixedReward} on $${offer.minSpend}`
            : `${offer.percentBack}%`;
          return (
            <button
              key={offer.id}
              type="button"
              onClick={() => onSelectOffer(offer)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/5 bg-neutral-900 text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:border-amber-500/30 transition-all active:scale-95"
            >
              <span>{icon}</span>
              <span>{offer.merchantName}</span>
              <span className="text-amber-400">{deal}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(OffersBadges);
