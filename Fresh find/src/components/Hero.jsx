import { useState } from 'react';
import { MapPin, Calendar, Carrot, ArrowRight, ShieldCheck, HeartHandshake, Leaf, Sparkles, Search, X } from 'lucide-react';
import { days } from '../utils/timeHelpers';

export default function Hero({ onSearch, onQuickSearch, onExploreProduce, onExploreSeasonal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [day, setDay] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');

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

  function handleSearchSubmit(e) {
    if (e) e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      if (onSearch) {
        onSearch(query);
      } else if (onQuickSearch) {
        onQuickSearch({ search: query });
      }
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
            <span>Pakistan’s #1 Farmers Market & Mandi Network</span>
          </div>

          <h1 className="hero-title">
            Fresh From Pakistani Farms <br />
            <span>To Your Kitchen Table</span>
          </h1>

          <p className="hero-description">
            Discover Karachi and Pakistan’s premier farmers markets, weekly bachat bazaars, and wholesale sabzi mandis.
            Track real-time operating hours, compare daily mandi rates, and support 350+ local growers directly.
          </p>

          <div className="quick-find-box">
            <div className="quick-find-header">
              <Sparkles size={18} className="qf-icon" />
              <h3>Search Mandis, Fresh Crops & Bachat Bazaars</h3>
            </div>

            <form onSubmit={handleSearchSubmit} className="hero-primary-search-bar">
              <div className="hero-search-input-wrapper">
                <Search size={20} className="hero-search-icon" />
                <input
                  type="text"
                  placeholder="Search any mandi, fruit, vegetable, or area (e.g. Empress Market, Mangoes, Clifton)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="hero-search-input"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
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
                    <option value="Wholesale Mandi">Wholesale Mandis</option>
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
                <strong>100% Verified Mandis</strong>
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
