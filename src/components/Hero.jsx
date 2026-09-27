import { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Calendar, Carrot, ArrowRight, ShieldCheck, HeartHandshake, Leaf, Sparkles, Search, X } from 'lucide-react';
import { days } from '../utils/timeHelpers';
import { getUniversalSearchSuggestions } from '../utils/universalSearchHelper';
import { isProduceFocusedQuery } from '../utils/produceAliases';

export default function Hero({
  markets = [],
  produceList = [],
  onSelectMarket,
  onSelectProduce,
  onSearch,
  onQuickSearch,
  onExploreProduce,
  onExploreSeasonal
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [day, setDay] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const searchContainerRef = useRef(null);

  const karachiAreas = [
    'Saddar, Karachi',
    'Clifton, Karachi',
    'Super Highway, Karachi',
    'DHA Phase 8, Karachi',
    'Gulshan-e-Iqbal, Karachi',
    'Old Town, Karachi',
    'Liaquatabad, Karachi',
    'Model Town, Lahore',
    'Sector H-9, Islamabad'
  ];

  // Universal search suggestions starting from 1 character
  const suggestions = useMemo(() => {
    return getUniversalSearchSuggestions(searchTerm, markets, produceList);
  }, [searchTerm, markets, produceList]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleProduceClick(produceItem) {
    setIsDropdownOpen(false);
    setSearchTerm(produceItem.name);
    if (onSelectProduce) {
      onSelectProduce(produceItem.name, produceItem.id);
    } else if (onExploreProduce) {
      onExploreProduce();
    }
  }

  function handleMarketClick(market) {
    setIsDropdownOpen(false);
    setSearchTerm(market.name);
    if (onSelectMarket) {
      onSelectMarket(market.id);
    } else if (onSearch) {
      onSearch(market.name);
    }
  }

  function handleAreaClick(areaName) {
    setIsDropdownOpen(false);
    setArea(areaName);
    if (onQuickSearch) {
      onQuickSearch({ area: areaName });
    }
  }

  function handleSearchSubmit(e) {
    if (e) e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    setIsDropdownOpen(false);

    // If directly searching for a fruit or vegetable, jump straight to the produce card!
    if (isProduceFocusedQuery(query) || suggestions.isProduceFocused) {
      if (onSelectProduce) {
        onSelectProduce(query);
        return;
      }
    }

    if (onSearch) {
      onSearch(query);
    } else if (onQuickSearch) {
      onQuickSearch({ search: query });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onQuickSearch({
      search: searchTerm.trim() || undefined,
      area: area,
      day: day,
      category: category
    });
  }

  return (
    <section className="hero-section">

      <div className="hero-bg-overlay"></div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <Leaf size={14} className="badge-leaf" />
            <span>Pakistan’s #1 Farmers Market Network</span>
          </div>

          <h1 className="hero-title">
            Fresh From Pakistani Farms <br />
            <span>To Your Kitchen Table</span>
          </h1>

          <p className="hero-description">
            Discover Karachi and Pakistan’s premier farmers markets, weekly bachat bazaars, and wholesale sabzi markets.
            Track real-time operating hours, compare daily market rates, and support 350+ local growers directly.
          </p>

          <div className="quick-find-box">
            <div className="quick-find-header">
              <Sparkles size={18} className="qf-icon" />
              <h3>Search Markets, Fresh Crops & Bachat Bazaars</h3>
            </div>

            <div className="hero-search-box-container" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="hero-primary-search-bar">
                <div className="hero-search-input-wrapper">
                  <Search size={20} className="hero-search-icon" />
                  <input
                    type="text"
                    placeholder="Search any fruit, vegetable, market, or area (e.g. Mangoes, Swat Apples, Clifton, Empress)..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (searchTerm.trim()) setIsDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsDropdownOpen(false);
                    }}
                    className="hero-search-input"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setIsDropdownOpen(false);
                      }}
                      className="hero-search-clear-btn"
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button type="submit" className="hero-search-submit-btn">
                  <Search size={18} />
                  <span>Search</span>
                </button>
              </form>

              {/* Instant 1-Letter Autocomplete Suggestions Dropdown */}
              {isDropdownOpen && searchTerm.trim().length >= 1 && (
                <div className="search-autocomplete-dropdown hero-search-dropdown-menu">
                  {suggestions.totalCount > 0 ? (
                    <>
                      {/* 1. FRESH PRODUCE (FRUITS & VEGETABLES) FIRST */}
                      {suggestions.produce.length > 0 && (
                        <div className="autocomplete-group">
                          <div className="autocomplete-group-header">
                            <Carrot size={14} className="group-icon-produce" />
                            <span>Fresh Produce ({suggestions.produce.length}) — Click to jump to card</span>
                          </div>
                          {suggestions.produce.slice(0, 6).map((p) => {
                            const isFruit = p.category.toLowerCase() === 'fruits';
                            const isVeg = p.category.toLowerCase() === 'vegetables';
                            return (
                              <div
                                key={p.id}
                                className="autocomplete-item produce-item"
                                onClick={() => handleProduceClick(p)}
                                title={`Jump directly to ${p.name} card`}
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
                                      <span className={`item-pill ${isFruit ? 'pill-fruit' : isVeg ? 'pill-veg' : 'pill-other'}`}>
                                        {p.category}
                                      </span>
                                      <span className="item-meta-detail">• {p.season} • {p.estimatedPrice}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="action-pill-badge jump-badge">
                                  View Card →
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. MARKETS */}
                      {suggestions.markets.length > 0 && (
                        <div className="autocomplete-group">
                          <div className="autocomplete-group-header">
                            <MapPin size={14} className="group-icon-market" />
                            <span>Markets ({suggestions.markets.length})</span>
                          </div>
                          {suggestions.markets.slice(0, 4).map((m) => (
                            <div
                              key={m.id}
                              className="autocomplete-item market-item"
                              onClick={() => handleMarketClick(m)}
                              title={`View ${m.name}`}
                            >
                              <div className="item-main-info">
                                <div className="item-text">
                                  <div className="item-title">
                                    <strong>{m.name}</strong>
                                  </div>
                                  <div className="item-meta">
                                    <span className="item-area-text">📍 {m.area}</span>
                                    <span className="item-meta-detail">• {m.hoursDisplay}</span>
                                  </div>
                                </div>
                              </div>
                              <span className="action-pill-badge market-badge">
                                View Market →
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 3. AREAS / CITIES */}
                      {suggestions.areas.length > 0 && (
                        <div className="autocomplete-group">
                          <div className="autocomplete-group-header">
                            <MapPin size={14} className="group-icon-area" />
                            <span>Areas & Cities ({suggestions.areas.length})</span>
                          </div>
                          {suggestions.areas.slice(0, 4).map((areaName) => (
                            <div
                              key={areaName}
                              className="autocomplete-item area-item"
                              onClick={() => handleAreaClick(areaName)}
                              title={`Filter markets in ${areaName}`}
                            >
                              <div className="item-main-info">
                                <span className="area-icon-wrap">📍</span>
                                <div className="item-text">
                                  <span className="item-title">
                                    <strong>{areaName}</strong>
                                  </span>
                                </div>
                              </div>
                              <span className="action-pill-badge area-badge">
                                Filter Area →
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Footer */}
                      <div className="autocomplete-footer">
                        {suggestions.produce.length > 0 && (
                          <button
                            type="button"
                            className="footer-action-link"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              if (onSelectProduce) onSelectProduce(searchTerm);
                              else onExploreProduce();
                            }}
                          >
                            <span>👉 Jump to all matching "{searchTerm}" produce cards</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="footer-action-link secondary"
                          onClick={handleSearchSubmit}
                        >
                          <span>🔍 View all search results for "{searchTerm}"</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="autocomplete-empty-state">
                      <p>No exact match found for "{searchTerm}".</p>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="empty-search-fallback"
                      >
                        Press Enter or Click to search all directory records →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hero-search-divider">
              <span>Or Filter by Area, Day & Category</span>
            </div>

            <form onSubmit={handleSubmit} className="quick-find-form">

              <div className="form-group field-search">
                <label>Select City / Area</label>
                <div className="input-with-icon">
                  <MapPin size={17} className="field-icon" />
                  <select value={area} onChange={(e) => setArea(e.target.value)}>
                    <option value="">All Karachi & Pakistan Areas</option>
                    {karachiAreas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="form-group field-day">
                <label>Market Day</label>
                <div className="input-with-icon">
                  <Calendar size={17} className="field-icon" />
                  <select value={day} onChange={(e) => setDay(e.target.value)}>
                    <option value="">Any Day</option>
                    <option value="Today">Open Today</option>
                    <option value="weekend">Sunday / Weekends</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="form-group field-produce">
                <label>Market Category</label>
                <div className="input-with-icon">
                  <Carrot size={17} className="field-icon" />
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All Market Categories</option>
                    <option value="Bachat Bazaar">Bachat Bazaars</option>
                    <option value="Farmers & Organic Market">Farmers & Organic Markets</option>
                    <option value="Wholesale Market">Wholesale Markets</option>
                    <option value="Heritage Market">Heritage Markets</option>
                    <option value="Community Market">Community Markets</option>
                    <option value="Wholesale Commodities">Wholesale Commodities</option>
                  </select>
                </div>
              </div>

              <div className="form-group field-submit">
                <button type="submit" className="btn-find-markets">
                  <span>Find Markets</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </form>
          </div>


          <div className="hero-perks">
            <div className="perk-card">
              <ShieldCheck size={20} className="perk-icon" />
              <div>
                <strong>100% Verified Markets</strong>
                <p>Authentic timings for Empress, Clifton & Super Highway</p>
              </div>
            </div>

            <div className="perk-card" onClick={onExploreSeasonal}>
              <Leaf size={20} className="perk-icon" />
              <div>
                <strong>In-Season Harvest</strong>
                <p>Mirpurkhas Sindhri, Swat Apples & Malir Greens</p>
              </div>
            </div>

            <div className="perk-card" onClick={onExploreProduce}>
              <HeartHandshake size={20} className="perk-icon" />
              <div>
                <strong>Direct Kisan Support</strong>
                <p>Zero middlemen markups & fair grower profits</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
