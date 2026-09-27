import { useState, useMemo } from 'react';
import { Search, MapPin, Carrot, Heart, ArrowRight, X, Sparkles, AlertCircle } from 'lucide-react';
import MarketCard from './MarketCard';
import { useBookmarks } from '../context/BookmarkContext';

export default function SearchResults({
  query = '',
  markets = [],
  produceList = [],
  onSelectMarket,
  onSelectProduce,
  onClearSearch,
  onNavigate
}) {
  const { isProduceFavorited, toggleFavoriteProduce } = useBookmarks();
  const [filterType, setFilterType] = useState('all');

  const results = useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    if (!q) return { markets: [], produce: [] };

    const isFruitQuery = q.includes('fruit') || q.includes('phal') || q.includes('aam') || q.includes('mango') || q.includes('apple') || q.includes('seb');
    const isVegQuery = q.includes('veg') || q.includes('sabzi') || q.includes('palak') || q.includes('tomato') || q.includes('tamatar') || q.includes('bhindi') || q.includes('okra');
    const isDairyQuery = q.includes('dairy') || q.includes('ghee') || q.includes('doodh') || q.includes('egg') || q.includes('anda') || q.includes('honey') || q.includes('shehad');

    const matchedProduce = produceList.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const catMatch = p.category.toLowerCase().includes(q);
      const descMatch = p.shortDesc.toLowerCase().includes(q);
      const seasonMatch = p.season.toLowerCase().includes(q);
      const idMatch = p.id.toLowerCase().includes(q);


      const semanticMatch =
        (isFruitQuery && p.category.toLowerCase() === 'fruits') ||
        (isVegQuery && p.category.toLowerCase() === 'vegetables') ||
        (isDairyQuery && (p.category.toLowerCase() === 'artisanal' || p.category.toLowerCase() === 'bakery'));

      return nameMatch || catMatch || descMatch || seasonMatch || idMatch || semanticMatch;
    });

    const matchingProduceIds = matchedProduce.map(p => p.id);


    const matchedMarkets = markets.filter((m) => {
      const nameMatch = m.name.toLowerCase().includes(q);
      const areaMatch = m.area.toLowerCase().includes(q);
      const addrMatch = m.address.toLowerCase().includes(q);
      const tagMatch = m.tagline?.toLowerCase().includes(q);
      const descMatch = m.description?.toLowerCase().includes(q);


      const carriesMatchedProduce = m.produceAvailable && m.produceAvailable.some(
        prodId => prodId.toLowerCase().includes(q) || matchingProduceIds.includes(prodId)
      );

      const cityMatch = q === 'karachi' && m.area.toLowerCase().includes('karachi');

      return nameMatch || areaMatch || addrMatch || tagMatch || descMatch || carriesMatchedProduce || cityMatch;
    });

    return {
      markets: matchedMarkets,
      produce: matchedProduce
    };
  }, [query, markets, produceList]);

  const totalCount = results.markets.length + results.produce.length;

  return (
    <section className="search-results-page-section">
      <div className="search-results-container">

        <div className="search-results-header-card">
          <div className="search-header-top">
            <div className="search-badge">
              <Search size={14} />
              <span>Search Results</span>
            </div>
            {query && (
              <button onClick={onClearSearch} className="btn-clear-search-pill">
                <span>Clear Search</span>
                <X size={14} />
              </button>
            )}
          </div>

          <h1 className="search-query-heading">
            Showing results for <span>"{query}"</span>
          </h1>
          <p className="search-query-sub">
            Found <strong>{results.markets.length}</strong> markets and <strong>{results.produce.length}</strong> fresh harvest items matching your query.
          </p>


          {/* Search Type Filter — Alag alag filter types clearly shown */}
          <div className="search-filter-pills">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginRight: '6px', display: 'inline-flex', alignItems: 'center' }}>
              Search Type:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`search-pill ${filterType === 'all' ? 'active' : ''}`}
            >
              🔍 All Results ({totalCount})
            </button>
            <button
              onClick={() => setFilterType('markets')}
              className={`search-pill ${filterType === 'markets' ? 'active' : ''}`}
            >
              <MapPin size={14} />
              <span>Markets Only ({results.markets.length})</span>
            </button>
            <button
              onClick={() => setFilterType('produce')}
              className={`search-pill ${filterType === 'produce' ? 'active' : ''}`}
            >
              <Carrot size={14} />
              <span>Produce Only ({results.produce.length})</span>
            </button>
          </div>
        </div>


        {(filterType === 'all' || filterType === 'markets') && (
          <div className="search-group-block">
            <div className="search-group-title-row">
              <div className="title-left">
                <MapPin size={20} className="title-icon green" />
                <h2>Matching Markets & Mandis ({results.markets.length})</h2>
              </div>
              <button
                onClick={() => onNavigate('markets')}
                className="btn-view-all-link"
              >
                <span>Full Directory</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {results.markets.length > 0 ? (
              <div className="search-markets-grid">
                {results.markets.map((market) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    onSelectMarket={onSelectMarket}
                  />
                ))}
              </div>
            ) : (
              <div className="search-empty-category">
                <AlertCircle size={28} />
                <p>No markets matched "{query}". Try checking our full directory!</p>
              </div>
            )}
          </div>
        )}

        {(filterType === 'all' || filterType === 'produce') && (
          <div className="search-group-block">
            <div className="search-group-title-row">
              <div className="title-left">
                <Carrot size={20} className="title-icon orange" />
                <h2>Matching Fresh Fruits, Veggies & Dairy ({results.produce.length})</h2>
              </div>
              <button
                onClick={() => onNavigate('produce')}
                className="btn-view-all-link"
              >
                <span>Full Product Guide</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {results.produce.length > 0 ? (
              <div className="search-produce-grid">
                {results.produce.map((produce) => {
                  const isFav = isProduceFavorited(produce.id);
                  return (
                    <div key={produce.id} className="search-produce-card">
                      <div className="search-produce-media">
                        <img src={produce.image} alt={produce.name} loading="lazy" />
                        <span className="search-produce-price">{produce.estimatedPrice}</span>
                        <button
                          onClick={() => toggleFavoriteProduce(produce.id, produce.name)}
                          className={`btn-search-fav ${isFav ? 'active' : ''}`}
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart
                            size={16}
                            fill={isFav ? '#e63946' : 'transparent'}
                            color={isFav ? '#e63946' : '#ffffff'}
                          />
                        </button>
                      </div>

                      <div className="search-produce-body">
                        <div className="search-produce-top">
                          <span className="cat-chip">{produce.category}</span>
                          <span className="season-chip">{produce.season}</span>
                        </div>

                        <h3 className="search-produce-name">
                          <span className="prod-emoji">{produce.icon}</span>
                          <span>{produce.name}</span>
                        </h3>

                        <p className="search-produce-desc">{produce.shortDesc}</p>

                        <button
                          onClick={() => onSelectProduce(produce.name || produce.id)}
                          className="btn-search-explore-prod"
                        >
                          <span>Explore Details</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="search-empty-category">
                <AlertCircle size={28} />
                <p>No specific produce matched "{query}".</p>
              </div>
            )}
          </div>
        )}

        {totalCount === 0 && (
          <div className="search-overall-empty-card">
            <Search size={48} className="empty-search-icon" />
            <h2>No Results Found for "{query}"</h2>
            <p>
              Aap ke search kiye gaye lafz se koi market ya sabzi match nahi hui.
              Popular searches try karein:
            </p>
            <div className="popular-search-chips">
              {['Empress Market', 'Clifton Sunday Bazaar', 'Sindhri Mangoes', 'Red Tomatoes', 'Super Highway Mandi', 'Desi Palak'].map((term) => (
                <button
                  key={term}
                  onClick={() => onNavigate('search', { query: term })}
                  className="pop-chip-btn"
                >
                  <Sparkles size={12} />
                  <span>{term}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => onNavigate('markets')}
              className="btn-return-directory"
            >
              Browse All Markets
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
