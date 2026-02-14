// Client-side keyword mapping for merchant → category and benefit icons

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Dining': ['chipotle', 'starbucks', 'mcdonald', 'burger', 'grill', 'cafe', 'coffee', 'bistro', 'steak', 'pizza', 'sushi', 'taco', 'eats', 'grubhub', 'doordash', 'resy', 'sweetgreen', 'shake shack', 'dunkin'],
    'Travel': ['uber', 'lyft', 'delta', 'united', 'american air', 'jetblue', 'southwest', 'hotel', 'airbnb', 'expedia', 'booking.com', 'train', 'amtrak', 'hertz', 'avis', 'marriott', 'hilton', 'hyatt'],
    'Groceries': ['whole foods', 'trader joe', 'safeway', 'kroger', 'publix', 'wegmans', 'walmart', 'target', 'aldi', 'costco', 'market', 'foods'],
    'Drugstore': ['cvs', 'walgreens', 'rite aid', 'duane reade', 'pharmacy', 'chemist', 'boots'],
    'Gas': ['shell', 'chevron', 'exxon', 'mobil', 'bp', 'wawa', '7-eleven', 'arco', 'texaco', 'fuel', 'gas'],
    'Streaming': ['netflix', 'hulu', 'spotify', 'disney', 'hbo', 'youtube', 'apple', 'peacock', 'paramount', 'music'],
    'Shopping': ['amazon', 'apple store', 'best buy', 'nike', 'adidas', 'gap', 'zara', 'h&m', 'uniqlo', 'sephora', 'saks', 'nordstrom', 'bloomingdale'],
  };
  
  export function guessCategory(merchantName: string): string | null {
    const normalized = merchantName.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(k => normalized.includes(k))) {
        return category;
      }
    }
    
    return null;
  }
  
  export function getBenefitIcon(benefitName: string): string {
    const lower = benefitName.toLowerCase();
    if (lower.includes('uber') || lower.includes('lyft') || lower.includes('travel')) return '🚗';
    if (lower.includes('dining') || lower.includes('resy') || lower.includes('food')) return '🍽️';
    if (lower.includes('saks') || lower.includes('shop')) return '🛍️';
    if (lower.includes('digital') || lower.includes('stream')) return '📺';
    if (lower.includes('hotel')) return '🏨';
    if (lower.includes('flight') || lower.includes('airline')) return '✈️';
    return '✨'; // Default star
  }

  export function getCategoryForBenefit(benefitName: string): string {
      const lower = benefitName.toLowerCase();
      if (lower.includes('dining') || lower.includes('resy') || lower.includes('grubhub')) return 'Dining';
      if (lower.includes('uber') || lower.includes('lyft') || lower.includes('travel') || lower.includes('hotel') || lower.includes('flight')) return 'Travel';
      if (lower.includes('saks')) return 'Shopping';
      if (lower.includes('digital') || lower.includes('stream')) return 'Streaming';
      return 'Other';
  }