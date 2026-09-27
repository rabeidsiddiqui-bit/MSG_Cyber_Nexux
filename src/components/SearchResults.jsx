import { useState, useMemo } from 'react';
import { Search, MapPin, Carrot, Heart, ArrowRight, X, Sparkles, AlertCircle } from 'lucide-react';
import MarketCard from './MarketCard';
import { useBookmarks } from '../context/BookmarkContext';
import { matchesProduceQuery, isProduceFocusedQuery } from '../utils/produceAliases';

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
    if (!q) return { markets: [], produce: [], isProduceFocused: false };

    const matchedProduce = produceList.filter((p) => matchesProduceQuery(p, q));
    const matchingProduceIds = matchedProduce.map(p => p.id);

    const matchedMarkets = markets.filter((m) => {
      const nameMatch = m.name.toLowerCase().includes(q);
      const areaMatch = m.area.toLowerCase().includes(q);
      const addrMatch = m.address.toLowerCase().includes(q);
      const tagMatch = m.tagline?.toLowerCase().includes(q);
      const descMatch = m.description?.toLowerCase().includes(q);
      const catMatch = m.category?.toLowerCase().includes(q);

      const carriesMatchedProduce = m.produceAvailable && m.produceAvailable.some(
        prodId => prodId.toLowerCase().includes(q) || matchingProduceIds.includes(prodId)
      );

      const cityMatch = q === 'karachi' && m.area.toLowerCase().includes('karachi');

      return nameMatch || areaMatch || addrMatch || tagMatch || descMatch || catMatch || carriesMatchedProduce || cityMatch;
    });

    const isProduceFocused = isProduceFocusedQuery(q) || (matchedProduce.length > 0 && matchedMarkets.length === 0);

    return {
      markets: matchedMarkets,
      produce: matchedProduce,
      isProduceFocused
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


        {/* Produce Results Block */}
        {(filterType === 'all' || filterType === 'produce') && results.isProduceFocused && (
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
                          onClick={() => onSelectProduce(produce.name || produce.id, produce.id)}
                          className="btn-search-explore-prod"
                          title={`Jump to ${produce.name} card in Product Guide`}
                        >
                          <span>View Produce Card</span>
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

        {/* Markets Results Block */}
        {(filterType === 'all' || filterType === 'markets') && (
          <div className="search-group-block">
            <div className="search-group-title-row">
              <div className="title-left">
                <MapPin size={20} className="title-icon green" />
                <h2>Matching Markets ({results.markets.length})</h2>
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

        {/* Produce Results Block (if NOT isProduceFocused) */}
        {(filterType === 'all' || filterType === 'produce') && !results.isProduceFocused && (
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
                          onClick={() => onSelectProduce(produce.name || produce.id, produce.id)}
                          className="btn-search-explore-prod"
                          title={`Jump to ${produce.name} card in Product Guide`}
                        >
                          <span>View Produce Card</span>
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
              No markets or fresh produce matched your search keyword.
              Try one of these popular searches:
            </p>
            <div className="popular-search-chips">
              {['Empress Market', 'Clifton Sunday Bazaar', 'Sindhri Mangoes', 'Red Tomatoes', 'Super Highway Market', 'Desi Palak'].map((term) => (
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
