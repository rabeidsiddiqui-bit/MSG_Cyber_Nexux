/**
 * Produce Aliases and Semantic Matcher for Pakistani Produce Catalog
 * Supports English, Roman Urdu, and colloquial names for instant search & jump-to-card
 */

export const PRODUCE_KEYWORDS = {
  'sindhri-mangoes': [
    'mango', 'mangoes', 'mangos', 'sindhri', 'sindhri mango', 'sindhri mangoes',
    'aam', 'aamoon', 'sweet mango', 'queen of mangoes', 'mirpurkhas', 'summer fruit'
  ],
  'chaunsa-mangoes': [
    'mango', 'mangoes', 'mangos', 'chaunsa', 'chaunsa mango', 'chaunsa mangoes',
    'chonsa', 'multani chaunsa', 'white chaunsa', 'aam', 'honeyed mango', 'multan'
  ],
  'farm-tomatoes': [
    'tomato', 'tomatoes', 'tomatos', 'tamatar', 'tamator', 'red tomatoes', 'farm tomatoes',
    'badin tomatoes', 'thatta', 'salads', 'sabzi'
  ],
  'desi-palak': [
    'spinach', 'palak', 'paalak', 'desi palak', 'saag', 'spinach leaves',
    'green leafy', 'malir palak', 'iron rich', 'greens', 'sabzi'
  ],
  'swat-apples': [
    'apple', 'apples', 'seb', 'saib', 'swat apples', 'crisp apples',
    'golden apples', 'swat valley fruit', 'mountain apples'
  ],
  'okra-bhindi': [
    'okra', 'bhindi', 'bhendi', 'ladyfinger', 'lady finger', 'crisp okra',
    'bhindi sabzi', 'green okra', 'sabzi'
  ],
  'green-chillies': [
    'chilli', 'chillies', 'chili', 'chilies', 'green chilli', 'green chillies',
    'mirch', 'hari mirch', 'spicy chillies', 'malir chillies', 'sabzi'
  ],
  'fresh-guava': [
    'guava', 'guavas', 'amrood', 'amrud', 'larkana guava', 'sweet guava',
    'pink guava', 'white guava', 'winter fruit'
  ],
  'kinnow-oranges': [
    'orange', 'oranges', 'kinnow', 'kinno', 'kinnu', 'malta', 'sangtara',
    'citrus', 'sargodha kinnow', 'winter fruit'
  ],
  'pure-desi-ghee': [
    'ghee', 'desi ghee', 'makhan', 'butter', 'clarified butter', 'desi butter',
    'bilona ghee', 'buffalo milk ghee', 'dairy'
  ],
  'desi-eggs': [
    'egg', 'eggs', 'anda', 'anday', 'desi anda', 'desi anday',
    'free range eggs', 'organic eggs', 'aseel eggs', 'dairy'
  ],
  'wild-honey': [
    'honey', 'shehad', 'shahed', 'raw honey', 'berry honey', 'sidr honey',
    'beri honey', 'margalla honey', 'pure honey', 'pantry'
  ],
  'organic-strawberries': [
    'strawberry', 'strawberries', 'strawbery', 'berry', 'berries',
    'swat strawberries', 'organic strawberries', 'spring fruit'
  ],
  'crisp-kale': [
    'kale', 'tuscan kale', 'organic kale', 'salad leaves', 'hydroponic kale',
    'dinosaur kale', 'leafy greens', 'greens', 'sabzi'
  ],
  'fresh-sourdough': [
    'sourdough', 'bread', 'roti', 'double roti', 'artisan bread',
    'desi wheat', 'chakki atta', 'bakery'
  ]
};

/**
 * Checks if a produce item matches a search query
 */
export function matchesProduceQuery(produceItem, query) {
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();

  let qSingular = q;
  if (q.endsWith('es')) qSingular = q.slice(0, -2);
  else if (q.endsWith('s') && !q.endsWith('ss')) qSingular = q.slice(0, -1);

  // 1. Direct name / category / description / season match
  if (
    produceItem.name.toLowerCase().includes(q) ||
    produceItem.name.toLowerCase().includes(qSingular) ||
    produceItem.category.toLowerCase().includes(q) ||
    (produceItem.season && produceItem.season.toLowerCase().includes(q)) ||
    (produceItem.shortDesc && produceItem.shortDesc.toLowerCase().includes(q)) ||
    (produceItem.healthBenefits && produceItem.healthBenefits.toLowerCase().includes(q)) ||
    (produceItem.id && (produceItem.id.toLowerCase().includes(q) || produceItem.id.toLowerCase().includes(qSingular)))
  ) {
    return true;
  }

  // 2. Category synonyms
  const isFruitQuery = ['fruit', 'fruits', 'phal', 'meetha'].some(k => q.includes(k) || k.includes(q));
  if (isFruitQuery && produceItem.category.toLowerCase() === 'fruits') return true;

  const isVegQuery = ['veg', 'vegetable', 'vegetables', 'veggies', 'sabzi', 'sabziyan', 'tarkari'].some(k => q.includes(k) || k.includes(q));
  if (isVegQuery && produceItem.category.toLowerCase() === 'vegetables') return true;

  const isArtisanalQuery = ['dairy', 'pantry', 'artisanal', 'bakery'].some(k => q.includes(k) || k.includes(q));
  if (isArtisanalQuery && (produceItem.category.toLowerCase() === 'artisanal' || produceItem.category.toLowerCase() === 'bakery')) return true;

  // 3. Keyword / alias matches
  const aliases = PRODUCE_KEYWORDS[produceItem.id] || [];
  return aliases.some(alias => alias.includes(q) || q.includes(alias) || alias.includes(qSingular) || qSingular.includes(alias));
}

/**
 * Checks if a query is primarily searching for produce (fruits/vegetables/dairy)
 */
export function isProduceFocusedQuery(query) {
  if (!query || !query.trim()) return false;
  const q = query.toLowerCase().trim();

  const produceGeneralWords = [
    'fruit', 'fruits', 'phal', 'veg', 'vegetable', 'vegetables', 'veggies', 'sabzi', 'sabziyan',
    'mango', 'mangoes', 'mangos', 'aam', 'chaunsa', 'sindhri',
    'tomato', 'tomatoes', 'tamatar', 'palak', 'spinach', 'saag',
    'apple', 'apples', 'seb', 'okra', 'bhindi', 'ladyfinger',
    'chilli', 'chillies', 'mirch', 'guava', 'amrood',
    'orange', 'oranges', 'kinnow', 'malta', 'strawberry', 'strawberries',
    'kale', 'ghee', 'makhan', 'egg', 'eggs', 'anda', 'anday', 'honey', 'shehad', 'sourdough'
  ];

  return produceGeneralWords.some(w => q.includes(w) || w.includes(q));
}
