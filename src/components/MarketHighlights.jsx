import { Sparkles, ArrowRight, Flame, CalendarCheck } from 'lucide-react';
import MarketCard from './MarketCard';
import { isMarketOpen } from '../utils/timeHelpers';

export default function MarketHighlights({ markets, onSelectMarket, onNavigateDirectory, onExploreSeasonal }) {
  const openMarkets = markets.filter(m => isMarketOpen(m));
  const featured = markets.slice(0, 6);
  const cardsToShow = openMarkets.length >= 4 ? openMarkets.slice(0, 6) : featured;

  return (
    <section className="highlights-section">
      <div className="highlights-container">
        <div className="section-head-row">
          <div>
            <div className="section-eyebrow">
              <Sparkles size={14} className="sparkle-gold" />
              <span>Highlights</span>
            </div>
            <h2 className="section-title">
              {openMarkets.length > 0 ? "Markets Open Right Now & This Week" : "Featured Farmers Markets"}
            </h2>
            <p className="section-subtitle">
              Hand-picked community markets boasting fresh organic produce and farm goods.
            </p>
          </div>

          <button onClick={onNavigateDirectory} className="btn-link-all">
            <span>View All ({markets.length}) Markets</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {openMarkets.length > 0 && (
          <div className="live-open-banner">
            <div className="pulse-indicator">
              <span className="live-ping"></span>
              <span className="live-dot"></span>
            </div>
            <span>
              <strong>Open Now:</strong> {openMarkets.length} market{openMarkets.length > 1 ? 's are' : ' is'} open for visitors today!
            </span>
          </div>
        )}

        <div className="highlights-grid">
          {cardsToShow.map((m) => (
            <MarketCard
              key={m.id}
              market={m}
              onSelectMarket={onSelectMarket}
            />
          ))}
        </div>

        <div className="seasonal-promo-strip">
          <div className="promo-info">
            <div className="promo-tag">
              <Flame size={15} />
              <span>eGreen Basket</span>
            </div>
            <h3>Wondering what to buy this week?</h3>
            <p>
              Check out our seasonal Product Guide to see what is freshly harvested and best to eat right now.
            </p>
          </div>
          <button onClick={onExploreSeasonal} className="btn-promo-cta">
            <CalendarCheck size={17} />
            <span>Seasonal Guide</span>
          </button>
        </div>
      </div>
    </section>
  );
}
