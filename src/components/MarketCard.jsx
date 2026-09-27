import { MapPin, Clock, Heart, Star, ArrowRight, CheckCircle2, Calendar } from 'lucide-react';
import { isMarketOpen, getNextDay } from '../utils/timeHelpers';
import { useBookmarks } from '../context/BookmarkContext';

export default function MarketCard({ market, onSelectMarket, distance }) {
  const {
    isMarketFavorited,
    toggleFavoriteMarket
  } = useBookmarks();

  const openStatus = isMarketOpen(market);
  const nextOpen = getNextDay(market);
  const isFav = isMarketFavorited(market.id);

  function handleFavorite(e) {
    e.stopPropagation();
    toggleFavoriteMarket(market.id, market.name);
  }

  return (
    <div className="market-card" onClick={() => onSelectMarket(market.id)}>
      <div className="market-card-media">
        <img
          src={market.thumbnail}
          alt={market.name}
          className="market-thumbnail"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/market-empress-market-saddar.jpg';
          }}
        />

        <div className={`status-pill ${openStatus ? 'status-open' : 'status-closed'}`}>
          <span className="status-dot"></span>
          <span>{openStatus ? 'Open Right Now' : `Next: ${nextOpen}`}</span>
        </div>

        {/* Like (Heart) Action Button on Top Right */}
        <button
          onClick={handleFavorite}
          className={`market-card-like-btn ${isFav ? 'is-liked' : ''}`}
          title={isFav ? 'Liked! Click to remove from liked' : 'Like this market'}
          aria-label="Like market"
        >
          <Heart
            size={18}
            fill={isFav ? '#e63946' : 'rgba(0, 0, 0, 0.25)'}
            color={isFav ? '#e63946' : '#ffffff'}
          />
        </button>

        {distance && (
          <div className="distance-pill">
            <span>📍 ~{distance} km</span>
          </div>
        )}
      </div>

      <div className="market-card-body">
        <div className="card-top-row">
          <div className="area-badge">
            <MapPin size={13} />
            <span>{market.area}</span>
          </div>

          {market.category && (
            <span
              style={{
                fontSize: '0.73rem',
                fontWeight: 600,
                color: '#2b4c3f',
                background: '#e8f5e9',
                padding: '3px 8px',
                borderRadius: '12px'
              }}
            >
              {market.category}
            </span>
          )}

          <div className="rating-badge">
            <Star size={13} fill="#e9c46a" color="#e9c46a" />
            <span>{market.rating}</span>
            <small>({market.reviewCount})</small>
          </div>
        </div>

        <h3 className="market-name">{market.name}</h3>
        <p className="market-description">{market.description}</p>

        {/* Operating Days */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#495057', marginBottom: '8px' }}>
          <Calendar size={13} style={{ color: '#2a9d8f' }} />
          <span>
            <strong>Days: </strong>
            {market.operatingDays && market.operatingDays.length === 7
              ? 'Open Daily (Mon - Sun)'
              : market.operatingDays?.join(', ')}
          </span>
        </div>

        {/* Hours */}
        <div className="market-schedule-strip">
          <Clock size={14} className="schedule-icon" />
          <span>{market.hoursDisplay}</span>
        </div>

        {market.produceAvailable && (
          <div className="produce-mini-tags">
            {market.produceAvailable.slice(0, 3).map((item) => (
              <span key={item} className="mini-tag">
                {item.replace(/-/g, ' ')}
              </span>
            ))}
            {market.produceAvailable.length > 3 && (
              <span className="mini-tag more-tag">
                +{market.produceAvailable.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="market-card-footer">
          <span className="verified-badge">
            <CheckCircle2 size={14} />
            <span>{market.vendorCount} Stalls</span>
          </span>

          <span className="view-link">
            <span>Details</span>
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </div>
  );
}
