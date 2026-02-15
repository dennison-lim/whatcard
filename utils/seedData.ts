import { allCards, sampleOffers } from '../data.js';
import { UserOffer, TransactionRecord } from '../types';
import type { PersistedState } from './storage';

/**
 * Generate default persisted state with all cards active and all sample offers.
 * Used as a baseline and for mergeWithDefaults.
 */
export function getDefaultPersistedState(): PersistedState {
  const defaultBenefitBalances: Record<string, number> = {};
  allCards.forEach(card => card.benefits.forEach(b => { defaultBenefitBalances[b.id] = b.amount; }));
  const defaultFeeBalances: Record<string, number> = {};
  allCards.forEach(c => defaultFeeBalances[c.id] = c.annualFee);
  const mockDate = new Date();
  mockDate.setMonth(mockDate.getMonth() - 2);
  const dateStr = mockDate.toISOString().split('T')[0];
  const defaultFeeDates: Record<string, string> = {};
  allCards.forEach(c => defaultFeeDates[c.id] = dateStr);
  return {
    cards: allCards,
    activeCardIds: allCards.map(c => c.id),
    activeOffers: sampleOffers,
    transactionHistory: [] as TransactionRecord[],
    benefitBalances: defaultBenefitBalances,
    customAnnualFees: {} as Record<string, number>,
    annualFeeBalances: defaultFeeBalances,
    annualFeeDates: defaultFeeDates,
  };
}

/** Merge stored state with defaults so new cards/benefits from data.ts get default balances/dates. */
export function mergeWithDefaults(stored: PersistedState): PersistedState {
  const defaults = getDefaultPersistedState();
  return {
    ...stored,
    benefitBalances: { ...defaults.benefitBalances, ...stored.benefitBalances },
    annualFeeBalances: { ...defaults.annualFeeBalances, ...stored.annualFeeBalances },
    annualFeeDates: { ...defaults.annualFeeDates, ...stored.annualFeeDates },
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a randomized seed state for a new user.
 * - All 5 cards included, but 3–5 randomly marked active
 * - Random subset of 2–3 sample offers, assigned to random active cards
 * - Expiration dates randomized within ±30 days of original
 * - Empty transaction history
 */
export function generateSeedState(): PersistedState {
  const base = getDefaultPersistedState();

  // Random active cards: 3–5 of 5
  const numActive = randomInt(3, Math.min(5, allCards.length));
  const shuffledCardIds = shuffleArray(allCards.map(c => c.id));
  const activeCardIds = shuffledCardIds.slice(0, numActive);

  // Random offers: 2–3 of available sample offers, assigned to random active cards
  const numOffers = randomInt(2, Math.min(3, sampleOffers.length));
  const shuffledOffers = shuffleArray(sampleOffers);
  const selectedOffers: UserOffer[] = shuffledOffers.slice(0, numOffers).map((offer, idx) => {
    const assignedCardId = activeCardIds[idx % activeCardIds.length];

    // Randomize expiration ±30 days from original
    let expirationDate = offer.expirationDate;
    if (expirationDate) {
      const d = new Date(expirationDate);
      d.setDate(d.getDate() + randomInt(-30, 30));
      expirationDate = d.toISOString().split('T')[0];
    }

    return {
      ...offer,
      id: `${offer.id}-${Date.now()}-${idx}`,
      cardId: assignedCardId,
      expirationDate,
      isUsed: false,
    };
  });

  return {
    ...base,
    activeCardIds,
    activeOffers: selectedOffers,
    transactionHistory: [],
  };
}
