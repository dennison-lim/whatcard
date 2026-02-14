export type Currency = 'USD' | 'MR' | 'UR';

export interface BonusCategory {
  id: string;
  name: string; // e.g., 'Dining', 'Travel', 'Supermarkets'
  multiplier: number; // e.g., 3.0
  currency: Currency;
  capAmount?: number; // Optional annual limit
}

export interface CardBenefit {
  id: string;
  name: string; // e.g., 'Uber Cash', 'Saks Credit'
  merchantFilter: string[]; // Strings to match against merchant names
  amount: number; // Value in USD
  frequency: 'monthly' | 'annually' | 'quarterly' | 'once';
  type: 'credit';
  expirationDate?: string; // Optional ISO date string
}

export interface BenefitUsage {
  id: string;
  benefitId: string;
  cardId: string;
  dateUsed: string; // ISO String
}

export interface CreditCard {
  id: string;
  name: string;
  issuer: 'Amex' | 'Chase';
  annualFee: number;
  baseBonusCategories: BonusCategory[];
  benefits: CardBenefit[];
  imageColor: string; // For UI styling
}

export interface UserOffer {
  id: string;
  cardId: string;
  merchantName: string;
  offerType: 'spend_X_get_Y' | 'percent_back';
  minSpend?: number;
  fixedReward?: number;
  percentBack?: number;
  maxReward?: number; // Max cashback amount for percent_back offers
  expirationDate?: string; // Optional
  isUsed?: boolean; // Tracks if offer has been redeemed/used
}

export interface TransactionOffsetDetail {
  name: string;
  type: 'perk' | 'offer';
  value: number;
}

export interface TransactionRecord {
  id: string;
  cardId: string;
  merchantName: string;
  date: string;
  amount: number;
  feeOffset: number; // Portion of perks/offers applied to annual fee
  offsetDetails: TransactionOffsetDetail[]; // Details of specific perks/offers used
}

export interface RecommendationResult {
  card: CreditCard;
  totalValue: number;
  breakdown: {
    pointsValue: number;
    pointsEarned: number;
    benefitsValue: number;
    offersValue: number;
    matchedCategory?: string;
    matchedOfferNames: string[];
    matchedOfferIds: string[];
    matchedBenefitNames: string[];
    matchedBenefitIds: string[];
    // Detailed breakdown for "Use This Card" logic
    benefitDetails: { benefitId: string; usedAmount: number }[];
    offerDetails: { offerId: string; offerName: string; usedAmount: number }[];
  };
}