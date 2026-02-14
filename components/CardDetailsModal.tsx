import React, { useState, useEffect } from 'react';
import { CreditCard, UserOffer, CardBenefit, TransactionRecord } from '../types';
import { getBenefitIcon } from '../utils/merchantUtils';
import OfferInput from './OfferInput';

interface CardDetailsModalProps {
  card: CreditCard;
  offers: UserOffer[];
  onClose: () => void;
  benefitBalances: Record<string, number>;
  annualFeeBalance: number;
  totalAnnualFee: number;
  lastFeeDate: string;
  transactionHistory: TransactionRecord[];
  onUpdateFee: (cardId: string, balance: number, date: string, totalFee: number) => void;
  onUseBenefit: (benefitId: string, newAmount: number) => void;
  onAddBenefit: (cardId: string, benefit: CardBenefit) => void;
  onUpdateBenefit: (cardId: string, benefit: CardBenefit) => void;
  onDeleteBenefit: (cardId: string, benefitId: string) => void;
  onAddOffer: (offer: UserOffer) => void;
  onDeleteOffer: (offerId: string) => void;
  onUpdateOffer: (offer: UserOffer) => void;
  onMarkOfferUsed: (offerId: string) => void;
}

const CardDetailsModal: React.FC<CardDetailsModalProps> = ({ 
    card, offers, onClose, benefitBalances, annualFeeBalance,
    totalAnnualFee, lastFeeDate, transactionHistory, onUpdateFee, onAddBenefit, 
    onUpdateBenefit, onDeleteBenefit, onAddOffer, onDeleteOffer, onUpdateOffer, onMarkOfferUsed, onUseBenefit
}) => {
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [tempFee, setTempFee] = useState(annualFeeBalance.toString());
  const [tempTotalFee, setTempTotalFee] = useState(totalAnnualFee.toString());
  const [tempDate, setTempDate] = useState(lastFeeDate);
  
  const [isAddingBenefit, setIsAddingBenefit] = useState(false);
  const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [editingOffer, setEditingOffer] = useState<UserOffer | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formBalance, setFormBalance] = useState('');
  const [formFrequency, setFormFrequency] = useState<'monthly' | 'annually' | 'quarterly' | 'once'>('monthly');
  const [formMerchantFilter, setFormMerchantFilter] = useState('');
  const [formExpiration, setFormExpiration] = useState('');

  useEffect(() => {
    setTempFee(annualFeeBalance.toString());
    setTempTotalFee(totalAnnualFee.toString());
    setTempDate(lastFeeDate);
  }, [annualFeeBalance, totalAnnualFee, lastFeeDate]);

  const handleSaveFee = () => {
      const val = parseFloat(tempFee);
      const total = parseFloat(tempTotalFee);
      if (!isNaN(val) && !isNaN(total)) {
          onUpdateFee(card.id, val, tempDate, total);
      }
      setIsEditingFee(false);
  };

  const handleRenewCard = () => {
      const total = parseFloat(tempTotalFee);
      if (isNaN(total)) return;
      const d = new Date(tempDate);
      if (isNaN(d.getTime())) return;
      d.setFullYear(d.getFullYear() + 1);
      const newDate = d.toISOString().split('T')[0];
      setTempDate(newDate);
      setTempFee(total.toString());
      onUpdateFee(card.id, total, newDate, total);
      setIsEditingFee(false);
  };

  // Fixed Reset Logic for Perks
  const openNewBenefitForm = () => {
      setFormName('');
      setFormAmount('');
      setFormBalance('');
      setFormFrequency('monthly');
      setFormMerchantFilter('');
      setFormExpiration('');
      setEditingBenefitId(null);
      setIsAddingBenefit(true);
      setIsAddingOffer(false);
      setEditingOffer(null);
  };

  const startEditBenefit = (benefit: CardBenefit) => {
      setFormName(benefit.name);
      setFormAmount(benefit.amount.toString());
      setFormBalance((benefitBalances[benefit.id] ?? benefit.amount).toString());
      setFormFrequency(benefit.frequency);
      setFormMerchantFilter(benefit.merchantFilter.join(', '));
      setFormExpiration(benefit.expirationDate || '');
      setEditingBenefitId(benefit.id);
      setIsAddingBenefit(true);
      setIsAddingOffer(false);
      setEditingOffer(null);
  };

  const handleSaveBenefit = (e: React.FormEvent) => {
      e.preventDefault();
      const benefitId = editingBenefitId || `benefit-${Date.now()}`;
      const maxVal = parseFloat(formAmount);
      
      let currentBal = parseFloat(formBalance);
      if (isNaN(currentBal)) currentBal = maxVal; // Default to max if not specified

      const newBenefit: CardBenefit = {
          id: benefitId,
          name: formName,
          amount: maxVal,
          frequency: formFrequency,
          type: 'credit',
          merchantFilter: formMerchantFilter.split(',').map(s => s.trim()).filter(s => s.length > 0),
          expirationDate: formExpiration || undefined
      };

      if (editingBenefitId) onUpdateBenefit(card.id, newBenefit);
      else onAddBenefit(card.id, newBenefit);
      
      // Update balance state
      onUseBenefit(benefitId, currentBal);

      setIsAddingBenefit(false);
      setEditingBenefitId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto" onClick={onClose}></div>

      <div className="bg-neutral-900 w-full max-w-md sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl pointer-events-auto animate-slide-up max-h-[90vh] flex flex-col overflow-hidden text-white border-t border-white/10">
        {/* Header */}
        <div className={`p-8 pb-12 text-black relative overflow-hidden ${card.imageColor}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tighter">{card.name}</h2>
            <p className="font-bold opacity-60 uppercase tracking-widest text-[10px] mt-1">{card.issuer}</p>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 text-black hover:bg-black/10 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-neutral-900 -mt-6 rounded-t-[2.5rem] relative z-20 px-6 py-8 space-y-12 pb-20">
            {/* Fee Tracking */}
            <section className="bg-neutral-800 rounded-3xl p-6 border border-white/5 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Financial Tracker</h3>
                    {!isEditingFee && (
                        <button onClick={() => setIsEditingFee(true)} className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Adjust</button>
                    )}
                </div>
                
                {isEditingFee ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 ml-1">Total Fee</label>
                                <input type="number" value={tempTotalFee} onChange={e => setTempTotalFee(e.target.value)} className="w-full p-4 bg-neutral-900 border border-white/10 rounded-2xl text-sm font-black text-white outline-none focus:border-blue-500" />
                           </div>
                           <div>
                                <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 ml-1">Remaining</label>
                                <input type="number" value={tempFee} onChange={e => setTempFee(e.target.value)} className="w-full p-4 bg-neutral-900 border border-white/10 rounded-2xl text-sm font-black text-white outline-none focus:border-blue-500" />
                           </div>
                        </div>
                        <div>
                             <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 ml-1">Paid Date</label>
                             <input type="date" value={tempDate} onChange={e => setTempDate(e.target.value)} className="w-full p-4 bg-neutral-900 border border-white/10 rounded-2xl text-sm font-black text-white outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                             <div className="flex gap-2">
                                <button onClick={() => setIsEditingFee(false)} className="flex-1 bg-neutral-700 text-neutral-300 text-[10px] font-black py-4 rounded-2xl uppercase">Cancel</button>
                                <button onClick={handleSaveFee} className="flex-1 bg-white text-black text-[10px] font-black py-4 rounded-2xl uppercase">Save</button>
                             </div>
                             <button onClick={handleRenewCard} className="w-full bg-blue-600/10 text-blue-400 text-[10px] font-black py-3 rounded-2xl uppercase tracking-widest">
                                Renew For Next Year
                             </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <div className={`text-4xl font-black ${annualFeeBalance <= 0 ? 'text-green-400' : 'text-white'}`}>
                                    {annualFeeBalance < 0 ? `+$${Math.abs(annualFeeBalance).toFixed(0)}` : `$${annualFeeBalance.toFixed(0)}`}
                                </div>
                                <div className="text-sm text-neutral-500 font-bold">/ ${totalAnnualFee}</div>
                            </div>
                            <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-2">Annual Fee Balance</div>
                        </div>
                        <div className="text-right">
                             <div className="text-xs font-black text-white">{lastFeeDate}</div>
                             <div className="text-[10px] text-neutral-500 font-black uppercase mt-1">Paid</div>
                        </div>
                    </div>
                )}
            </section>

            {/* Perks Inventory Section */}
            <section>
                <div className="flex justify-between items-center mb-6 px-1">
                    <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Perks Inventory</h3>
                    {!isAddingBenefit && !editingBenefitId && (
                        <button onClick={openNewBenefitForm} className="text-[10px] text-pink-500 font-black uppercase tracking-widest">+ New Perk</button>
                    )}
                </div>

                {(isAddingBenefit || editingBenefitId) && (
                    <form onSubmit={handleSaveBenefit} className="bg-neutral-800 p-6 rounded-3xl border border-white/5 mb-8 space-y-5 animate-fade-in text-white">
                        <div>
                            <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 ml-1">Name</label>
                            <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full p-4 bg-neutral-900 border border-white/10 rounded-2xl text-sm font-black text-white outline-none" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 ml-1">Max Value ($)</label>
                                <input type="number" step="0.01" value={formAmount} onChange={e => setFormAmount(e.target.value)} className="w-full p-4 bg-neutral-900 border border-white/10 rounded-2xl text-sm font-black text-white outline-none" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 ml-1">Current Balance ($)</label>
                                <input type="number" step="0.01" value={formBalance} onChange={e => setFormBalance(e.target.value)} className="w-full p-4 bg-neutral-900 border border-white/10 rounded-2xl text-sm font-black text-white outline-none" placeholder={formAmount || '0'} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 ml-1">Renewal Frequency</label>
                            <select value={formFrequency} onChange={e => setFormFrequency(e.target.value as 'monthly' | 'annually' | 'quarterly' | 'once')} className="w-full p-4 bg-neutral-900 border border-white/10 rounded-2xl text-sm font-black text-white outline-none">
                                <option value="monthly">Monthly</option>
                                <option value="annually">Annually</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="once">Once</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => {setIsAddingBenefit(false); setEditingBenefitId(null);}} className="flex-1 py-4 bg-neutral-700 text-neutral-300 text-[10px] font-black rounded-2xl uppercase">Cancel</button>
                            <button type="submit" className="flex-1 py-4 bg-pink-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-pink-500/20 uppercase">Save</button>
                        </div>
                    </form>
                )}

                <div className="space-y-4">
                    {card.benefits.length > 0 ? card.benefits.map(benefit => {
                        const balance = benefitBalances[benefit.id] ?? benefit.amount;
                        const isUsed = balance <= 0;
                        return (
                            <div key={benefit.id} className={`group flex items-center justify-between p-5 rounded-3xl bg-neutral-800 border border-white/5 transition-all ${isUsed ? 'opacity-40 grayscale' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-neutral-900 text-pink-500 text-xl">
                                        {getBenefitIcon(benefit.name)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white">{benefit.name}</div>
                                        <div className="text-[10px] font-black text-neutral-500 uppercase mt-1 tracking-widest">
                                            ${balance.toFixed(0)} / ${benefit.amount.toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    {!isUsed && (
                                        <button onClick={() => onUseBenefit(benefit.id, 0)} className="p-2.5 text-neutral-500 hover:text-green-400 bg-white/5 rounded-xl transition-colors" title="Mark as Used">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                        </button>
                                    )}
                                    <button onClick={() => startEditBenefit(benefit)} className="p-2.5 text-neutral-500 hover:text-white bg-white/5 rounded-xl transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /></svg>
                                    </button>
                                    <button onClick={() => onDeleteBenefit(card.id, benefit.id)} className="p-2.5 text-neutral-500 hover:text-red-400 bg-white/5 rounded-xl transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                        );
                    }) : <p className="text-xs text-neutral-600 italic text-center py-4">No perks logged.</p>}
                </div>
            </section>

            {/* Active Offers Section */}
            <section>
                <div className="flex justify-between items-center mb-6 px-1">
                    <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Offers</h3>
                    {!isAddingOffer && !editingOffer && (
                        <button onClick={() => {setIsAddingOffer(true); setEditingOffer(null); setIsAddingBenefit(false);}} className="text-[10px] text-amber-500 font-black uppercase tracking-widest">+ New Offer</button>
                    )}
                </div>

                {(isAddingOffer || editingOffer) && (
                  <div className="mb-8 animate-fade-in">
                    <OfferInput 
                      cards={[card]} 
                      initialOffer={editingOffer} 
                      onAddOffer={(o) => {onAddOffer(o); setIsAddingOffer(false);}}
                      onUpdateOffer={(o) => {onUpdateOffer(o); setEditingOffer(null);}} 
                      onCancel={() => {setIsAddingOffer(false); setEditingOffer(null);}} 
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {offers.length > 0 ? offers.map(offer => (
                    <div key={offer.id} className="flex items-center justify-between p-5 rounded-3xl bg-neutral-800 border border-white/5 shadow-sm group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-neutral-900 text-amber-500 text-xl">
                           {getBenefitIcon(offer.merchantName)}
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">{offer.merchantName}</div>
                          <div className="text-[10px] font-black text-neutral-500 uppercase mt-1 tracking-widest">
                            {offer.offerType === 'spend_X_get_Y' ? `$${offer.fixedReward} Back` : `${offer.percentBack}% Back`}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => onMarkOfferUsed(offer.id)} className="p-2.5 text-neutral-500 hover:text-green-400 bg-white/5 rounded-xl transition-colors" title="Mark Used">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button onClick={() => {setEditingOffer(offer); setIsAddingOffer(false); setIsAddingBenefit(false);}} className="p-2.5 text-neutral-500 hover:text-white bg-white/5 rounded-xl transition-colors" title="Edit">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /></svg>
                        </button>
                        <button onClick={() => onDeleteOffer(offer.id)} className="p-2.5 text-neutral-500 hover:text-red-400 bg-white/5 rounded-xl transition-colors" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </div>
                  )) : <p className="text-xs text-neutral-600 italic text-center py-4">No active offers for this card.</p>}
                </div>
            </section>

            {/* Transaction History Section */}
            <section>
                <div className="flex justify-between items-center mb-6 px-1">
                    <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Transaction History</h3>
                </div>
                <div className="space-y-6">
                  {transactionHistory.length > 0 ? transactionHistory.map(tx => (
                    <div key={tx.id} className="p-6 rounded-3xl bg-neutral-800/50 border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black text-white">{tx.merchantName}</div>
                          <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-0.5">
                            {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-green-400">
                            +${tx.feeOffset.toFixed(2)}
                          </div>
                          <div className="text-[9px] font-black text-neutral-600 uppercase">Total Offset</div>
                        </div>
                      </div>

                      {tx.offsetDetails && tx.offsetDetails.length > 0 && (
                        <div className="pt-4 border-t border-white/5 space-y-2">
                          {tx.offsetDetails.map((detail, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <span className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${detail.type === 'perk' ? 'bg-pink-500' : 'bg-amber-500'}`}></span>
                                <span className="text-[11px] font-bold text-neutral-400">{detail.name}</span>
                              </span>
                              <span className="text-[11px] font-black text-white">+${detail.value.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )) : <p className="text-xs text-neutral-600 italic text-center py-4">No transactions recorded.</p>}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsModal;