import type { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from '../../../../lib/redis';
import { allCards } from '../../../../data';
import type { PersistedState } from '../../../../utils/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id, txId } = req.query;
  if (typeof id !== 'string' || typeof txId !== 'string') {
    return res.status(400).json({ error: 'Invalid user or transaction ID' });
  }

  if (req.method === 'DELETE') {
    const state = await redis.get<PersistedState>(`user:${id}:state`);
    if (!state) {
      return res.status(404).json({ error: 'User state not found' });
    }

    const txIndex = state.transactionHistory.findIndex(t => t.id === txId);
    if (txIndex === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const tx = state.transactionHistory[txIndex];

    // Reverse balance changes
    for (const detail of tx.offsetDetails) {
      if (detail.type === 'perk' && detail.benefitId) {
        // Find the benefit's max amount from card definitions
        const card = allCards.find(c => c.id === tx.cardId);
        const benefit = card?.benefits.find(b => b.id === detail.benefitId);
        const maxAmount = benefit?.amount ?? Infinity;
        const current = state.benefitBalances[detail.benefitId] ?? 0;
        state.benefitBalances[detail.benefitId] = Math.min(current + detail.value, maxAmount);
      }

      if (detail.type === 'offer' && detail.offerId) {
        const offer = state.activeOffers.find(o => o.id === detail.offerId);
        if (offer) {
          offer.isUsed = false;
        }
      }
    }

    // Reverse annual fee offset
    state.annualFeeBalances[tx.cardId] = (state.annualFeeBalances[tx.cardId] ?? 0) + tx.feeOffset;

    // Remove transaction
    state.transactionHistory.splice(txIndex, 1);

    await redis.set(`user:${id}:state`, state);
    return res.status(200).json(state);
  }

  res.setHeader('Allow', 'DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
