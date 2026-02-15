import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allCards } from '../../../../data.js';
import { getRedisClient } from '../../../../lib/redis.js';
import type { PersistedState } from '../../../../utils/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id, txId } = req.query;
  console.log(`[api/users/[id]/transactions/[txId]] Handling ${req.method} request for user ${id}, tx ${txId}`);

  try {
    const redis = getRedisClient();
    
    if (typeof id !== 'string' || typeof txId !== 'string') {
      console.error('[api/users/[id]/transactions/[txId]] Invalid ID:', { id, txId });
      return res.status(400).json({ error: 'Invalid user or transaction ID' });
    }

    if (req.method === 'DELETE') {
      console.log('[api/users/[id]/transactions/[txId]] Deleting transaction:', txId);
      const state = await redis.get<PersistedState>(`user:${id}:state`);
      if (!state) {
        console.warn('[api/users/[id]/transactions/[txId]] State not found for:', id);
        return res.status(404).json({ error: 'User state not found' });
      }

      const txIndex = state.transactionHistory.findIndex(t => t.id === txId);
      if (txIndex === -1) {
        console.warn('[api/users/[id]/transactions/[txId]] Transaction not found:', txId);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const tx = state.transactionHistory[txIndex];

      // Reverse balance changes
      for (const detail of tx.offsetDetails) {
        if (detail.type === 'perk' && detail.benefitId) {
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

      state.annualFeeBalances[tx.cardId] = (state.annualFeeBalances[tx.cardId] ?? 0) + tx.feeOffset;
      state.transactionHistory.splice(txIndex, 1);

      await redis.set(`user:${id}:state`, state);
      console.log('[api/users/[id]/transactions/[txId]] Transaction deleted successfully:', txId);
      return res.status(200).json(state);
    }

    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/users/[id]/transactions/[txId]] Uncaught error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({
      error: 'Internal server error',
      message: message,
      stack: err instanceof Error ? err.stack : undefined,
    });
  }
}
