import { useState } from 'react';
import { Leaf, Sun, Snowflake, CloudRain, Wind, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { getSeason } from '../utils/timeHelpers';
import MarketSearchFilterBar from './MarketSearchFilterBar';

export default function SeasonalRecommendations({ produceList, markets = [], _onSelectMarket, onNavigate }) {
  const currentSeason = getSeason();
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);

  const seasonTabs = [
    { id: 'Spring', name: 'Spring', months: 'March – May', icon: <CloudRain size={18} /> },
    { id: 'Summer', name: 'Summer', months: 'June – August', icon: <Sun size={18} /> },
    { id: 'Autumn', name: 'Autumn', months: 'September – November', icon: <Wind size={18} /> },
    { id: 'Winter', name: 'Winter', months: 'December – February', icon: <Snowflake size={18} /> }
  ];

  const filteredItems = produceList.filter(
    p => p.season === selectedSeason || p.season === 'All Year'
  );

  return (
    <section className="seasonal-section">
      <div className="seasonal-container">
        <div className="seasonal-header">
          <div className="badge-pill green">
            <Leaf size={14} />
            <span>eGreen Basket • Seasonal Guide</span>
          </div>
          <h1 className="page-heading">Seasonal Harvest Recommendations</h1>
          <p className="page-lead">
            Eating seasonal produce reduces shipping carbon emissions and guarantees fresher food.
          </p>

          <div className="detected-season-callout">
            <Sparkles size={16} className="sparkle-icon" />
            <span>Current Calendar Season: <strong>{currentSeason}</strong></span>
          </div>
        </div>

        {/* Global Market Search & Filter Bar */}
        <MarketSearchFilterBar
          markets={markets}
          onNavigate={onNavigate}
          defaultOpen={false}
          collapsible={true}
          title="Search & Filter Markets"
          subtitle="Find local farmers markets offering fresh seasonal harvests in your area"
        />

        <div className="season-selector-grid">
          {seasonTabs.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSeason(s.id)}
              className={`season-tab-card ${selectedSeason === s.id ? 'active' : ''}`}
            >
              <div className="tab-icon-wrap">{s.icon}</div>
              <div className="tab-info">
                <h3>{s.name}</h3>
                <span className="tab-months">{s.months}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="active-season-banner">
          <div className="season-banner-text">
            <h2>{selectedSeason} Fresh Picks</h2>
            <p>Locally harvested crops available right now.</p>
          </div>
          <div className="produce-in-season-count">
            <span className="big-count">{filteredItems.length}</span>
            <span>Items in Season</span>
          </div>
        </div>

        <div className="seasonal-produce-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="seasonal-item-card">
              <img src={item.image} alt={item.name} className="seasonal-item-img" />
              <div className="seasonal-item-content">
                <div className="item-header-meta">
                  <span className="item-cat-tag">{item.category}</span>
                  <span className="item-price-tag">{item.estimatedPrice}</span>
                </div>
                <h4>{item.icon} {item.name}</h4>
                <p className="item-benefit">{item.healthBenefits}</p>
                <div className="item-storage">
                  <small>Storage: {item.storageTip}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="eco-basket-education">
          <div className="edu-card">
            <TrendingUp size={22} className="edu-icon green" />
            <h3>Nutrient Rich</h3>
            <p>Crops picked fresh during their season keep their vitamins intact.</p>
          </div>
          <div className="edu-card">
            <Leaf size={22} className="edu-icon forest" />
            <h3>Zero Food Miles</h3>
            <p>Local food doesn't need to travel in planes or refrigerated containers.</p>
          </div>
          <div className="edu-card">
            <CheckCircle2 size={22} className="edu-icon gold" />
            <h3>Help Local Farmers</h3>
            <p>Shopping from local growers supports family farms directly.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
