import { matchesProduceQuery, isProduceFocusedQuery } from './produceAliases';

/**
 * Universal search suggestions helper across all search bars:
 * Hero, Navbar, MarketSearchFilterBar, ProduceGuide, MarketDirectory.
 * Matches starting from 1 character query.
 */
export function getUniversalSearchSuggestions(query, markets = [], produceList = []) {
  if (!query || !query.trim()) {
    return {
      produce: [],
      markets: [],
      areas: [],
      totalCount: 0,
      isProduceFocused: false
    };
  }

  const q = query.trim().toLowerCase();

  // 1. Matching Produce (Fruits, Veggies, Artisanal)
  const matchedProduce = produceList.filter((p) => matchesProduceQuery(p, q));
  const matchingProduceIds = matchedProduce.map((p) => p.id);

  // 2. Matching Markets (by name, area, address, tagline, description, category, or produce carried)
  const matchedMarkets = markets.filter((m) => {
    const nameMatch = m.name && m.name.toLowerCase().includes(q);
    const areaMatch = m.area && m.area.toLowerCase().includes(q);
    const addrMatch = m.address && m.address.toLowerCase().includes(q);
    const tagMatch = m.tagline && m.tagline.toLowerCase().includes(q);
    const catMatch = m.category && m.category.toLowerCase().includes(q);
    const carriesMatchedProduce =
      m.produceAvailable &&
      m.produceAvailable.some((pId) => pId.toLowerCase().includes(q) || matchingProduceIds.includes(pId));
    return nameMatch || areaMatch || addrMatch || tagMatch || catMatch || carriesMatchedProduce;
  });

  // 3. Matching Areas (e.g. Clifton, Saddar, DHA, Gulshan, Malir, Super Highway, Old Town, Lahore, Islamabad)
  const allAreas = Array.from(new Set(markets.map((m) => m.area).filter(Boolean)));
  const matchedAreas = allAreas.filter((area) => area.toLowerCase().includes(q));

  const totalCount = matchedProduce.length + matchedMarkets.length + matchedAreas.length;

  return {
    produce: matchedProduce,
    markets: matchedMarkets,
    areas: matchedAreas,
    totalCount,
    isProduceFocused: isProduceFocusedQuery(q)
  };
}
