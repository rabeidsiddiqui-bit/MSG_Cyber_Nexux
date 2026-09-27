import { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, Search, MapPin, Calendar, Tag, ArrowRight, RotateCcw, X, ChevronDown, ChevronUp, Carrot } from 'lucide-react';
import { days, getCurrentDay } from '../utils/timeHelpers';
import { getUniversalSearchSuggestions } from '../utils/universalSearchHelper';

/**
 * Reusable Market Search & Filter Bar Component
 * Provides the same "Search & Filter Markets" functionality across all sections:
 * Product Guide, Contact Us, Seasonal Recommendations, and Market Details.
 */
export default function MarketSearchFilterBar({
  markets = [],
  produceList = [],
  onNavigate,
  onSelectProduce,
  defaultOpen = true,
  collapsible = true,
  title = "Search & Filter Markets",
  subtitle = "Filter Karachi and Pakistan markets by name, area, day, or category directly"
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const searchContainerRef = useRef(null);

  // Suggestions starting from 1 character
  const suggestions = useMemo(() => {
    return getUniversalSearchSuggestions(searchQuery, markets, produceList);
  }, [searchQuery, markets, produceList]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract unique areas from markets
  const areaList = useMemo(() => {
    const list = markets.map((m) => m.area).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [markets]);

  // Extract unique categories from markets
  const categoryList = useMemo(() => {
    const list = markets.map((m) => m.category).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [markets]);

  // Count matches in real-time
  const matchingMarkets = useMemo(() => {
    return markets.filter((m) => {
      // 1. Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          m.name.toLowerCase().includes(q) ||
          m.area.toLowerCase().includes(q) ||
          m.address.toLowerCase().includes(q) ||
          (m.category && m.category.toLowerCase().includes(q)) ||
          (m.tagline && m.tagline.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // 2. Area
      if (selectedArea && m.area !== selectedArea) return false;

      // 3. Day
      if (selectedDay) {
        if (selectedDay === 'Today') {
          const today = days[new Date().getDay()];
          if (!m.operatingDays || !m.operatingDays.includes(today)) return false;
        } else if (selectedDay === 'weekend') {
          const isWeekend =
            m.operatingDays &&
            (m.operatingDays.includes('Saturday') || m.operatingDays.includes('Sunday'));
          if (!isWeekend) return false;
        } else {
          if (!m.operatingDays || !m.operatingDays.includes(selectedDay)) return false;
        }
      }

      // 4. Category
      if (selectedCategory && m.category !== selectedCategory) return false;

      return true;
    });
  }, [markets, searchQuery, selectedArea, selectedDay, selectedCategory]);

  const hasActiveFilters = Boolean(searchQuery || selectedArea || selectedDay || selectedCategory);

  function handleReset() {
    setSearchQuery('');
    setSelectedArea('');
    setSelectedDay('');
    setSelectedCategory('');
  }

  function handleApplyFilters() {
    if (onNavigate) {
      onNavigate('markets', {
        search: searchQuery.trim(),
        area: selectedArea,
        day: selectedDay,
        category: selectedCategory
      });
    }
  }

  return (
    <div className="section-market-filter-wrapper">
      <div className="directory-tabs-switch" style={{ marginBottom: isOpen ? '0.75rem' : '0' }}>
        <button
          type="button"
          onClick={() => collapsible && setIsOpen(!isOpen)}
          className="dir-tab-btn active"
          style={{ cursor: collapsible ? 'pointer' : 'default' }}
          title={collapsible ? (isOpen ? 'Click to hide filter panel' : 'Click to open Search & Filter Markets') : undefined}
        >
          <Filter size={15} />
          <span>{title}</span>
          {hasActiveFilters && (
            <span
              className="filter-active-pill"
              style={{
                marginLeft: '4px',
                background: '#e9c46a',
                color: '#1b4332',
                fontSize: '0.75rem',
                padding: '2px 7px',
                borderRadius: '10px',
                fontWeight: 800
              }}
            >
              Active
            </span>
          )}
          {collapsible && (
            <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '6px' }}>
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="filter-panel-card section-filter-card" style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
          {subtitle && (
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem', marginTop: 0 }}>
              {subtitle}
            </p>
          )}

          {/* Keyword Search with 1-Letter Universal Autocomplete */}
          <div className="filter-search-autocomplete-wrap" ref={searchContainerRef} style={{ position: 'relative' }}>
            <div className="directory-search-input-wrap">
              <Search size={18} className="dir-search-icon" />
              <input
                type="text"
                placeholder="Search market name, produce, or area (e.g. Empress Market, Mangoes, Clifton)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setIsDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                  else if (e.key === 'Escape') setIsDropdownOpen(false);
                }}
                className="directory-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className="dir-search-clear"
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Instant Suggestions Dropdown */}
            {isDropdownOpen && searchQuery.trim().length >= 1 && (
              <div className="search-autocomplete-dropdown section-search-dropdown-menu">
                {suggestions.totalCount > 0 ? (
                  <>
                    {/* 1. PRODUCE */}
                    {suggestions.produce.length > 0 && (
                      <div className="autocomplete-group">
                        <div className="autocomplete-group-header">
                          <Carrot size={14} className="group-icon-produce" />
                          <span>Fresh Produce ({suggestions.produce.length})</span>
                        </div>
                        {suggestions.produce.slice(0, 5).map((p) => {
                          const isFruit = p.category.toLowerCase() === 'fruits';
                          const isVeg = p.category.toLowerCase() === 'vegetables';
                          return (
                            <div
                              key={p.id}
                              className="autocomplete-item produce-item"
                              onClick={() => {
                                setIsDropdownOpen(false);
                                setSearchQuery(p.name);
                                if (onSelectProduce) onSelectProduce(p.name, p.id);
                                else if (onNavigate) onNavigate('produce', { search: p.name });
                              }}
                              title={`Jump directly to ${p.name}`}
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
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setSearchQuery(m.name);
                              if (onNavigate) onNavigate('market-detail', m.id);
                            }}
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
                              View Details →
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. AREAS */}
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
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setSelectedArea(areaName);
                            }}
                            title={`Select area ${areaName}`}
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
                  </>
                ) : (
                  <div className="autocomplete-empty-state">
                    <p>No exact match found for "{searchQuery}".</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3 Dropdowns: Area, Day, Category */}
          <div
            className="filter-grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              marginTop: '1rem'
            }}
          >
            {/* Area Dropdown */}
            <div className="filter-item">
              <label>Area</label>
              <div className="filter-input-wrap">
                <MapPin size={16} className="input-icon" />
                <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                  <option value="">[ Select Area ▼ ]</option>
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
              <label>Day</label>
              <div className="filter-input-wrap">
                <Calendar size={16} className="input-icon" />
                <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                  <option value="">[ Select Day ▼ ]</option>
                  <option value="Today">Open Today ({getCurrentDay()})</option>
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
                <Tag size={16} className="input-icon" />
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="">[ Select Category ▼ ]</option>
                  {categoryList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filter Footer / Apply & Reset */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
                {matchingMarkets.length === 1 ? '1 market matches' : `${matchingMarkets.length} markets match`}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-filter-reset"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="btn-apply-market-filter"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#1b4332',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(27,67,50,0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>View Matching Markets ({matchingMarkets.length})</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
