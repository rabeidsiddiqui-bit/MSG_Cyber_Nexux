import { useState, useMemo, useEffect } from 'react';
import { Search, Carrot, Heart, Bookmark, Share2, MapPin, Lightbulb, Shield, Calendar, Sparkles, X } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import { shareContent } from '../utils/shareHelper';
import MarketSearchFilterBar from './MarketSearchFilterBar';

export default function ProduceGuide({
  produceList = [],
  allMarkets = [],
  onSelectMarket,
  initialCategory = '',
  initialSearch = '',
  onNavigate
}) {
  const {
    isProduceFavorited,
    toggleFavoriteProduce,
    isProduceBookmarked,
    toggleBookmarkProduce,
    triggerToast
  } = useBookmarks();

  const [search, setSearch] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  const categories = ['All', 'Fruits', 'Vegetables', 'Herbs', 'Dairy & Pantry', 'Artisanal'];

  const items = useMemo(() => {
    const filtered = produceList.filter((item) => {
      const matchCat =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.season.toLowerCase().includes(search.toLowerCase()) ||
        (item.shortDesc && item.shortDesc.toLowerCase().includes(search.toLowerCase())) ||
        (item.markets && item.markets.some(mId => {
          const m = allMarkets.find(market => market.id === mId);
          return m && (m.name.toLowerCase().includes(search.toLowerCase()) || m.area.toLowerCase().includes(search.toLowerCase()));
        }));
      const matchSeason = selectedSeason === 'All' || item.season === selectedSeason || (selectedSeason === 'All Year' && item.season === 'All Year');
      return matchCat && matchSearch && matchSeason;
    });

    // Sort
    let sorted = [...filtered];
    if (sortOrder === 'alpha-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOrder === 'alpha-desc') sorted.sort((a, b) => b.name.localeCompare(a.name));
    if (sortOrder === 'price-asc') sorted.sort((a, b) => {
      const pa = parseFloat(a.estimatedPrice.replace(/[^0-9.]/g, '')) || 0;
      const pb = parseFloat(b.estimatedPrice.replace(/[^0-9.]/g, '')) || 0;
      return pa - pb;
    });
    return sorted;
  }, [produceList, selectedCategory, selectedSeason, sortOrder, search, allMarkets]);

  function getCarryingMarkets(marketIds = []) {
    return allMarkets.filter((m) => marketIds.includes(m.id));
  }

  async function handleShareProduce(produce, carrying) {
    const marketNames = carrying.map(m => `${m.name} (${m.area})`).join(', ');
    const res = await shareContent({
      title: `${produce.name} - FreshFind Pakistan`,
      text: `${produce.name} (${produce.estimatedPrice}). Season: ${produce.season}. Available at: ${marketNames}.`,
      url: window.location.href
    });

    if (res.method === 'clipboard') {
      triggerToast('info', produce.name, true, 'Produce info & link copied to clipboard!');
    }
  }

  return (
    <section className="produce-guide-section">
      <div className="produce-container">
        <div className="produce-header">
          <div className="badge-pill">
            <Carrot size={14} />
            <span>Product Guide & Catalog</span>
          </div>
          <h1 className="page-heading">Fresh Farm Produce Catalog</h1>
          <p className="page-lead">
            Complete guide to seasonal Pakistani fruits, vegetables, and artisanal crops — including typical seasons, market availability, and exact vendor locations.
          </p>
        </div>

        {/* Global Market Search & Filter Bar */}
        <MarketSearchFilterBar
          markets={allMarkets}
          onNavigate={onNavigate}
          defaultOpen={false}
          collapsible={true}
          title="Search & Filter Markets"
          subtitle="Filter Pakistani farmers markets and mandis by area, day, or category directly from the Product Guide"
        />

        {/* Filter and Search Bar */}
        <div className="produce-filter-bar">
          {/* Filter by Produce Type — Alag se labeled */}
          <div className="category-pills" style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2b4c3f', marginRight: '8px', whiteSpace: 'nowrap' }}>
              Filter by Type:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Season & Sort Controls */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', margin: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} style={{ color: '#2b4c3f' }} />
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2b4c3f' }}>Season:</label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                style={{ fontSize: '0.82rem', padding: '4px 8px', borderRadius: '6px', border: '1px solid #c2e9d2', background: '#f8fdf9', color: '#2b4c3f', cursor: 'pointer' }}
              >
                {['All', 'Spring', 'Summer', 'Autumn', 'Winter', 'All Year'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} style={{ color: '#2b4c3f' }} />
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2b4c3f' }}>Sort:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ fontSize: '0.82rem', padding: '4px 8px', borderRadius: '6px', border: '1px solid #c2e9d2', background: '#f8fdf9', color: '#2b4c3f', cursor: 'pointer' }}
              >
                <option value='default'>Default</option>
                <option value='alpha-asc'>A to Z</option>
                <option value='alpha-desc'>Z to A</option>
                <option value='price-asc'>Price: Low to High</option>
              </select>
            </div>
            {(selectedSeason !== 'All' || sortOrder !== 'default') && (
              <button
                onClick={() => { setSelectedSeason('All'); setSortOrder('default'); }}
                style={{ fontSize: '0.78rem', color: '#e63946', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                ✕ Reset
              </button>
            )}
          </div>

          <div className="produce-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by produce, season, or market (e.g. Mango, Winter, Clifton)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="btn-search-clear" title="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Results summary banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 4px' }}>
          <span style={{ fontSize: '0.95rem', color: '#495057' }}>
            Showing <strong>{items.length}</strong> catalog items
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
            {search ? ` matching "${search}"` : ''}
          </span>
          {(search || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#2b4c3f',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Produce Cards Grid */}
        <div className="produce-cards-grid">
          {items.map((produce) => {
            const isFav = isProduceFavorited(produce.id);
            const isBmk = isProduceBookmarked(produce.id);
            const carrying = getCarryingMarkets(produce.markets);

            return (
              <div key={produce.id} className="produce-card">
                <div className="produce-media">
                  <img src={produce.image} alt={produce.name} loading="lazy" />

                  {/* Typical Season Tag */}
                  <span className="produce-season-pill" title={`Typical Season: ${produce.season}`}>
                    <Calendar size={13} />
                    <span>{produce.season} Season</span>
                  </span>

                  {/* Top Action Icons (Favorite, Bookmark, Share) */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 3 }}>
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavoriteProduce(produce.id, produce.name)}
                      className={`btn-produce-bookmark ${isFav ? 'active' : ''}`}
                      title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                      aria-label="Favorite produce"
                    >
                      <Heart
                        size={17}
                        fill={isFav ? '#e63946' : 'transparent'}
                        color={isFav ? '#e63946' : '#ffffff'}
                      />
                    </button>

                    {/* Bookmark Button */}
                    <button
                      onClick={() => toggleBookmarkProduce(produce.id, produce.name)}
                      className={`btn-produce-bookmark ${isBmk ? 'active-bookmark' : ''}`}
                      style={{
                        background: isBmk ? 'rgba(42, 157, 143, 0.9)' : 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)'
                      }}
                      title={isBmk ? 'Remove from Bookmarks' : 'Bookmark this produce'}
                      aria-label="Bookmark produce"
                    >
                      <Bookmark
                        size={17}
                        fill={isBmk ? '#ffffff' : 'transparent'}
                        color={isBmk ? '#ffffff' : '#ffffff'}
                      />
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShareProduce(produce, carrying)}
                      className="btn-produce-bookmark"
                      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                      title="Share this produce"
                      aria-label="Share produce"
                    >
                      <Share2 size={16} color="#ffffff" />
                    </button>
                  </div>
                </div>

                <div className="produce-body">
                  <div className="produce-meta-top">
                    <span className="cat-badge">{produce.category}</span>
                    <span className="price-badge">{produce.estimatedPrice}</span>
                  </div>

                  <h3 className="produce-title">
                    <span>{produce.icon}</span> {produce.name}
                  </h3>

                  {/* Description */}
                  <p className="produce-desc">{produce.shortDesc}</p>

                  {/* Typical Season & Peak Months Details */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#f8fdf9',
                    border: '1px solid #d8f3dc',
                    marginBottom: '12px',
                    fontSize: '0.85rem'
                  }}>
                    <Calendar size={15} style={{ color: '#2b4c3f', flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#2b4c3f' }}>Season: </strong>
                      <span>{produce.season}</span>
                      {produce.peakMonths && produce.peakMonths.length > 0 && (
                        <span style={{ color: '#6c757d', marginLeft: '6px' }}>
                          (Peak: {produce.peakMonths.join(', ')})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Where & When Available: Markets & Locations */}
                  <div className="produce-markets-block" style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <MapPin size={15} style={{ color: '#e76f51' }} />
                      <strong style={{ fontSize: '0.85rem', color: '#2b4c3f' }}>
                        Available At {carrying.length} Markets & Areas:
                      </strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {carrying.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => onSelectMarket(m.id)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            textAlign: 'left',
                            padding: '6px 10px',
                            background: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#2b4c3f';
                            e.currentTarget.style.background = '#edf7f2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e9ecef';
                            e.currentTarget.style.background = '#f8f9fa';
                          }}
                          title={`Click to view ${m.name} details`}
                        >
                          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1f2937' }}>
                            {m.name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#6c757d', whiteSpace: 'nowrap' }}>
                            📍 {m.area}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Health Benefits */}
                  <div className="benefit-row" style={{ marginTop: '12px' }}>
                    <Shield size={14} className="benefit-icon" />
                    <span>{produce.healthBenefits}</span>
                  </div>

                  {/* Storage Tip */}
                  <div className="storage-tip-box">
                    <Lightbulb size={14} className="tip-icon" />
                    <span>
                      <strong>Storage Tip:</strong> {produce.storageTip}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: '12px', marginTop: '20px', border: '1px solid #e9ecef' }}>
            <Carrot size={40} style={{ color: '#adb5bd', margin: '0 auto 12px' }} />
            <h3>No produce matches your search</h3>
            <p style={{ color: '#6c757d' }}>Try another keyword, season, or reset category filter.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
              style={{
                marginTop: '12px',
                padding: '8px 18px',
                borderRadius: '8px',
                background: '#2b4c3f',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View All Produce
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
