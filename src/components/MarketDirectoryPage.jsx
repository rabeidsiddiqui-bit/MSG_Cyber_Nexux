import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Store,
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  RotateCcw,
  Carrot,
  ArrowRight
} from 'lucide-react';
import MarketCard from './MarketCard';
import { getDistance, isMarketOpen } from '../utils/timeHelpers';
import { getUniversalSearchSuggestions } from '../utils/universalSearchHelper';

export default function MarketDirectoryPage({
  markets = [],
  produceList = [],
  initialFilters = {},
  onSelectMarket,
  onSelectProduce,
  onNavigate,
  userLocation
}) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || initialFilters.area || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'All');
  const [sortOption, setSortOption] = useState('rating');
  const [cardLimit, setCardLimit] = useState(6);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Suggestions starting from 1 character
  const suggestions = useMemo(() => {
    return getUniversalSearchSuggestions(searchQuery, markets, produceList);
  }, [searchQuery, markets, produceList]);

  useEffect(() => {
    if (initialFilters.category) {
      setSelectedCategory(initialFilters.category);
    }
    if (initialFilters.search || initialFilters.area) {
      setSearchQuery(initialFilters.search || initialFilters.area);
    }
  }, [initialFilters]);

  const categories = [
    { id: 'All', label: 'All Markets', count: markets.length },
    {
      id: 'Farmers Market',
      label: 'Farmers Markets',
      count: markets.filter((m) => m.category === 'Farmers Market').length
    },
    {
      id: 'Bachat Bazaar',
      label: 'Bachat Bazaars',
      count: markets.filter((m) => m.category === 'Bachat Bazaar').length
    },
    {
      id: 'Wholesale Market',
      label: 'Wholesale Markets',
      count: markets.filter(
        (m) => m.category === 'Wholesale Market' || m.category === 'Wholesale Mandi'
      ).length
    }
  ];

  const filteredMarkets = useMemo(() => {
    let result = [...markets];

    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Wholesale Market') {
        result = result.filter(
          (m) => m.category === 'Wholesale Market' || m.category === 'Wholesale Mandi'
        );
      } else {
        result = result.filter((m) => m.category === selectedCategory);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.area.toLowerCase().includes(q) ||
          m.address.toLowerCase().includes(q) ||
          (m.category && m.category.toLowerCase().includes(q)) ||
          (m.tagline && m.tagline.toLowerCase().includes(q)) ||
          (m.produceAvailable && m.produceAvailable.some((p) => p.toLowerCase().includes(q)))
      );
    }

    result.sort((a, b) => {
      if (sortOption === 'alpha-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'alpha-desc') return b.name.localeCompare(a.name);
      if (sortOption === 'rating') return b.rating - a.rating;
      if (sortOption === 'proximity') {
        const uLat = userLocation?.lat || 24.8607;
        const uLng = userLocation?.lng || 67.0011;
        const distA = a.coordinates
          ? getDistance(uLat, uLng, a.coordinates.lat, a.coordinates.lng)
          : 9999;
        const distB = b.coordinates
          ? getDistance(uLat, uLng, b.coordinates.lat, b.coordinates.lng)
          : 9999;
        return distA - distB;
      }
      return 0;
    });

    return result;
  }, [markets, selectedCategory, searchQuery, sortOption, userLocation]);

  const displayedMarkets = useMemo(() => {
    return filteredMarkets.slice(0, cardLimit);
  }, [filteredMarkets, cardLimit]);

  // Select 6 featured seasonal commodities & farm produce
  const featuredProducts = useMemo(() => {
    return (produceList || []).slice(0, 6);
  }, [produceList]);

  function resetFilters() {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortOption('rating');
  }

  function handleProductClick(product) {
    if (onSelectProduce) {
      onSelectProduce(product.id || product.name);
    } else if (onNavigate) {
      onNavigate('produce');
    }
  }

  // Count currently open markets
  const openCount = useMemo(() => {
    return markets.filter((m) => isMarketOpen(m)).length;
  }, [markets]);

  return (
    <section className="directory-page-section">
      <div className="directory-page-container">
        {/* Header Hero */}
        <div className="directory-header">
          <div className="badge-pill green">
            <Store size={14} />
            <span>Official FreshFind Directory</span>
          </div>
          <h1 className="page-heading">Market Directory</h1>
          <p className="page-lead">
            Comprehensive catalog of Karachi and Pakistan’s premier weekly bachat bazaars, organic
            farmers markets, and wholesale produce markets. Verified vendor stalls, direct farmer
            produce, and authentic schedules.
          </p>

          {/* Quick Metrics Bar */}
          <div className="dir-stats-banner">
            <div className="dir-stat-box">
              <span className="stat-num">{markets.length}</span>
              <span className="stat-lbl">Verified Markets</span>
            </div>
            <div className="dir-stat-box">
              <span className="stat-num">{openCount}</span>
              <span className="stat-lbl">Open Today</span>
            </div>
            <div className="dir-stat-box">
              <span className="stat-num">{produceList.length}+</span>
              <span className="stat-lbl">Farm Crops & Produce</span>
            </div>
            <div className="dir-stat-box">
              <span className="stat-num">100%</span>
              <span className="stat-lbl">Direct Farm Stalls</span>
            </div>
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="dir-catalog-category-bar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`dir-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              <span>{cat.label}</span>
              <span className="dir-cat-count">{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Top Control Bar: Search & Sort */}
        <div className="dir-catalog-controls">
          <div className="dir-search-autocomplete-box" ref={searchContainerRef} style={{ position: 'relative', flex: 1 }}>
            <div className="dir-catalog-search-wrap">
              <Search size={18} className="dir-catalog-search-icon" />
              <input
                type="text"
                placeholder="Search directory by market name, area, or fruit/veggie..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setIsDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsDropdownOpen(false);
                }}
                className="dir-catalog-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className="dir-search-clear"
                  title="Clear Search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {isDropdownOpen && searchQuery.trim().length >= 1 && (
              <div className="search-autocomplete-dropdown dpage-search-dropdown-menu">
                {suggestions.totalCount > 0 ? (
                  <>
                    {/* Produce */}
                    {suggestions.produce.length > 0 && (
                      <div className="autocomplete-group">
                        <div className="autocomplete-group-header">
                          <Carrot size={13} className="group-icon-produce" />
                          <span>Produce ({suggestions.produce.length}) — Click to jump to card</span>
                        </div>
                        {suggestions.produce.slice(0, 4).map((p) => (
                          <div
                            key={p.id}
                            className="autocomplete-item produce-item"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              if (onSelectProduce) onSelectProduce(p.name, p.id);
                              else if (onNavigate) onNavigate('produce', { search: p.name });
                            }}
                            title={`Jump to ${p.name}`}
                          >
                            <div className="item-main-info">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="item-thumb"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <div className="item-text">
                                <div className="item-title">
                                  <span className="item-emoji">{p.icon}</span>
                                  <strong>{p.name}</strong>
                                </div>
                                <div className="item-meta">
                                  <span className="item-pill pill-fruit">{p.category}</span>
                                  <span className="item-meta-detail">• {p.estimatedPrice}</span>
                                </div>
                              </div>
                            </div>
                            <span className="action-pill-badge jump-badge">
                              View Card →
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Markets */}
                    {suggestions.markets.length > 0 && (
                      <div className="autocomplete-group">
                        <div className="autocomplete-group-header">
                          <MapPin size={13} className="group-icon-market" />
                          <span>Markets ({suggestions.markets.length})</span>
                        </div>
                        {suggestions.markets.slice(0, 4).map((m) => (
                          <div
                            key={m.id}
                            className="autocomplete-item market-item"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              if (onSelectMarket) onSelectMarket(m.id);
                              else setSearchQuery(m.name);
                            }}
                            title={`Select ${m.name}`}
                          >
                            <div className="item-main-info">
                              <div className="item-text">
                                <div className="item-title"><strong>{m.name}</strong></div>
                                <div className="item-meta">
                                  <span className="item-area-text">📍 {m.area}</span>
                                </div>
                              </div>
                            </div>
                            <span className="action-pill-badge market-badge">View</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Areas */}
                    {suggestions.areas.length > 0 && (
                      <div className="autocomplete-group">
                        <div className="autocomplete-group-header">
                          <MapPin size={13} className="group-icon-area" />
                          <span>Areas ({suggestions.areas.length})</span>
                        </div>
                        {suggestions.areas.slice(0, 4).map((a) => (
                          <div
                            key={a}
                            className="autocomplete-item area-item"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setSearchQuery(a);
                            }}
                            title={`Filter by ${a}`}
                          >
                            <div className="item-main-info">
                              <span className="area-icon-wrap">📍</span>
                              <div className="item-text">
                                <span className="item-title"><strong>{a}</strong></span>
                              </div>
                            </div>
                            <span className="action-pill-badge area-badge">Filter</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="autocomplete-empty-state">
                    <p>No results found for "{searchQuery}".</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="dir-catalog-sort-wrap">
            <SlidersHorizontal size={15} />
            <label>Sort by:</label>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="rating">Top Rated ⭐</option>
              <option value="alpha-asc">Alphabetical (A → Z)</option>
              <option value="alpha-desc">Alphabetical (Z → A)</option>
              <option value="proximity">Closest to Me 📍</option>
            </select>
          </div>
        </div>

        {/* Active Filter Strip */}
        {(searchQuery || selectedCategory !== 'All') && (
          <div className="dir-catalog-active-strip">
            <span>Filtering by:</span>
            {selectedCategory !== 'All' && (
              <span className="dir-active-badge">
                Category: {selectedCategory}
                <X size={12} onClick={() => setSelectedCategory('All')} />
              </span>
            )}
            {searchQuery && (
              <span className="dir-active-badge">
                Search: "{searchQuery}"
                <X size={12} onClick={() => setSearchQuery('')} />
              </span>
            )}
            <button onClick={resetFilters} className="btn-dir-reset-text">
              <RotateCcw size={12} />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

        {/* Results Counter */}
        <div className="dir-catalog-counter-row">
          <p>
            Showing <strong>{displayedMarkets.length}</strong> of{' '}
            <strong>{filteredMarkets.length}</strong> verified markets
          </p>
        </div>

        {/* Directory Cards Grid */}
        {displayedMarkets.length > 0 ? (
          <>
            <div className="directory-cards-grid catalog-view">
              {displayedMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  onSelectMarket={onSelectMarket}
                />
              ))}
            </div>

            {filteredMarkets.length > 6 && (
              <div className="directory-load-more-wrap">
                <button
                  onClick={() => setCardLimit((prev) => (prev === 6 ? filteredMarkets.length : 6))}
                  className="btn-dir-load-more"
                >
                  {cardLimit === 6 ? (
                    <>
                      <span>Show All Markets ({filteredMarkets.length})</span>
                      <span className="btn-count-pill">+{filteredMarkets.length - 6} more</span>
                    </>
                  ) : (
                    <span>Show Fewer Markets (6)</span>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-results-box">
            <Store size={40} className="empty-icon" />
            <h3>No Markets in this Selection</h3>
            <p>
              We could not find any markets matching your current filter. Try selecting "All
              Markets" or clearing the search query.
            </p>
            <button onClick={resetFilters} className="btn-empty-reset">
              Show All Markets
            </button>
          </div>
        )}

        {/* SECTION: 5-6 PRODUCT CARDS AS REQUESTED */}
        <div className="dir-products-spotlight-section">
          <div className="dir-products-header">
            <div className="dir-products-title-group">
              <span className="sub-badge">
                <Carrot size={14} /> Fresh Farm Harvest
              </span>
              <h2 className="section-main-heading">Featured Market Produce & Commodities</h2>
              <p className="section-sub-text">
                Explore in-season fresh fruits, greens, and vegetables available across our verified
                network of local markets.
              </p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('produce')}
                className="btn-view-all-produce"
                title="View full produce guide"
              >
                <span>View Full Produce Guide</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>

          <div className="dir-product-cards-grid">
            {featuredProducts.map((p) => {
              const marketCount = p.markets ? p.markets.length : 0;
              return (
                <div
                  key={p.id}
                  className="dir-product-card"
                  onClick={() => handleProductClick(p)}
                  title={`View details for ${p.name}`}
                >
                  <div className="dir-product-image-box">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="dir-product-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/produce-farm-tomatoes.jpg';
                      }}
                    />
                    <span className="dir-product-cat-pill">{p.category}</span>
                    <span className="dir-product-season-pill">{p.season}</span>
                  </div>

                  <div className="dir-product-body">
                    <div className="dir-product-header-line">
                      <h3 className="dir-product-name">
                        <span className="dir-product-emoji">{p.icon}</span> {p.name}
                      </h3>
                    </div>

                    <p className="dir-product-desc">{p.shortDesc}</p>

                    <div className="dir-product-meta-row">
                      <div className="dir-product-price-box">
                        <span className="dir-price-label">Estimated Rate:</span>
                        <span className="dir-product-price">{p.estimatedPrice}</span>
                      </div>
                      <span className="dir-market-stock-badge">
                        <MapPin size={12} />
                        <span>{marketCount} Markets</span>
                      </span>
                    </div>

                    <div className="dir-product-card-footer">
                      <button className="dir-product-explore-btn">
                        <span>Check Availability</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
