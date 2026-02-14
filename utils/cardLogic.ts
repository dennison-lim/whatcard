import { CreditCard, UserOffer } from '../types';

export interface CardValueResult {
  totalValue: number;
  breakdown: {
    points: number;
    benefits: number;
    offers: number;
    benefitDetails: { benefitId: string; usedAmount: number }[];
  };
  meta: {
    pointsEarned: number;
    matchedCategory: string;
    multiplier: number;
    matchedOfferNames: string[];
    matchedOfferIds: string[];
    matchedBenefitNames: string[];
    matchedBenefitIds: string[];
  }
}

const POINT_VALUES: Record<string, number> = {
  'MR': 0.02,
  'UR': 0.0205,
  'USD': 0.01, // Changed from 1.0 to 0.01 so 1.5x multiplier = 1.5% cashback
};

const KEYWORDS = {
    AIRLINES: ['delta', 'united', 'american', 'aa.com', 'southwest', 'jetblue', 'alaska', 'british', 'virgin', 'emirates', 'lufthansa', 'air france', 'klm', 'qantas', 'spirit', 'frontier', 'fly'],
    HOTELS: ['marriott', 'hilton', 'hyatt', 'ihg', 'sheraton', 'westin', 'choice', 'best western', 'wyndham', 'airbnb', 'vrbo', 'booking', 'expedia', 'hotels.com'],
    ONLINE_GROCERY: ['instacart', 'freshdirect', 'amazon fresh', 'peapod', 'shipt', 'hellofresh', 'blue apron', 'kroger pay', 'walmart+'],
    DRUGSTORE: ['cvs', 'walgreens', 'rite aid', 'duane reade', 'pharmacy']
};

export function calculateCardValue(
  transactionAmount: number,
  merchantName: string,
  category: string,
  card: CreditCard,
  activeOffers: UserOffer[],
  benefitBalances: Record<string, number>,
  selectedBenefitName: string = ''
): CardValueResult {
  const normalizedMerchant = merchantName.toLowerCase();
  const normalizedCategory = category.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- 1. Benefits Logic ---
  let benefitsValue = 0;
  let coveredAmount = 0;
  const matchedBenefitNames: string[] = [];
  const matchedBenefitIds: string[] = [];
  const benefitDetails: { benefitId: string; usedAmount: number }[] = [];

  for (const benefit of card.benefits) {
    // Check Expiration
    if (benefit.expirationDate) {
      const expDate = new Date(benefit.expirationDate);
      if (expDate < today) continue;
    }

    const remainingBalance = benefitBalances[benefit.id] ?? 0;
    if (remainingBalance <= 0) continue;

    let isMatch = false;
    if (selectedBenefitName && benefit.name === selectedBenefitName) {
        isMatch = true;
    } else if (!selectedBenefitName) {
        const isNameMatch = benefit.merchantFilter.some(filter => 
            normalizedMerchant.includes(filter.toLowerCase())
        );
        const isCategoryBenefitMatch = (benefit.name.includes('Travel') && ['travel', 'flights', 'hotels'].includes(normalizedCategory));
        
        if (isNameMatch || isCategoryBenefitMatch) {
            isMatch = true;
        }
    }

    if (isMatch) {
       const val = Math.min(transactionAmount, remainingBalance);
       benefitsValue += val;
       if (benefit.type === 'credit') {
           coveredAmount += val;
       }
       matchedBenefitNames.push(benefit.name);
       matchedBenefitIds.push(benefit.id);
       benefitDetails.push({ benefitId: benefit.id, usedAmount: val });
    }
  }

  coveredAmount = Math.min(coveredAmount, transactionAmount);

  // --- 2. Points Logic ---
  const taxableAmountForPoints = Math.max(0, transactionAmount - coveredAmount);
  let bestMultiplier = 0;
  let matchedCategory = 'Other';
  let currency: string = 'USD';

  const baseCat = card.baseBonusCategories.find(c => c.name === 'Other');
  if (baseCat) {
    bestMultiplier = baseCat.multiplier;
    currency = baseCat.currency;
  } else {
    bestMultiplier = 1.0; 
    currency = card.issuer === 'Amex' ? 'MR' : 'UR';
  }

  for (const cat of card.baseBonusCategories) {
    if (cat.name === 'Other') continue;
    if (isCategoryMatch(normalizedCategory, cat.name, normalizedMerchant)) {
      if (cat.multiplier > bestMultiplier) {
        bestMultiplier = cat.multiplier;
        matchedCategory = cat.name;
        currency = cat.currency;
      }
    }
  }

  const pointsEarned = taxableAmountForPoints * bestMultiplier;
  const pointValuePerUnit = POINT_VALUES[currency] || 0.01;
  const pointsValue = pointsEarned * pointValuePerUnit;

  // --- 3. Offers Logic ---
  let offersValue = 0;
  const matchedOfferNames: string[] = [];
  const matchedOfferIds: string[] = [];
  const cardOffers = activeOffers.filter(o => o.cardId === card.id);
  
  for (const offer of cardOffers) {
    if (normalizedMerchant.includes(offer.merchantName.toLowerCase())) {
      let applies = false;
      let reward = 0;

      if (offer.offerType === 'spend_X_get_Y') {
        if (transactionAmount >= (offer.minSpend || 0)) {
          applies = true;
          reward = offer.fixedReward || 0;
        }
      } else if (offer.offerType === 'percent_back') {
        applies = true;
        reward = transactionAmount * ((offer.percentBack || 0) / 100);
        if (offer.maxReward && reward > offer.maxReward) {
          reward = offer.maxReward;
        }
      }

      if (applies) {
        offersValue += reward;
        matchedOfferNames.push(offer.merchantName);
        matchedOfferIds.push(offer.id);
      }
    }
  }

  return {
    totalValue: pointsValue + benefitsValue + offersValue,
    breakdown: {
      points: pointsValue,
      benefits: benefitsValue,
      offers: offersValue,
      benefitDetails
    },
    meta: {
      pointsEarned,
      matchedCategory,
      multiplier: bestMultiplier,
      matchedOfferNames,
      matchedOfferIds,
      matchedBenefitNames,
      matchedBenefitIds
    }
  };
}

function isCategoryMatch(detectedCategory: string, cardCategoryName: string, merchantName: string = ''): boolean {
    const dc = detectedCategory.toLowerCase();
    const cc = cardCategoryName.toLowerCase();
    const merch = merchantName.toLowerCase();
    if (dc === cc) return true;
    if ((dc === 'dining' || dc === 'restaurants') && (cc === 'dining' || cc === 'restaurants')) return true;
    const isUserGrocery = dc === 'groceries' || dc === 'supermarkets';
    const isCardGrocery = cc === 'groceries' || cc === 'supermarkets';
    if (isUserGrocery) {
        if (isCardGrocery) return true;
        if (cc === 'online grocery') {
             return KEYWORDS.ONLINE_GROCERY.some(k => merch.includes(k));
        }
    }
    if (dc === 'travel') {
        if (cc === 'travel') return true;
        if (cc === 'lyft' && merch.includes('lyft')) return true;
        if (cc === 'flights') return KEYWORDS.AIRLINES.some(k => merch.includes(k));
        if (cc === 'hotels') return KEYWORDS.HOTELS.some(k => merch.includes(k));
        if (cc === 'chase hotels') return merch.includes('chase travel') || merch.includes('chase.com/travel');
    }
    if (dc === 'drugstore' && cc === 'drugstore') return true;
    if (dc === 'streaming' && cc === 'streaming') return true;
    if (dc === 'gas' && (cc === 'gas' || cc === 'gas stations')) return true;
    return false;
}