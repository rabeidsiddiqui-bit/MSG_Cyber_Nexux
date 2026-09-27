import { useState } from 'react';
import {
  MapPin,
  Heart,
  Bookmark,
  Star,
  Phone,
  Mail,
  Globe,
  Share2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Info,
  Carrot,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { isMarketOpen, getCurrentDay, days } from '../utils/timeHelpers';
import { useBookmarks } from '../context/BookmarkContext';
import { shareContent } from '../utils/shareHelper';
import BookVisitModal from './BookVisitModal';

export default function MarketDetail({
  market,
  allMarkets = [],
  allProduce = [],
  onSelectProduce,
  onBackToDirectory,
  onNavigate
}) {
  const {
    isMarketFavorited,
    toggleFavoriteMarket,
    isMarketBookmarked,
    toggleBookmarkMarket,
    itemNotes,
    updateNote,
    triggerToast
  } = useBookmarks();

  const [note, setNote] = useState(itemNotes[market?.id] || '');
  const [savedAlert, setSavedAlert] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);


  if (!market) {
    return (
      <div className="detail-not-found">
        <h2>Market Not Found</h2>
        <button onClick={onBackToDirectory} className="btn-back">
          Back to Directory
        </button>
      </div>
    );
  }

  const openNow = isMarketOpen(market);
  const currentDay = getCurrentDay();
  const isFav = isMarketFavorited(market.id);
  const isBmk = isMarketBookmarked(market.id);

  const availableProduce = allProduce.filter(p =>
    market.produceAvailable?.includes(p.id)
  );

  function handleSaveNote() {
    updateNote(market.id, note);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  }

  async function handleShare() {
    const res = await shareContent({
      title: `${market.name} - FreshFind Pakistan`,
      text: `${market.name} in ${market.area}. Hours: ${market.hoursDisplay}. Days: ${(market.operatingDays || []).join(', ')}.`,
      url: window.location.href
    });

    if (res.method === 'clipboard') {
      triggerToast('info', market.name, true, 'Market link copied to clipboard!');
    }
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(market.address)}`;
  const mapEmbed = `https://maps.google.com/maps?q=${market.coordinates.lat},${market.coordinates.lng}&hl=en&z=14&output=embed`;

  return (
    <>
      <article className="market-detail-page">
        <div className="detail-container">

        <div className="detail-hero-card">
          <div className="detail-hero-media">
            <img src={market.thumbnail} alt={market.name} className="detail-cover-img" />
            <div className="detail-hero-gradient"></div>

            <div className="detail-hero-floating-badges">
              <div className={`status-pill large ${openNow ? 'status-open' : 'status-closed'}`}>
                <span className="status-dot"></span>
                <span>{openNow ? 'Open Right Now' : 'Closed Right Now'}</span>
              </div>
            </div>
          </div>

          <div className="detail-hero-body">
            <div className="detail-top-tags">
              <span className="area-pill">
                <MapPin size={14} />
                <span>{market.area}</span>
              </span>
              {market.category && (
                <span className="area-pill" style={{ background: '#e8f5e9', color: '#2b4c3f', fontWeight: 600 }}>
                  {market.category}
                </span>
              )}
              <span className="rating-pill">
                <Star size={14} fill="#e9c46a" color="#e9c46a" />
                <span>{market.rating} / 5.0</span>
                <small>({market.reviewCount} reviews)</small>
              </span>
              <span className="est-pill">Est. {market.establishedYear}</span>
            </div>

            <h1 className="detail-title">{market.name}</h1>
            <p className="detail-tagline">"{market.tagline}"</p>

            <div className="detail-action-buttons">
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavoriteMarket(market.id, market.name)}
                className={`btn-detail-bookmark ${isFav ? 'bookmarked' : ''}`}
                title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Heart size={18} fill={isFav ? '#e63946' : 'transparent'} color={isFav ? '#e63946' : 'currentColor'} />
                <span>{isFav ? 'Favorited ❤️' : 'Add to Favorites'}</span>
              </button>

              {/* Bookmark Button */}
              <button
                onClick={() => toggleBookmarkMarket(market.id, market.name)}
                className={`btn-detail-bookmark ${isBmk ? 'bookmarked' : ''}`}
                style={isBmk ? { background: '#2a9d8f', color: '#fff', borderColor: '#2a9d8f' } : {}}
                title={isBmk ? 'Remove from Bookmarks' : 'Bookmark this market'}
              >
                <Bookmark size={18} fill={isBmk ? '#ffffff' : 'transparent'} color={isBmk ? '#ffffff' : 'currentColor'} />
                <span>{isBmk ? 'Bookmarked 🔖' : 'Bookmark'}</span>
              </button>

              {/* Share Button */}
              <button onClick={handleShare} className="btn-detail-share" title="Share this market">
                <Share2 size={17} />
                <span>Share</span>
              </button>

              {/* Book a Visit Button */}
              <button
                onClick={() => setIsBookingOpen(true)}
                className="btn-detail-share"
                style={{ background: '#2b4c3f', color: '#fff', borderColor: '#2b4c3f' }}
                title="Book a visit to this market"
              >
                <Calendar size={17} />
                <span>Book Visit</span>
              </button>

              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-detail-directions">
                <Navigation size={17} />
                <span>Directions</span>
              </a>
            </div>

          </div>
        </div>

        <div className="detail-main-layout">
          <div className="detail-left-col">
            <section className="detail-section-card">
              <h2 className="section-subtitle-icon">
                <Info size={19} />
                <span>About Market</span>
              </h2>
              <p className="detail-about-text">{market.description}</p>
              <div className="insider-tip-box">
                <strong>Best Time to Visit:</strong> {market.bestTimeToVisit}
              </div>
            </section>

            <section className="detail-section-card">
              <h2 className="section-subtitle-icon">
                <Calendar size={19} />
                <span>Weekly Schedule</span>
              </h2>
              <p className="section-lead-mini">
                Today is <strong>{currentDay}</strong>. The highlighted row is today's schedule.
              </p>

              <div className="table-responsive-wrapper">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((d) => {
                      const isToday = d === currentDay;
                      const hrs = market.scheduleDetails ? market.scheduleDetails[d] : null;

                      return (
                        <tr key={d} className={`${isToday ? 'current-day-row' : ''} ${hrs ? 'day-open' : 'day-off'}`}>
                          <td className="day-name-cell">
                            {d}
                            {isToday && <span className="today-badge">TODAY</span>}
                          </td>
                          <td className="day-hours-cell">
                            {hrs || <span className="closed-label">Closed</span>}
                          </td>
                          <td className="day-status-cell">
                            {hrs ? <span className="badge-operating">Operating</span> : <span className="badge-rest">Rest Day</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="detail-section-card">
              <div className="produce-header-row">
                <h2 className="section-subtitle-icon">
                  <Carrot size={19} />
                  <span>Available Produce</span>
                </h2>
                <span className="produce-count-badge">{availableProduce.length} Items</span>
              </div>

              <div className="market-produce-grid">
                {availableProduce.map((p) => (
                  <div
                    key={p.id}
                    className="produce-mini-card"
                    onClick={() => onSelectProduce(p.id)}
                  >
                    <img src={p.image} alt={p.name} className="produce-card-thumb" />
                    <div className="produce-card-meta">
                      <div className="meta-category-badge">{p.category}</div>
                      <h4>{p.name}</h4>
                      <span className="price-tag">{p.estimatedPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section-card">
              <h2 className="section-subtitle-icon">
                <ShieldCheck size={19} />
                <span>Amenities</span>
              </h2>
              <div className="amenities-grid">
                {market.amenities?.map((item, idx) => (
                  <div key={idx} className="amenity-item">
                    <CheckCircle2 size={16} className="amenity-check-icon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="detail-right-col">
            <div className="detail-sidebar-card">
              <h3>
                <MapPin size={18} />
                <span>Location & Map</span>
              </h3>
              <p className="address-full">{market.address}</p>

              <div className="map-frame-box">
                <iframe
                  title={market.name}
                  src={mapEmbed}
                  width="100%"
                  height="240"
                  style={{ border: 0, borderRadius: '8px' }}
                  loading="lazy"
                ></iframe>
              </div>

              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-sidebar-link">
                <span>Open in Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>

            <div className="detail-sidebar-card">
              <h3>
                <Phone size={18} />
                <span>Contact Info</span>
              </h3>
              <ul className="contact-list">
                <li><Phone size={15} /> <span>{market.phone}</span></li>
                <li><Mail size={15} /> <span>{market.email}</span></li>
                <li><Globe size={15} /> <a href={market.website} target="_blank" rel="noreferrer">Website</a></li>
              </ul>
            </div>

            <div className="detail-sidebar-card note-card">
              <h3>
                <Heart size={18} />
                <span>My Visit Note</span>
              </h3>
              <p className="note-help-text">
                Write a quick note for your visit (e.g. what to buy, stall numbers).
              </p>
              <textarea
                className="note-textarea"
                rows="3"
                placeholder="Type your personal note here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button onClick={handleSaveNote} className="btn-save-note">
                {savedAlert ? 'Note Saved!' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>

    {/* Book a Visit Modal */}
    <BookVisitModal
      isOpen={isBookingOpen}
      onClose={() => setIsBookingOpen(false)}
      market={market}
    />
    </>
  );
}
