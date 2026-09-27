import { useState, useMemo } from 'react';
import {
  TrendingUp, Clock, MapPin, Carrot, Heart, Sparkles,
  ShoppingBag, CheckCircle, ArrowRight, Star, MessageSquare
} from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

export default function HomeExtraSections({
  markets = [],
  produceList = [],
  onSelectMarket
}) {
  const { isProduceFavorited, toggleFavoriteProduce } = useBookmarks();

  const [selectedMarketId, setSelectedMarketId] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedProduceId, setSelectedProduceId] = useState('');


  const dailyRates = [
    { name: 'Red Farm Tomatoes', price: 'Rs. 120 / kg', change: '-5%', dir: 'down', icon: '🍅' },
    { name: 'Sindhri Mangoes', price: 'Rs. 280 / kg', change: '+3%', dir: 'up', icon: '🥭' },
    { name: 'Desi Palak', price: 'Rs. 60 / bunch', change: '-8%', dir: 'down', icon: '🥬' },
    { name: 'Swat Crisp Apples', price: 'Rs. 220 / kg', change: 'Stable', dir: 'stable', icon: '🍎' },
    { name: 'Malir Green Chillies', price: 'Rs. 180 / kg', change: '+2%', dir: 'up', icon: '🌶️' },
    { name: 'Farm Desi Eggs', price: 'Rs. 360 / dozen', change: 'Stable', dir: 'stable', icon: '🥚' },
    { name: 'Crisp Okra (Bhindi)', price: 'Rs. 140 / kg', change: '-4%', dir: 'down', icon: '🥒' },
    { name: 'Pure Desi Ghee', price: 'Rs. 2,400 / kg', change: 'Stable', dir: 'stable', icon: '🧈' }
  ];


  const matchedHomeResults = useMemo(() => {
    if (!selectedMarketId && !selectedTime && !selectedProduceId) {

      return produceList.slice(0, 3).map(p => ({
        produce: p,
        market: markets[0] || {}
      }));
    }

    let results = [];
    markets.forEach((m) => {
      if (selectedMarketId && m.id !== selectedMarketId) return;

      if (selectedTime) {
        const openH = parseInt(m.openingTime.split(':')[0], 10);
        const closeH = parseInt(m.closingTime.split(':')[0], 10);
        if (selectedTime === 'morning' && openH >= 12) return;
        if (selectedTime === 'evening' && closeH < 17) return;
        if (selectedTime === 'sunday' && !m.operatingDays.includes('Sunday')) return;
      }

      produceList.forEach((prod) => {
        if (selectedProduceId && prod.id !== selectedProduceId) return;
        if (m.produceAvailable && m.produceAvailable.includes(prod.id)) {
          results.push({ market: m, produce: prod });
        }
      });
    });

    return results.slice(0, 6);
  }, [markets, produceList, selectedMarketId, selectedTime, selectedProduceId]);

  return (
    <div className="home-extra-sections-wrapper">

      <section className="mandi-ticker-strip">
        <div className="ticker-label">
          <TrendingUp size={16} />
          <span>Today's Karachi Market Rates:</span>
        </div>
        <div className="ticker-marquee-track">
          <div className="ticker-items-scroller">
            {dailyRates.concat(dailyRates).map((item, idx) => (
              <div key={idx} className="ticker-pill">
                <span className="ticker-item-icon">{item.icon}</span>
                <span className="ticker-item-name">{item.name}:</span>
                <strong className="ticker-item-price">{item.price}</strong>
                <span className={`ticker-trend ${item.dir}`}>
                  {item.dir === 'up' && '▲ '}
                  {item.dir === 'down' && '▼ '}
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="home-matcher-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="sub-badge">
              <Sparkles size={14} /> Smart Market Filter
            </span>
            <h2 className="section-main-heading">
              Select Market + Time + Fruit/Vegetable
            </h2>
            <p className="section-sub-text">
              Instantly find out which fresh fruits or vegetables are available and when across your selected markets!
            </p>
          </div>

          <div className="home-filter-box-card">
            <div className="filter-three-step-grid">

              <div className="filter-step-col">
                <label className="step-label">
                  <span className="step-badge">1</span>
                  <span>Select Specific Market</span>
                </label>
                <div className="select-wrap">
                  <MapPin size={17} className="col-icon" />
                  <select
                    value={selectedMarketId}
                    onChange={(e) => setSelectedMarketId(e.target.value)}
                  >
                    <option value="">-- All Karachi & Pakistan Markets --</option>
                    {markets.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.area})</option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="filter-step-col">
                <label className="step-label">
                  <span className="step-badge">2</span>
                  <span>Select Time / Slot</span>
                </label>
                <div className="select-wrap">
                  <Clock size={17} className="col-icon" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">-- Any Operating Time --</option>
                    <option value="morning">Morning Harvest (6:00 AM - 12:00 PM)</option>
                    <option value="evening">Afternoon / Evening (3:00 PM - 9:00 PM)</option>
                    <option value="sunday">Sunday Bachat Special</option>
                  </select>
                </div>
              </div>


              <div className="filter-step-col">
                <label className="step-label">
                  <span className="step-badge">3</span>
                  <span>Select Fruit / Vegetable</span>
                </label>
                <div className="select-wrap">
                  <Carrot size={17} className="col-icon" />
                  <select
                    value={selectedProduceId}
                    onChange={(e) => setSelectedProduceId(e.target.value)}
                  >
                    <option value="">-- All Produce & Crops --</option>
                    {produceList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.name} ({p.estimatedPrice})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="filter-status-row">
              <span className="match-counter">
                Showing <strong>{matchedHomeResults.length}</strong> matching crops
              </span>
              {(selectedMarketId || selectedTime || selectedProduceId) && (
                <button
                  onClick={() => {
                    setSelectedMarketId('');
                    setSelectedTime('');
                    setSelectedProduceId('');
                  }}
                  className="btn-clear-home-filters"
                >
                  Reset Filtration
                </button>
              )}
            </div>


            <div className="matched-crops-cards-grid">
              {matchedHomeResults.map(({ market, produce }, i) => {
                const isFav = isProduceFavorited(produce.id);
                return (
                  <div key={`${market.id}-${produce.id}-${i}`} className="home-matched-crop-card">
                    <div className="crop-img-box">
                      <img src={produce.image} alt={produce.name} loading="lazy" />
                      <span className="crop-price-pill">{produce.estimatedPrice}</span>
                      <button
                        onClick={() => toggleFavoriteProduce(produce.id, produce.name)}
                        className={`btn-crop-heart ${isFav ? 'active' : ''}`}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart
                          size={16}
                          fill={isFav ? '#e63946' : 'transparent'}
                          color="#e63946"
                          strokeWidth={2}
                        />
                      </button>
                    </div>

                    <div className="crop-details-box">
                      <div className="crop-title-row">
                        <span className="crop-emoji">{produce.icon}</span>
                        <h4>{produce.name}</h4>
                      </div>
                      <p className="crop-brief">{produce.shortDesc}</p>

                      <div
                        className="crop-market-link"
                        onClick={() => onSelectMarket && onSelectMarket(market.id)}
                      >
                        <MapPin size={13} />
                        <span>{market.name || 'Empress Market'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="sub-badge">
              <CheckCircle size={14} /> Easy Process
            </span>
            <h2 className="section-main-heading">How FreshFind Empowers You</h2>
            <p className="section-sub-text">
              Direct farm shopping made transparent, affordable, and accessible across Pakistan.
            </p>
          </div>

          <div className="steps-three-col-grid">
            <div className="step-card">
              <div className="step-card-num">01</div>
              <div className="step-card-icon green">
                <MapPin size={26} />
              </div>
              <h3>Locate Nearest Market</h3>
              <p>
                Find verified farmers markets in Saddar, Clifton, Super Highway, Gulshan, or Lahore with live GPS coordinates and directions.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card-num">02</div>
              <div className="step-card-icon amber">
                <Clock size={26} />
              </div>
              <h3>Check Timings & Auction Rates</h3>
              <p>
                Get real-time morning harvest arrival times, Sunday bazaar schedules, and official wholesale price lists before leaving home.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card-num">03</div>
              <div className="step-card-icon teal">
                <ShoppingBag size={26} />
              </div>
              <h3>Save & Support Farmers</h3>
              <p>
                Bookmark your favorite seasonal crops (like Sindhri mangoes & organic palak) and buy directly from family growers without middleman markups.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="impact-stats-banner">
        <div className="section-container">
          <div className="impact-stats-grid">
            <div className="stat-item">
              <strong className="stat-number">9+</strong>
              <span className="stat-title">Major Pakistani Markets</span>
              <p className="stat-desc">Karachi, Lahore & Islamabad</p>
            </div>
            <div className="stat-item">
              <strong className="stat-number">350+</strong>
              <span className="stat-title">Verified Farm Growers</span>
              <p className="stat-desc">Malir, Thatta, Swat & Multan</p>
            </div>
            <div className="stat-item">
              <strong className="stat-number">30-40%</strong>
              <span className="stat-title">Lower Household Spend</span>
              <p className="stat-desc">Compared to supermarket chains</p>
            </div>
            <div className="stat-item">
              <strong className="stat-number">100%</strong>
              <span className="stat-title">Pure Farm Freshness</span>
              <p className="stat-desc">Direct daily morning supplies</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="sub-badge">
              <MessageSquare size={14} /> Verified Reviews
            </span>
            <h2 className="section-main-heading">Loved By Shoppers & Growers</h2>
            <p className="section-sub-text">
              Karachi families and rural farmers share how FreshFind makes weekly shopping easier.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="quote">
                "Thanks to FreshFind, I always know the exact opening timings and morning fresh arrivals for Clifton Sunday Bachat Bazaar. I get 100% farm-fresh vegetables at nearly 40% lower prices. The smart market filter is absolutely brilliant!"
              </p>
              <div className="author-row">
                <div className="avatar-circle">FA</div>
                <div>
                  <strong>Farah Ahmed</strong>
                  <span>Shopper, Clifton Karachi</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="quote">
                "Tracking daily rates and market timings for the Super Highway New Sabzi Market used to be such a hassle. Now, I check verified prices from home and order wholesale crates directly from the best stalls."
              </p>
              <div className="author-row">
                <div className="avatar-circle">TM</div>
                <div>
                  <strong>Tariq Mahmood</strong>
                  <span>Restaurant Owner, Saddar</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="quote">
                "We harvest fresh spinach and green chilies at dawn in Malir and bring them to Empress Market. Through FreshFind, shoppers discover our stall directly, and all our organic produce sells out before noon!"
              </p>
              <div className="author-row">
                <div className="avatar-circle">HM</div>
                <div>
                  <strong>Haji Muhammad</strong>
                  <span>Organic Farmer, Malir Green Belt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="mandi-alert-newsletter">
        <div className="section-container">
          <div className="newsletter-card">
            <div className="newsletter-text">
              <span className="newsletter-tag">Free Daily Updates</span>
              <h3 style={{ color: '#ffffff' }}>Get Morning Market Auction & Rates on WhatsApp</h3>
              <p>
                Get daily official wholesale rates and fresh stock arrivals from Karachi markets and bachat bazaars delivered directly to your WhatsApp.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you! Daily market alerts subscription confirmed for Karachi.');
              }}
              className="newsletter-form"
            >
              <input
                type="text"
                placeholder="Enter your WhatsApp number (e.g. 0335 1234567)"
                required
              />
              <button type="submit" className="btn-newsletter-join">
                <span>Subscribe Free</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
