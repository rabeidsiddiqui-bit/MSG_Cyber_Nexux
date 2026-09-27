import { useState, useMemo, useEffect, useRef } from 'react';
import { Filter, SlidersHorizontal, RotateCcw, MapPin, Calendar, Carrot, Check, Clock, Heart, Sparkles, AlertCircle, X, Search, Tag, ArrowRight } from 'lucide-react';
import MarketCard from './MarketCard';
import { isMarketOpen, getNextDay, getDistance, days } from '../utils/timeHelpers';
import { useBookmarks } from '../context/BookmarkContext';
import { getUniversalSearchSuggestions } from '../utils/universalSearchHelper';

export default function MarketDirectory({
  markets = [],
  produceList = [],
  initialFilters = {},
  onSelectMarket,
  onSelectProduce,
  onNavigate,
  userLocation
}) {
  const { isProduceBookmarked, toggleBookmarkProduce } = useBookmarks();

  const [activeTab, setActiveTab] = useState('browse');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(initialFilters.area || '');
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

  // Universal search suggestions starting from 1 character
  const suggestions = useMemo(() => {
    return getUniversalSearchSuggestions(searchQuery, markets, produceList);
  }, [searchQuery, markets, produceList]);
  const [selectedDay, setSelectedDay] = useState(initialFilters.day || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [selectedProduce, setSelectedProduce] = useState(initialFilters.produce || '');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sortOption, setSortOption] = useState('next-open');
  const [cardLimit, setCardLimit] = useState(6);

  // Matcher state (preserves existing custom matcher feature)
  const [targetMarketId, setTargetMarketId] = useState('');
  const [targetTimeSlot, setTargetTimeSlot] = useState('');
  const [targetProduceId, setTargetProduceId] = useState('');

  useEffect(() => {
    if (initialFilters.search !== undefined) {
      setSearchQuery(initialFilters.search);
      setActiveTab('browse');
    }
    if (initialFilters.area !== undefined) {
      setSelectedArea(initialFilters.area);
    }
    if (initialFilters.day !== undefined) {
      setSelectedDay(initialFilters.day);
    }
    if (initialFilters.category !== undefined) {
      setSelectedCategory(initialFilters.category);
    }
    if (initialFilters.produce !== undefined) {
      setSelectedProduce(initialFilters.produce);
    }
  }, [initialFilters]);

  // Unique Area list
  const areaList = useMemo(() => {
    const list = markets.map((m) => m.area);
    return Array.from(new Set(list)).sort();
  }, [markets]);

  // Unique Category list
  const categoryList = useMemo(() => {
    const list = markets.map((m) => m.category).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [markets]);

  function resetAll() {
    setSearchQuery('');
    setSelectedArea('');
    setSelectedDay('');
    setSelectedCategory('');
    setSelectedProduce('');
    setOnlyOpen(false);
    setSortOption('next-open');
  }

  function resetTargetMatcher() {
    setTargetMarketId('');
    setTargetTimeSlot('');
    setTargetProduceId('');
  }

  // Combined Search + Multi-Criteria Filtration working together
  const listToDisplay = useMemo(() => {
    let result = [...markets];

    // 1. Keyword search (Name, Tagline, Area, Address, Category, Description, Produce)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.area.toLowerCase().includes(q) ||
          m.address.toLowerCase().includes(q) ||
          (m.category && m.category.toLowerCase().includes(q)) ||
          (m.tagline && m.tagline.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.produceAvailable && m.produceAvailable.some((p) => p.toLowerCase().includes(q)))
      );
    }

    // 2. Area Filter
    if (selectedArea) {
      result = result.filter((m) => m.area === selectedArea);
    }

    // 3. Day Filter
    if (selectedDay) {
      if (selectedDay === 'Today') {
        const today = days[new Date().getDay()];
        result = result.filter((m) => m.operatingDays && m.operatingDays.includes(today));
      } else if (selectedDay === 'weekend') {
        result = result.filter(
          (m) =>
            m.operatingDays &&
            (m.operatingDays.includes('Saturday') || m.operatingDays.includes('Sunday'))
        );
      } else {
        result = result.filter((m) => m.operatingDays && m.operatingDays.includes(selectedDay));
      }
    }

    // 4. Category Filter
    if (selectedCategory) {
      result = result.filter((m) => m.category === selectedCategory);
    }

    // 5. Produce Filter
    if (selectedProduce) {
      result = result.filter((m) => m.produceAvailable && m.produceAvailable.includes(selectedProduce));
    }

    // 6. Only Open Now
    if (onlyOpen) {
      result = result.filter((m) => isMarketOpen(m));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'alpha-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'alpha-desc') return b.name.localeCompare(a.name);
      if (sortOption === 'rating') return b.rating - a.rating;
      if (sortOption === 'proximity') {
        const uLat = userLocation?.lat || 24.8607;
        const uLng = userLocation?.lng || 67.0011;
        const distA = getDistance(uLat, uLng, a.coordinates.lat, a.coordinates.lng) || 999;
        const distB = getDistance(uLat, uLng, b.coordinates.lat, b.coordinates.lng) || 999;
        return parseFloat(distA) - parseFloat(distB);
      }
      if (sortOption === 'next-open') {
        const openA = isMarketOpen(a);
        const openB = isMarketOpen(b);
        if (openA && !openB) return -1;
        if (!openA && openB) return 1;
        return getNextDay(a).localeCompare(getNextDay(b));
      }
      return 0;
    });

    return result;
  }, [
    markets,
    searchQuery,
    selectedArea,
    selectedDay,
    selectedCategory,
    selectedProduce,
    onlyOpen,
    sortOption,
    userLocation
  ]);

  // Targeted custom matcher
  const targetedMatches = useMemo(() => {
    if (!targetMarketId && !targetTimeSlot && !targetProduceId) {
      return [];
    }

    let candidates = [];
    markets.forEach((market) => {
      if (targetMarketId && market.id !== targetMarketId) return;

      if (targetTimeSlot) {
        const openH = parseInt(market.openingTime.split(':')[0], 10);
        const closeH = parseInt(market.closingTime.split(':')[0], 10);

        if (targetTimeSlot === 'morning' && !(openH < 12)) return;
        if (targetTimeSlot === 'evening' && !(closeH >= 17)) return;
        if (targetTimeSlot === 'sunday' && !market.operatingDays.includes('Sunday')) return;
        if (targetTimeSlot === 'open-now' && !isMarketOpen(market)) return;
      }

      produceList.forEach((prod) => {
        if (targetProduceId && prod.id !== targetProduceId) return;

        if (market.produceAvailable && market.produceAvailable.includes(prod.id)) {
          candidates.push({ market, produce: prod });
        }
      });
    });

    return candidates;
  }, [markets, produceList, targetMarketId, targetTimeSlot, targetProduceId]);

  const displayedMarkets = useMemo(() => {
    return listToDisplay.slice(0, cardLimit);
  }, [listToDisplay, cardLimit]);

  const hasActiveFilters = Boolean(
    searchQuery || selectedArea || selectedDay || selectedCategory || selectedProduce || onlyOpen
  );

  return (
    <section className="directory-section">
      <div className="directory-container">
        {/* Main Header with Exact Required Title */}
        <div className="directory-header">
          <div className="badge-pill">
            <MapPin size={14} />
            <span>Market Discovery</span>
          </div>
          <h1 className="page-heading">Find a market near you</h1>
          <p className="page-lead">
            Discover Karachi and Pakistan’s premier farmers markets, weekly bachat bazaars, and wholesale markets. Search by name, or filter by area, operating day, and market category.
          </p>

          <div className="directory-tabs-switch">
            <button
              onClick={() => setActiveTab('browse')}
              className={`dir-tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            >
              <Filter size={15} />
              <span>Search & Filter Markets</span>
            </button>
            <button
              onClick={() => setActiveTab('matcher')}
              className={`dir-tab-btn ${activeTab === 'matcher' ? 'active' : ''}`}
            >
              <Sparkles size={15} />
              <span>Custom Matcher (Market + Time + Item)</span>
            </button>
          </div>
        </div>

        {activeTab === 'browse' && (
          <div className="directory-split-layout">
            {/* Left Column: Find Markets Filter Sidebar */}
            <aside className="directory-sidebar-filters">
              <div className="directory-sidebar-card">
                <div className="sidebar-filter-header">
                  <div className="sidebar-filter-title">
                    <Filter size={18} className="sidebar-filter-icon" />
                    <h3>Filter Markets</h3>
                  </div>
                  {hasActiveFilters && (
                    <button onClick={resetAll} className="btn-sidebar-reset" title="Clear all filters">
                      <RotateCcw size={13} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* 1. Keyword Search */}
                <div className="sidebar-search-block" ref={searchContainerRef} style={{ position: 'relative' }}>
                  <label className="sidebar-field-label">Search Keywords</label>
                  <div className="directory-search-input-wrap">
                    <Search size={16} className="dir-search-icon" />
                    <input
                      type="text"
                      placeholder="Search market, area, produce..."
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
                      className="directory-search-input"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setIsDropdownOpen(false);
                        }}
                        className="dir-search-clear"
                        title="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {isDropdownOpen && searchQuery.trim().length >= 1 && (
                    <div className="search-autocomplete-dropdown sidebar-search-dropdown-menu">
                      {suggestions.totalCount > 0 ? (
                        <>
                          {/* Produce items */}
                          {suggestions.produce.length > 0 && (
                            <div className="autocomplete-group">
                              <div className="autocomplete-group-header">
                                <Carrot size={13} className="group-icon-produce" />
                                <span>Produce ({suggestions.produce.length})</span>
                              </div>
                              {suggestions.produce.slice(0, 4).map((p) => (
                                <div
                                  key={p.id}
                                  className="autocomplete-item produce-item"
                                  onClick={() => {
                                    setIsDropdownOpen(false);
                                    if (onSelectProduce) {
                                      onSelectProduce(p.name, p.id);
                                    } else {
                                      setSearchQuery(p.name);
                                    }
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

                          {/* Market items */}
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
                                    if (onSelectMarket) {
                                      onSelectMarket(m.id);
                                    } else {
                                      setSearchQuery(m.name);
                                    }
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

                          {/* Area items */}
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
                                    setSelectedArea(a);
                                    setSearchQuery('');
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

                {/* 2. Structured Dropdowns Stack */}
                <div className="sidebar-filter-stack">
                  {/* Area Dropdown */}
                  <div className="filter-item">
                    <label>Area</label>
                    <div className="filter-input-wrap">
                      <MapPin size={15} className="input-icon" />
                      <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                        <option value="">[ All Areas ▼ ]</option>
                        {areaList.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Day Dropdown */}
                  <div className="filter-item">
                    <label>Operating Day</label>
                    <div className="filter-input-wrap">
                      <Calendar size={15} className="input-icon" />
                      <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                        <option value="">[ All Days ▼ ]</option>
                        <option value="Today">Open Today</option>
                        <option value="weekend">Weekends (Sat & Sun)</option>
                        {days.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Category Dropdown */}
                  <div className="filter-item">
                    <label>Category</label>
                    <div className="filter-input-wrap">
                      <Tag size={15} className="input-icon" />
                      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">[ All Categories ▼ ]</option>
                        {categoryList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Fresh Produce Dropdown */}
                  <div className="filter-item">
                    <label>Produce Harvest</label>
                    <div className="filter-input-wrap">
                      <Carrot size={15} className="input-icon" />
                      <select value={selectedProduce} onChange={(e) => setSelectedProduce(e.target.value)}>
                        <option value="">All Fresh Harvests</option>
                        {produceList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.icon} {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Open Now Checkbox */}
                  <div className="sidebar-open-now-box">
                    <label className="toggle-open-label">
                      <input
                        type="checkbox"
                        checked={onlyOpen}
                        onChange={(e) => setOnlyOpen(e.target.checked)}
                      />
                      <span className="toggle-custom-box">{onlyOpen && <Check size={13} />}</span>
                      <span className="toggle-text">Only show open right now</span>
                    </label>
                  </div>
                </div>

                {/* Active Filter Chips Strip */}
                {hasActiveFilters && (
                  <div className="sidebar-active-chips">
                    <span className="active-chips-label">Active:</span>
                    {searchQuery && (
                      <span className="chip-badge">
                        "{searchQuery}"
                        <X size={12} className="chip-remove" onClick={() => setSearchQuery('')} />
                      </span>
                    )}
                    {selectedArea && (
                      <span className="chip-badge">
                        {selectedArea}
                        <X size={12} className="chip-remove" onClick={() => setSelectedArea('')} />
                      </span>
                    )}
                    {selectedDay && (
                      <span className="chip-badge">
                        {selectedDay}
                        <X size={12} className="chip-remove" onClick={() => setSelectedDay('')} />
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="chip-badge">
                        {selectedCategory}
                        <X size={12} className="chip-remove" onClick={() => setSelectedCategory('')} />
                      </span>
                    )}
                    {selectedProduce && (
                      <span className="chip-badge">
                        {produceList.find(p => p.id === selectedProduce)?.name || selectedProduce}
                        <X size={12} className="chip-remove" onClick={() => setSelectedProduce('')} />
                      </span>
                    )}
                    {onlyOpen && (
                      <span className="chip-badge">
                        Open Now
                        <X size={12} className="chip-remove" onClick={() => setOnlyOpen(false)} />
                      </span>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* Right Column: Market Directory */}
            <main className="directory-main-cards-section">
              <div className="directory-main-topbar">
                <div className="directory-main-title-wrap">
                  <h2 className="directory-section-heading">Market Directory</h2>
                  <p className="directory-count-text">
                    Showing <strong>{Math.min(displayedMarkets.length, listToDisplay.length)}</strong> of <strong>{listToDisplay.length}</strong> matching markets
                  </p>
                </div>

                <div className="sort-box">
                  <SlidersHorizontal size={15} />
                  <label>Sort by:</label>
                  <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                    <option value="next-open">Next Open Day</option>
                    <option value="alpha-asc">Alphabetical (A → Z)</option>
                    <option value="alpha-desc">Alphabetical (Z → A)</option>
                    <option value="rating">Top Rated ⭐</option>
                    <option value="proximity">Closest to Me 📍</option>
                  </select>
                </div>
              </div>

              {/* Market Results Grid */}
              {displayedMarkets.length > 0 ? (
                <>
                  <div className="directory-cards-grid">
                    {displayedMarkets.map((market) => (
                      <MarketCard
                        key={market.id}
                        market={market}
                        onSelectMarket={onSelectMarket}
                      />
                    ))}
                  </div>

                  {listToDisplay.length > 6 && (
                    <div className="directory-load-more-wrap">
                      <button
                        onClick={() => setCardLimit(prev => (prev === 6 ? listToDisplay.length : 6))}
                        className="btn-dir-load-more"
                      >
                        {cardLimit === 6 ? (
                          <>
                            <span>Show All Markets ({listToDisplay.length})</span>
                            <span className="btn-count-pill">+{listToDisplay.length - 6} more</span>
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
                  <Filter size={40} className="empty-icon" />
                  <h3>No Markets Found</h3>
                  <p>No markets matched your selected search and filters combination. Try selecting a different area, day, or reset filters.</p>
                  <button onClick={resetAll} className="btn-empty-reset">
                    Show All Markets
                  </button>
                </div>
              )}
            </main>
          </div>
        )}

        {/* Custom Matcher Tab (Preserved Feature) */}
        {activeTab === 'matcher' && (
          <div className="targeted-matcher-box">
            <div className="matcher-intro-card">
              <div className="matcher-intro-icon">
                <Sparkles size={24} />
              </div>
              <div className="matcher-intro-text">
                <h2>Custom Multi-Criteria Matcher</h2>
                <p>
                  Choose a <strong>Specific Market</strong>, select an <strong>Operating Slot</strong>, and pick a <strong>Fruit or Vegetable</strong> to find exact stall matches!
                </p>
              </div>
            </div>

            <div className="matcher-selectors-grid">
              <div className="matcher-selector-card">
                <div className="step-num">1</div>
                <label>Select Specific Market</label>
                <div className="filter-input-wrap">
                  <MapPin size={16} className="input-icon" />
                  <select
                    value={targetMarketId}
                    onChange={(e) => setTargetMarketId(e.target.value)}
                  >
                    <option value="">-- Choose Any Market --</option>
                    {markets.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.area})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="matcher-selector-card">
                <div className="step-num">2</div>
                <label>Select Time / Schedule</label>
                <div className="filter-input-wrap">
                  <Clock size={16} className="input-icon" />
                  <select
                    value={targetTimeSlot}
                    onChange={(e) => setTargetTimeSlot(e.target.value)}
                  >
                    <option value="">-- Any Operating Time --</option>
                    <option value="morning">Morning Stalls (Opens before 12 PM)</option>
                    <option value="evening">Evening Hours (Open till 5 PM+)</option>
                    <option value="open-now">Open Right Now</option>
                    <option value="sunday">Sunday Bazaars Only</option>
                  </select>
                </div>
              </div>

              <div className="matcher-selector-card">
                <div className="step-num">3</div>
                <label>Select Fruit / Vegetable</label>
                <div className="filter-input-wrap">
                  <Carrot size={16} className="input-icon" />
                  <select
                    value={targetProduceId}
                    onChange={(e) => setTargetProduceId(e.target.value)}
                  >
                    <option value="">-- Choose Fruit or Vegetable --</option>
                    {produceList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.name} ({p.estimatedPrice})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="matcher-actions-bar">
              {(targetMarketId || targetTimeSlot || targetProduceId) && (
                <button onClick={resetTargetMatcher} className="btn-reset-filters">
                  <RotateCcw size={14} />
                  <span>Reset Matcher</span>
                </button>
              )}
            </div>

            <div className="matcher-results-section">
              <div className="matcher-results-heading">
                <h3>Matching Results ({targetedMatches.length})</h3>
                <span className="results-badge">
                  {targetedMatches.length > 0 ? 'Verified Available' : 'Select filters to view matches'}
                </span>
              </div>

              {targetedMatches.length > 0 ? (
                <div className="matcher-results-grid">
                  {targetedMatches.map(({ market, produce }) => {
                    const isSaved = isProduceBookmarked(produce.id);
                    return (
                      <div key={`${market.id}-${produce.id}`} className="matcher-result-card">
                        <div className="match-card-img">
                          <img src={produce.image} alt={produce.name} />
                          <span className="match-price-tag">{produce.estimatedPrice}</span>
                        </div>
                        <div className="match-card-content">
                          <div className="match-top-info">
                            <span className="match-prod-icon">{produce.icon}</span>
                            <div className="match-prod-titles">
                              <h4>{produce.name}</h4>
                              <span className="match-cat">
                                {produce.category} • {produce.season} Season
                              </span>
                            </div>
                          </div>

                          <div className="match-location-box" onClick={() => onSelectMarket(market.id)}>
                            <MapPin size={15} className="match-loc-icon" />
                            <div>
                              <strong>{market.name}</strong>
                              <p>
                                {market.area} • {market.hoursDisplay}
                              </p>
                            </div>
                          </div>

                          <p className="match-desc">{produce.shortDesc}</p>

                          <div className="match-footer-actions">
                            <button
                              onClick={() => toggleBookmarkProduce(produce.id, produce.name)}
                              className={`btn-match-fav ${isSaved ? 'active' : ''}`}
                            >
                              <Heart
                                size={16}
                                fill={isSaved ? '#e63946' : 'transparent'}
                                color={isSaved ? '#e63946' : '#2b4c3f'}
                              />
                              <span>{isSaved ? 'In Basket' : 'Save Item'}</span>
                            </button>

                            <button onClick={() => onSelectMarket(market.id)} className="btn-match-view">
                              View Market
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="matcher-empty-box">
                  <AlertCircle size={36} className="empty-icon" />
                  <h4>No Exact Match Found</h4>
                  <p>
                    No market stall matches the selected criteria. Try selecting "Any Market" or another time slot!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
