import { useState, useRef, useEffect } from 'react';
import { Bookmark, User, Menu, X, Search, MapPin, Carrot, ArrowRight, Filter, Sparkles, Compass } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import { matchesProduceQuery, isProduceFocusedQuery } from '../utils/produceAliases';

export default function Navbar({
  activePage,
  onNavigate,
  onOpenBookmarks,
  onOpenAuth,
  currentUser = null,
  markets = [],
  produceList = [],
  onSelectMarket,
  onSelectProduce
}) {
  const { totalBookmarksCount } = useBookmarks();
  const [menuOpen, setMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'produce' | 'markets'
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const popularProduceChips = [
    { label: '🥭 Mangoes', query: 'mango' },
    { label: '🍅 Tomatoes', query: 'tomato' },
    { label: '🥬 Desi Palak', query: 'palak' },
    { label: '🍎 Swat Apples', query: 'apple' },
    { label: '🍓 Strawberries', query: 'strawberry' },
    { label: '🍊 Kinnow Oranges', query: 'kinnow' },
    { label: '🥒 Okra / Bhindi', query: 'bhindi' },
    { label: '🍎 All Fruits', query: 'fruit' },
    { label: '🥬 All Vegetables', query: 'vegetable' }
  ];

  // Workable Market Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterArea, setFilterArea] = useState('All');
  const [filterDay, setFilterDay] = useState('All');
  const filterContainerRef = useRef(null);

  const availableCategories = ['All', 'Farmers Market', 'Bachat Bazaar', 'Wholesale Market', 'Heritage Market', 'Organic Market'];
  const availableAreas = ['All', 'Clifton', 'Saddar', 'Gulshan', 'DHA', 'Malir', 'Super Highway'];
  const availableDays = ['All', 'Sunday', 'Friday', 'Saturday', 'Daily'];

  const activeFiltersCount = (filterCategory !== 'All' ? 1 : 0) + (filterArea !== 'All' ? 1 : 0) + (filterDay !== 'All' ? 1 : 0);

  const matchingMarketsCount = markets.filter((m) => {
    const matchCat =
      filterCategory === 'All' ||
      m.category === filterCategory ||
      (filterCategory === 'Wholesale Market' && (m.category === 'Wholesale Market' || m.category === 'Wholesale Mandi'));
    const matchArea = filterArea === 'All' || (m.area && m.area.toLowerCase().includes(filterArea.toLowerCase()));
    const matchDay =
      filterDay === 'All' ||
      (filterDay === 'Daily'
        ? m.operatingDays && m.operatingDays.length >= 6
        : m.operatingDays && m.operatingDays.includes(filterDay));
    return matchCat && matchArea && matchDay;
  }).length;

  function handleApplyFilters() {
    setIsFilterOpen(false);
    onNavigate('markets', {
      filters: {
        category: filterCategory === 'All' ? '' : filterCategory,
        area: filterArea === 'All' ? '' : filterArea,
        day: filterDay === 'All' ? '' : filterDay
      }
    });
  }

  function handleResetFilters() {
    setFilterCategory('All');
    setFilterArea('All');
    setFilterDay('All');
    onNavigate('markets', {
      filters: {
        category: '',
        area: '',
        day: ''
      }
    });
  }

  const links = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'markets', label: 'Find Markets', path: '/markets' },
    { id: 'directory', label: 'Market Directory', path: '/directory' },
    { id: 'produce', label: 'Produce Guide', path: '/produce' },
    { id: 'seasonal', label: 'Seasonal Picks', path: '/seasonal' },
    { id: 'about', label: 'About Us', path: '/about' },
    { id: 'contact', label: 'Contact Us', path: '/contact' }
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        if (!globalSearch.trim()) {
          setIsSearchOpen(false);
        }
      }
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [globalSearch]);

  function handleGo(pageId) {
    onNavigate(pageId);
    setMenuOpen(false);
  }

  const searchResults = (() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return { markets: [], produce: [] };

    // 1. Suggest ALL matching fruits & vegetables on the website
    const matchedProduce = produceList.filter((p) => matchesProduceQuery(p, q));
    const matchingProduceIds = matchedProduce.map((p) => p.id);

    // 2. Suggest Markets matching by name/area or carrying the requested produce
    const matchedMarkets = markets.filter((m) => {
      const nameMatch = m.name.toLowerCase().includes(q);
      const areaMatch = m.area.toLowerCase().includes(q);
      const addrMatch = m.address.toLowerCase().includes(q);
      const catMatch = m.category && m.category.toLowerCase().includes(q);
      const carriesMatchedProduce =
        m.produceAvailable &&
        m.produceAvailable.some((pId) => pId.toLowerCase().includes(q) || matchingProduceIds.includes(pId));
      return nameMatch || areaMatch || addrMatch || catMatch || carriesMatchedProduce;
    });

    return { markets: matchedMarkets, produce: matchedProduce };
  })();

  const hasResults = searchResults.markets.length > 0 || searchResults.produce.length > 0;

  function handleSearchSubmit(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const query = globalSearch.trim();
    if (!query) return;

    setIsDropdownOpen(false);
    setMenuOpen(false);

    // If query is specifically about fruits or vegetables (e.g. "mango", "tamatar", "palak", "fruit"),
    // direct them straight to the Produce Catalog cards!
    if (isProduceFocusedQuery(query) || (searchResults.produce.length > 0 && searchResults.markets.length === 0)) {
      if (onSelectProduce) {
        onSelectProduce(query);
        return;
      }
    }

    onNavigate('search', { query: query });
  }

  function handlePickMarket(marketId) {
    setIsDropdownOpen(false);
    setGlobalSearch('');
    if (onSelectMarket) {
      onSelectMarket(marketId);
    } else {
      onNavigate('market-detail', marketId);
    }
  }

  function handlePickProduce(produceItem) {
    setIsDropdownOpen(false);
    setGlobalSearch('');
    if (onSelectProduce) {
      // Pass both name and ID so ProduceGuide can filter and scroll to the exact card
      onSelectProduce(produceItem.name || produceItem.id, produceItem.id);
    } else {
      onNavigate('produce');
    }
  }

  function handleViewAllProduce(query) {
    setIsDropdownOpen(false);
    setGlobalSearch('');
    if (onSelectProduce) {
      onSelectProduce(query);
    } else {
      onNavigate('produce');
    }
  }

  return (
    <header className="navbar-wrapper">
      <div className="navbar-inner">
        {/* FreshFind Logo (Official Banner Logo) */}
        <div className="brand-logo" onClick={() => handleGo('home')} title="FreshFind - Home">
          <img
            src="/logo.png"
            alt="FreshFind - Fresh Food, Better Living"
            className="brand-logo-img"
          />
        </div>

        {/* Navigation Links */}
        <nav className="desktop-nav">
          <ul className="nav-list">
            {links.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  onClick={() => handleGo(item.id)}
                  className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                >
                  {item.label}
                  {activePage === item.id && <span className="active-dot" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Buttons: Search, Filter, Saved Bookmark & Mobile Menu Toggle */}
        <div className="navbar-actions">
          {/* Global Search Input & Dropdown */}
          <div
            className={`navbar-global-search-container ${isSearchOpen || globalSearch.trim() ? 'search-active' : ''}`}
            ref={searchContainerRef}
            onMouseEnter={() => setIsSearchOpen(true)}
          >
          <form
            onSubmit={handleSearchSubmit}
            className={`navbar-search-form ${isSearchOpen || globalSearch.trim() ? 'is-open has-value' : ''}`}
            onClick={() => {
              setIsSearchOpen(true);
              if (searchInputRef.current) searchInputRef.current.focus();
            }}
          >
            <button
              type="button"
              className="navbar-search-icon-btn"
              title="Search markets & produce..."
              aria-label="Search"
              onClick={() => {
                setIsSearchOpen(true);
                if (searchInputRef.current) searchInputRef.current.focus();
              }}
            >
              <Search size={17} />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search markets, fruits, veggies..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => {
                setIsSearchOpen(true);
                if (globalSearch.trim()) setIsDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                } else if (e.key === 'Escape') {
                  setIsDropdownOpen(false);
                  if (!globalSearch.trim()) setIsSearchOpen(false);
                }
              }}
              className="navbar-search-input"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setGlobalSearch('');
                  setIsDropdownOpen(false);
                  if (searchInputRef.current) searchInputRef.current.focus();
                }}
                className="navbar-search-clear"
                title="Clear"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="navbar-search-go-pill"
              onClick={(e) => {
                e.stopPropagation();
                handleSearchSubmit(e);
              }}
            >
              Go
            </button>
          </form>

          {isDropdownOpen && (
            <div className="navbar-search-dropdown">
              {!globalSearch.trim() ? (
                /* Quick Suggestions when opened with empty input */
                <div className="search-drop-quick-section">
                  <div className="search-drop-quick-title">
                    <Sparkles size={13} />
                    <span>Popular Fruits & Vegetables to Search:</span>
                  </div>
                  <div className="search-drop-quick-chips">
                    {popularProduceChips.map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        className="search-drop-quick-chip"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGlobalSearch(chip.query);
                          setIsDropdownOpen(true);
                          if (searchInputRef.current) searchInputRef.current.focus();
                        }}
                      >
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : hasResults ? (
                <>
                  {/* Category Filter Tabs */}
                  <div className="search-drop-tabs">
                    <button
                      type="button"
                      className={`search-drop-tab ${activeTab === 'all' ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setActiveTab('all'); }}
                    >
                      <Compass size={13} />
                      <span>All ({searchResults.produce.length + searchResults.markets.length})</span>
                    </button>
                    <button
                      type="button"
                      className={`search-drop-tab ${activeTab === 'produce' ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setActiveTab('produce'); }}
                    >
                      <Carrot size={13} />
                      <span>Fruits & Veggies ({searchResults.produce.length})</span>
                    </button>
                    <button
                      type="button"
                      className={`search-drop-tab ${activeTab === 'markets' ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setActiveTab('markets'); }}
                    >
                      <MapPin size={13} />
                      <span>Markets ({searchResults.markets.length})</span>
                    </button>
                  </div>

                  {/* 1. FRESH PRODUCE (FRUITS & VEGETABLES) FIRST! */}
                  {(activeTab === 'all' || activeTab === 'produce') && searchResults.produce.length > 0 && (
                    <div className="search-drop-group">
                      <div className="search-drop-heading">
                        <Carrot size={13} />
                        <span>Fresh Fruits & Vegetables ({searchResults.produce.length}) — Click to jump to card</span>
                      </div>
                      {searchResults.produce.map((p) => {
                        const isFruit = p.category.toLowerCase() === 'fruits';
                        const isVeg = p.category.toLowerCase() === 'vegetables';
                        return (
                          <div
                            key={p.id}
                            className="search-drop-item"
                            onClick={() => handlePickProduce(p)}
                            title={`Jump directly to ${p.name} card`}
                          >
                            <div className="drop-item-content-wrap">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="drop-produce-thumb"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <div className="drop-item-main">
                                <span className="drop-title">
                                  <span className="drop-emoji">{p.icon}</span> {p.name}
                                </span>
                                <span className="drop-sub">
                                  <span className={`drop-cat-tag ${isFruit ? 'tag-fruit' : isVeg ? 'tag-vegetable' : 'tag-artisanal'}`}>
                                    {p.category}
                                  </span>
                                  {' • '}{p.season} • <strong>{p.estimatedPrice}</strong>
                                </span>
                              </div>
                            </div>
                            <span className="card-jump-badge">
                              View Card →
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. MARKETS CARRYING ITEMS */}
                  {(activeTab === 'all' || activeTab === 'markets') && searchResults.markets.length > 0 && (
                    <div className="search-drop-group">
                      <div className="search-drop-heading">
                        <MapPin size={13} />
                        <span>Markets ({searchResults.markets.length})</span>
                      </div>
                      {searchResults.markets.map((m) => (
                        <div
                          key={m.id}
                          className="search-drop-item"
                          onClick={() => handlePickMarket(m.id)}
                          title={`View ${m.name} details`}
                        >
                          <div className="drop-item-main">
                            <span className="drop-title">{m.name}</span>
                            <span className="drop-sub">
                              📍 {m.area} • {m.hoursDisplay}
                            </span>
                          </div>
                          <span className="drop-badge">View Market</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="search-drop-footer-actions">
                    {searchResults.produce.length > 0 && (
                      <div className="search-drop-footer" onClick={() => handleViewAllProduce(globalSearch)}>
                        <span>👉 View all {globalSearch} cards in Produce Catalog</span>
                        <ArrowRight size={14} />
                      </div>
                    )}
                    <div className="search-drop-footer secondary" onClick={handleSearchSubmit}>
                      <span>🔍 Full directory & market search for "{globalSearch}"</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="search-drop-empty">
                  <span>No exact match found for "{globalSearch}".</span>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleViewAllProduce(globalSearch)}
                      className="search-drop-fallback-btn"
                    >
                      Browse Produce Catalog
                    </button>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="search-drop-fallback-btn secondary"
                    >
                      Search Markets Directory
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

          {/* Quick Workable Filter Button & Popover */}
          <div className="navbar-filter-wrapper" ref={filterContainerRef}>
            <button
              type="button"
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsDropdownOpen(false);
              }}
              className={`action-btn filter-trigger-btn icon-only-btn ${isFilterOpen ? 'active' : ''} ${activeFiltersCount > 0 ? 'has-active-filters' : ''}`}
              title="Filter Markets by Category, Area & Day"
              aria-label="Filter Markets"
            >
              <Filter size={18} />
              {activeFiltersCount > 0 && (
                <span className="badge-counter filter-badge-count">{activeFiltersCount}</span>
              )}
            </button>

            {/* Workable Filter Popover Dropdown */}
            {isFilterOpen && (
              <div className="navbar-filter-popover" role="dialog" aria-label="Market Filtration">
                <div className="filter-popover-header">
                  <div className="filter-popover-title">
                    <Filter size={16} />
                    <span>Quick Filter Markets</span>
                  </div>
                  <button
                    type="button"
                    className="filter-popover-close"
                    onClick={() => setIsFilterOpen(false)}
                    aria-label="Close Filter"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="filter-popover-body">
                  {/* Category Filter */}
                  <div className="popover-filter-group">
                    <label className="filter-group-label">Market Category</label>
                    <div className="filter-chips-grid">
                      {availableCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`filter-chip ${filterCategory === cat ? 'active' : ''}`}
                          onClick={() => setFilterCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Area / Location Filter */}
                  <div className="popover-filter-group">
                    <label className="filter-group-label">Area / Location</label>
                    <div className="filter-chips-grid">
                      {availableAreas.map((area) => (
                        <button
                          key={area}
                          type="button"
                          className={`filter-chip ${filterArea === area ? 'active' : ''}`}
                          onClick={() => setFilterArea(area)}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Schedule / Day Filter */}
                  <div className="popover-filter-group">
                    <label className="filter-group-label">Operating Day</label>
                    <div className="filter-chips-grid">
                      {availableDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          className={`filter-chip ${filterDay === day ? 'active' : ''}`}
                          onClick={() => setFilterDay(day)}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="filter-popover-footer">
                  <div className="filter-matches-info">
                    <strong>{matchingMarketsCount}</strong> {matchingMarketsCount === 1 ? 'market' : 'markets'} found
                  </div>
                  <div className="filter-footer-actions">
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        className="btn-filter-reset"
                        onClick={handleResetFilters}
                      >
                        Reset
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-filter-apply"
                      onClick={handleApplyFilters}
                    >
                      Apply & View
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onOpenBookmarks}
            className="action-btn bookmark-trigger-btn icon-only-btn"
            title="View Saved Bookmarks & Favorites"
            aria-label="Saved Bookmarks"
          >
            <Bookmark size={18} />
            {totalBookmarksCount > 0 && (
              <span className="badge-counter">{totalBookmarksCount}</span>
            )}
          </button>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-search-strip">
            <form onSubmit={handleSearchSubmit} className="mobile-search-form">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search markets, fruits, veggies..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => setGlobalSearch('')}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0 4px' }}
                  aria-label="Clear mobile search"
                >
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="mobile-search-btn">Go</button>
            </form>

            {globalSearch.trim() && (
              <div className="mobile-search-results-list">
                {searchResults.produce.length > 0 && (
                  <div className="mobile-search-group">
                    <span className="mobile-group-label">🥕 Fresh Fruits & Vegetables (Click to view card):</span>
                    {searchResults.produce.map((p) => (
                      <div
                        key={p.id}
                        className="mobile-search-item"
                        onClick={() => {
                          setMenuOpen(false);
                          handlePickProduce(p);
                        }}
                      >
                        <span className="mobile-item-title">{p.icon} {p.name}</span>
                        <span className="mobile-item-meta">{p.category} • {p.estimatedPrice}</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.markets.length > 0 && (
                  <div className="mobile-search-group">
                    <span className="mobile-group-label">🏪 Markets:</span>
                    {searchResults.markets.map((m) => (
                      <div
                        key={m.id}
                        className="mobile-search-item"
                        onClick={() => {
                          setMenuOpen(false);
                          handlePickMarket(m.id);
                        }}
                      >
                        <span className="mobile-item-title">{m.name}</span>
                        <span className="mobile-item-meta">📍 {m.area}</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.produce.length > 0 && (
                  <div
                    className="mobile-search-item-action"
                    onClick={() => {
                      setMenuOpen(false);
                      handleViewAllProduce(globalSearch);
                    }}
                  >
                    <span>👉 View all matching {globalSearch} cards</span>
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            )}
          </div>

          <ul className="mobile-nav-list">
            {links.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleGo(item.id)}
                  className={`mobile-nav-link ${activePage === item.id ? 'active' : ''}`}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li className="mobile-drawer-actions">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setIsFilterOpen(true);
                }}
                className="mobile-action-btn"
              >
                <Filter size={17} />
                <span>Quick Filter Markets {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
              </button>
              <button onClick={() => { setMenuOpen(false); onOpenBookmarks(); }} className="mobile-action-btn">
                <Bookmark size={17} />
                <span>My Saved Items ({totalBookmarksCount})</span>
              </button>
              <button onClick={() => { setMenuOpen(false); onOpenAuth(); }} className="mobile-action-btn primary">
                <User size={17} />
                <span>{currentUser ? currentUser.name : 'Sign In / Register'}</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
