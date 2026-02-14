import { CreditCard, UserOffer, RecommendationResult } from '../types';
import { calculateCardValue } from './cardLogic';

export function calculateBestCards(
  cards: CreditCard[],
  offers: UserOffer[],
  merchant: string,
  amount: number,
  category: string,
  benefitBalances: Record<string, number>,
  selectedBenefitName: string = ''
): RecommendationResult[] {
  
  const results: RecommendationResult[] = cards.map(card => {
    // Use the stacking logic
    const { totalValue, breakdown, meta } = calculateCardValue(
      amount,
      merchant,
      category,
      card,
      offers,
      benefitBalances,
      selectedBenefitName
    );

    // Build detailed offer usage for history
    const offerDetails = meta.matchedOfferIds.map((id, index) => ({
      offerId: id,
      offerName: meta.matchedOfferNames[index],
      usedAmount: 0 // In stacking logic, we'd need to compute exact contribution if complex
    }));

    return {
      card,
      totalValue,
      breakdown: {
        pointsValue: breakdown.points,
        pointsEarned: meta.pointsEarned,
        benefitsValue: breakdown.benefits,
        offersValue: breakdown.offers,
        matchedCategory: meta.matchedCategory,
        matchedBenefitNames: meta.matchedBenefitNames,
        matchedOfferNames: meta.matchedOfferNames,
        matchedOfferIds: meta.matchedOfferIds,
        matchedBenefitIds: meta.matchedBenefitIds,
        benefitDetails: breakdown.benefitDetails,
        offerDetails: offerDetails.map(d => ({
          ...d,
          usedAmount: meta.matchedOfferIds.length > 0 ? breakdown.offers / meta.matchedOfferIds.length : 0
        }))
      }
    };
  });

  // Sort by highest total value
  return results.sort((a, b) => b.totalValue - a.totalValue);
}