import type { CreditCard, UserOffer, TransactionRecord } from '../types';

const STORAGE_KEY = 'whatcard_app_state';

const CURRENT_VERSION = 1;

export interface PersistedState {
  version?: number;
  cards: CreditCard[];
  activeCardIds: string[];
  activeOffers: UserOffer[];
  transactionHistory: TransactionRecord[];
  benefitBalances: Record<string, number>;
  customAnnualFees: Record<string, number>;
  annualFeeBalances: Record<string, number>;
  annualFeeDates: Record<string, string>;
}

function isPersistedState(value: unknown): value is PersistedState {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    Array.isArray(o.cards) &&
    Array.isArray(o.activeCardIds) &&
    Array.isArray(o.activeOffers) &&
    Array.isArray(o.transactionHistory) &&
    typeof o.benefitBalances === 'object' &&
    o.benefitBalances !== null &&
    typeof o.customAnnualFees === 'object' &&
    o.customAnnualFees !== null &&
    typeof o.annualFeeBalances === 'object' &&
    o.annualFeeBalances !== null &&
    typeof o.annualFeeDates === 'object' &&
    o.annualFeeDates !== null
  );
}

/**
 * Load persisted state from localStorage. Returns null if missing, invalid, or on error (e.g. private mode).
 */
export function getStoredState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isPersistedState(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save state to localStorage. Logs on failure but does not throw (e.g. quota exceeded).
 */
export function setStoredState(state: PersistedState): void {
  try {
    const payload: PersistedState = { ...state, version: CURRENT_VERSION };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('WhatCard: failed to persist state', e);
  }
}

/**
 * Clear persisted state (e.g. for "Reset to fresh state"). Reload the app after calling to apply.
 */
export function clearStoredState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
