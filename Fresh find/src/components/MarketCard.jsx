import { MapPin, Clock, Heart, Bookmark, Share2, Star, ArrowRight, CheckCircle2, Calendar } from 'lucide-react';
import { isMarketOpen, getNextDay } from '../utils/timeHelpers';
import { useBookmarks } from '../context/BookmarkContext';
import { shareContent } from '../utils/shareHelper';

export default function MarketCard({ market, onSelectMarket, distance }) {
  const {
    isMarketFavorited,
    toggleFavoriteMarket,
    isMarketBookmarked,
    toggleBookmarkMarket,
    triggerToast
  } = useBookmarks();

  const openStatus = isMarketOpen(market);
  const nextOpen = getNextDay(market);
  const isFav = isMarketFavorited(market.id);
  const isBmk = isMarketBookmarked(market.id);

  function handleFavorite(e) {
    e.stopPropagation();
    toggleFavoriteMarket(market.id, market.name);
  }

  function handleBookmark(e) {
    e.stopPropagation();
    toggleBookmarkMarket(market.id, market.name);
  }

  async function handleShare(e) {
    e.stopPropagation();
    const res = await shareContent({
      title: `${market.name} - FreshFind Pakistan`,
      text: `${market.name} in ${market.area}. Timings: ${market.hoursDisplay}. Operating Days: ${(market.operatingDays || []).join(', ')}.`,
      url: window.location.origin + `/markets/${market.id}`
    });

    if (res.method === 'clipboard') {
      triggerToast('info', market.name, true, 'Market link copied to clipboard!');
    }
  }

  return (
    <div className="market-card" onClick={() => onSelectMarket(market.id)}>
      <div className="market-card-media">
        <img
          src={market.thumbnail}
          alt={market.name}
          className="market-thumbnail"
          loading="lazy"
        />

        <div className={`status-pill ${openStatus ? 'status-open' : 'status-closed'}`}>
          <span className="status-dot"></span>
          <span>{openStatus ? 'Open Right Now' : `Next: ${nextOpen}`}</span>
        </div>

        {/* Action buttons (Favorite, Bookmark, Share) */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '6px',
            zIndex: 3
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Favorite */}
          <button
            onClick={handleFavorite}
            className={`btn-bookmark-card ${isFav ? 'active' : ''}`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Favorite market"
          >
            <Heart
              size={17}
              fill={isFav ? '#e63946' : 'transparent'}
              color={isFav ? '#e63946' : '#ffffff'}
            />
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className="btn-bookmark-card"
            style={{
              background: isBmk ? 'rgba(42, 157, 143, 0.95)' : 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)'
            }}
            title={isBmk ? 'Remove from bookmarks' : 'Bookmark market'}
            aria-label="Bookmark market"
          >
            <Bookmark
              size={17}
              fill={isBmk ? '#ffffff' : 'transparent'}
              color="#ffffff"
            />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="btn-bookmark-card"
            style={{
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)'
            }}
            title="Share market details"
            aria-label="Share market"
          >
            <Share2 size={16} color="#ffffff" />
          </button>
        </div>

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
