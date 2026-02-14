import React, { useState, useEffect } from 'react';
import { CreditCard, UserOffer } from '../types';

interface OfferInputProps {
  cards: CreditCard[];
  initialOffer?: UserOffer | null;
  onAddOffer: (offer: UserOffer) => void;
  onUpdateOffer: (offer: UserOffer) => void;
  onCancel: () => void;
}

const OfferInput: React.FC<OfferInputProps> = ({ cards, initialOffer, onAddOffer, onUpdateOffer, onCancel }) => {
  const [merchant, setMerchant] = useState('');
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || '');
  const [offerType, setOfferType] = useState<'spend_X_get_Y' | 'percent_back'>('spend_X_get_Y');
  const [minSpend, setMinSpend] = useState('');
  const [fixedReward, setFixedReward] = useState('');
  const [percentBack, setPercentBack] = useState('');
  const [maxReward, setMaxReward] = useState('');
  const [expiration, setExpiration] = useState('');

  useEffect(() => {
    if (initialOffer) {
        setMerchant(initialOffer.merchantName);
        setSelectedCardId(initialOffer.cardId);
        setOfferType(initialOffer.offerType);
        setExpiration(initialOffer.expirationDate || '');
        if (initialOffer.offerType === 'spend_X_get_Y') {
            setMinSpend(initialOffer.minSpend?.toString() || '');
            setFixedReward(initialOffer.fixedReward?.toString() || '');
        } else {
            setPercentBack(initialOffer.percentBack?.toString() || '');
            setMaxReward(initialOffer.maxReward?.toString() || '');
        }
    }
  }, [initialOffer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const offerData: UserOffer = {
      id: initialOffer ? initialOffer.id : `custom-${Date.now()}`,
      cardId: selectedCardId,
      merchantName: merchant,
      offerType: offerType,
      expirationDate: expiration || undefined
    };
    if (offerType === 'spend_X_get_Y') {
        offerData.minSpend = parseFloat(minSpend) || 0;
        offerData.fixedReward = parseFloat(fixedReward) || 0;
    } else {
        offerData.percentBack = parseFloat(percentBack) || 0;
        offerData.maxReward = parseFloat(maxReward) || undefined;
    }
    if (initialOffer) onUpdateOffer(offerData);
    else onAddOffer(offerData);
  };

  return (
    <div className="bg-neutral-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl text-white mb-10">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black tracking-tighter uppercase tracking-widest text-xs text-neutral-500">Add Offer Detail</h3>
        <button onClick={onCancel} className="text-neutral-500 hover:text-white p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 ml-1">Merchant</label>
                <input type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)} className="w-full p-4 bg-neutral-800 border border-white/5 rounded-2xl text-sm font-black text-white outline-none focus:border-blue-500" placeholder="e.g. Nike" required />
            </div>
            <div className="col-span-2">
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 ml-1">Card</label>
                <select value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)} className="w-full p-4 bg-neutral-800 border border-white/5 rounded-2xl text-sm font-black text-white outline-none appearance-none">
                    {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
        </div>

        <div>
            <div className="flex gap-2 p-1.5 bg-neutral-800 rounded-2xl border border-white/5">
                <button type="button" onClick={() => setOfferType('spend_X_get_Y')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${offerType === 'spend_X_get_Y' ? 'bg-white text-black' : 'text-neutral-500'}`}>Spend X Get Y</button>
                <button type="button" onClick={() => setOfferType('percent_back')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${offerType === 'percent_back' ? 'bg-white text-black' : 'text-neutral-500'}`}>Percent Back</button>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {offerType === 'spend_X_get_Y' ? (
                <>
                    <div><label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 ml-1">Min Spend</label><input type="number" value={minSpend} onChange={e => setMinSpend(e.target.value)} className="w-full p-4 bg-neutral-800 border border-white/5 rounded-2xl text-sm font-black text-white outline-none" placeholder="50" /></div>
                    <div><label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 ml-1">Reward</label><input type="number" value={fixedReward} onChange={e => setFixedReward(e.target.value)} className="w-full p-4 bg-neutral-800 border border-white/5 rounded-2xl text-sm font-black text-white outline-none" placeholder="10" required /></div>
                </>
            ) : (
                <>
                    <div><label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 ml-1">Cashback %</label><input type="number" value={percentBack} onChange={e => setPercentBack(e.target.value)} className="w-full p-4 bg-neutral-800 border border-white/5 rounded-2xl text-sm font-black text-white outline-none" placeholder="5" required /></div>
                    <div><label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 ml-1">Cap (Opt)</label><input type="number" value={maxReward} onChange={e => setMaxReward(e.target.value)} className="w-full p-4 bg-neutral-800 border border-white/5 rounded-2xl text-sm font-black text-white outline-none" placeholder="25" /></div>
                </>
            )}
        </div>

        <div>
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 ml-1">Expiration</label>
          <input type="date" value={expiration} onChange={(e) => setExpiration(e.target.value)} className="w-full p-4 bg-neutral-800 border border-white/5 rounded-2xl text-sm font-black text-white outline-none" />
        </div>

        <button type="submit" className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-white/5">
          {initialOffer ? 'Update Strategy' : 'Store Offer'}
        </button>
      </form>
    </div>
  );
};

export default OfferInput;