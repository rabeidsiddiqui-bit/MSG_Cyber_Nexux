import { useState, useMemo } from 'react';
import { Filter, Search, MapPin, Calendar, Tag, ArrowRight, RotateCcw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { days, getCurrentDay } from '../utils/timeHelpers';

/**
 * Reusable Market Search & Filter Bar Component
 * Provides the same "Search & Filter Markets" functionality across all sections:
 * Product Guide, About Us, Contact Us, Seasonal Recommendations, and Market Details.
 */
export default function MarketSearchFilterBar({
  markets = [],
  onNavigate,
  defaultOpen = true,
  collapsible = true,
  title = "Search & Filter Markets",
  subtitle = "Filter Karachi and Pakistan markets by name, area, day, or category directly"
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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

          {/* Keyword Search */}
          <div className="directory-search-input-wrap">
            <Search size={18} className="dir-search-icon" />
            <input
              type="text"
              placeholder="Search market name or keyword (e.g. Sunday Market, Empress, Clifton, Sabzi Mandi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="directory-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="dir-search-clear"
                title="Clear search"
              >
                <X size={15} />
              </button>
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
