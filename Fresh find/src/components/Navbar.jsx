import { useState, useRef, useEffect } from 'react';
import { Bookmark, User, Menu, X, Search, MapPin, Carrot, ArrowRight, CheckCircle2, Filter } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const links = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'about', label: 'About Us', path: '/about' },
    { id: 'markets', label: 'Find Markets', path: '/markets' },
    { id: 'produce', label: 'Product Guide', path: '/produce' },
    { id: 'seasonal', label: 'Seasonal Picks', path: '/seasonal' },
    { id: 'contact', label: 'Contact Us', path: '/contact' }
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleGo(pageId) {
    onNavigate(pageId);
    setMenuOpen(false);
  }

  const searchResults = (() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return { markets: [], produce: [] };

    const matchedMarkets = markets
      .filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.area.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q) ||
        (m.category && m.category.toLowerCase().includes(q)) ||
        (m.produceAvailable && m.produceAvailable.some((p) => p.toLowerCase().includes(q)))
      )
      .slice(0, 4);

    const matchedProduce = produceList
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.season.toLowerCase().includes(q)
      )
      .slice(0, 4);

    return { markets: matchedMarkets, produce: matchedProduce };
  })();

  const hasResults = searchResults.markets.length > 0 || searchResults.produce.length > 0;

  function handleSearchSubmit(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const query = globalSearch.trim();
    setIsDropdownOpen(false);
    setMenuOpen(false);
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
      onSelectProduce(produceItem.name || produceItem.id);
    } else {
      onNavigate('produce');
    }
  }

  return (
    <header className="navbar-wrapper">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="brand-logo" onClick={() => handleGo('home')}>
          <div className="logo-icon-box">
            <img
              src="/logo.svg"
              alt="FreshFind Logo"
              className="brand-logo-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
          </div>
          <div className="brand-text-group">
            <div className="brand-title">
              Fresh<span>Find</span>
            </div>
            <div className="brand-subtitle">Pakistan Farmers & Mandis</div>
          </div>
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

        {/* Global Search Input & Dropdown */}
        <div
          className="navbar-global-search-container"
          ref={searchContainerRef}
          onMouseEnter={() => setIsSearchExpanded(true)}
          onMouseLeave={() => {
            if (document.activeElement !== searchInputRef.current && !globalSearch.trim()) {
              setIsSearchExpanded(false);
            }
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            className={`navbar-search-form ${isSearchExpanded || globalSearch.trim() ? 'is-expanded' : ''}`}
            onClick={() => {
              if (searchInputRef.current) {
                searchInputRef.current.focus();
                setIsSearchExpanded(true);
              }
            }}
          >
            <button
              type="button"
              className="navbar-search-icon-btn"
              title="Search mandis, fruits, veggies..."
              aria-label="Search"
              onClick={(e) => {
                if (!isSearchExpanded) {
                  e.preventDefault();
                  setIsSearchExpanded(true);
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }
              }}
            >
              <span className="search-circle-emoji" role="img" aria-label="Search">🔍</span>
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search mandis, fruits, veggies..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => {
                setIsSearchExpanded(true);
                if (globalSearch.trim()) setIsDropdownOpen(true);
              }}
              onBlur={() => {
                if (!globalSearch.trim()) {
                  setTimeout(() => {
                    setIsSearchExpanded(false);
                  }, 180);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
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

          {isDropdownOpen && globalSearch.trim().length > 0 && (
            <div className="navbar-search-dropdown">
              {hasResults ? (
                <>
                  {searchResults.markets.length > 0 && (
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
                        >
                          <div className="drop-item-main">
                            <span className="drop-title">{m.name}</span>
                            <span className="drop-sub">
                              {m.area} • {m.hoursDisplay}
                            </span>
                          </div>
                          <span className="drop-badge">View</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.produce.length > 0 && (
                    <div className="search-drop-group">
                      <div className="search-drop-heading">
                        <Carrot size={13} />
                        <span>Fresh Produce ({searchResults.produce.length})</span>
                      </div>
                      {searchResults.produce.map((p) => (
                        <div
                          key={p.id}
                          className="search-drop-item"
                          onClick={() => handlePickProduce(p)}
                        >
                          <div className="drop-item-main">
                            <span className="drop-title">
                              <span className="drop-emoji">{p.icon}</span> {p.name}
                            </span>
                            <span className="drop-sub">
                              {p.category} • {p.estimatedPrice}
                            </span>
                          </div>
                          <span className="drop-price">{p.estimatedPrice}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="search-drop-footer" onClick={handleSearchSubmit}>
                    <span>View all matching markets for "{globalSearch}"</span>
                    <ArrowRight size={14} />
                  </div>
                </>
              ) : (
                <div className="search-drop-empty">
                  <span>No exact match. Press "Go" to filter directory for "{globalSearch}".</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Saved, Filter & User Auth */}
        <div className="navbar-actions">
          <button
            onClick={() => handleGo('markets')}
            className={`action-btn filter-trigger-btn ${activePage === 'markets' ? 'active' : ''}`}
            title="Search & Filter Markets"
          >
            <Filter size={16} />
            <span className="btn-label-desktop">Filter</span>
          </button>

          <button
            onClick={onOpenBookmarks}
            className="action-btn bookmark-trigger-btn"
            title="View Saved Bookmarks & Favorites"
          >
            <Bookmark size={17} />
            <span className="btn-label-desktop">Saved</span>
            {totalBookmarksCount > 0 && (
              <span className="badge-counter">{totalBookmarksCount}</span>
            )}
          </button>

          <button
            onClick={onOpenAuth}
            className="action-btn auth-trigger-btn"
            title={currentUser ? `Logged in as ${currentUser.name}` : 'Sign In / Register'}
          >
            <User size={17} />
            <span className="btn-label-desktop">
              {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
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
                placeholder="Search markets & produce..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
              <button type="submit" className="mobile-search-btn">Search</button>
            </form>
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
