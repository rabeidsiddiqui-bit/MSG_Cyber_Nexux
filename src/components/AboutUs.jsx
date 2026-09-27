import { Target, Award, Leaf, CheckCircle, ShieldCheck, TrendingUp, Clock, Sparkles } from 'lucide-react';

export default function AboutUs({ _markets = [], _onNavigate }) {
  const missionFeatures = [
    {
      icon: <Leaf size={24} className="mission-icon text-green" />,
      title: 'Direct Farm-to-Table Access',
      desc: 'Connecting consumers directly with weekly bachat bazaars and organic growers, eliminating middleman markups so growers earn fairly and families eat fresher.'
    },
    {
      icon: <Clock size={24} className="mission-icon text-blue" />,
      title: 'Verified Market Timings',
      desc: 'Never show up to a closed market again. We provide verified operating days, accurate opening hours, and real-time open or closed status indicators.'
    },
    {
      icon: <TrendingUp size={24} className="mission-icon text-amber" />,
      title: 'Seasonal Harvest Intelligence',
      desc: 'Discover which fruits and vegetables are currently at their harvest peak, giving you optimal nutrition, the sweetest natural flavor, and the best prices.'
    },
    {
      icon: <ShieldCheck size={24} className="mission-icon text-emerald" />,
      title: 'Zero-Server Speed & Reliability',
      desc: 'Built as an ultra-fast client-side Single Page Application utilizing structured JSON datasets and offline intelligence for rapid, zero-lag browsing.'
    }
  ];

  const projectHighlights = [
    {
      title: 'Interactive Frontend Architecture',
      badge: 'React 18 & Vite',
      desc: 'Single Page Application with smooth navigation, instant search filtration, and bookmarking across markets and seasonal produce.'
    },
    {
      title: 'Accessible & Responsive UX',
      badge: 'Modern UI/UX',
      desc: 'Mobile-first design with smooth micro-interactions, high-contrast readable typography, and clean collapsible filter drawers.'
    },
    {
      title: 'Field Data & Verification',
      badge: 'Ground Research',
      desc: 'Curated geo-locations, contact details, operating days, and harvest cycles across major Karachi and Pakistani wholesale markets.'
    }
  ];

  return (
    <section className="about-page-section">
      <div className="about-container">
        <div className="about-header">
          <div className="badge-pill">
            <Leaf size={14} />
            <span>Techwiz 7 Project</span>
          </div>
          <h1 className="page-heading">About FreshFind</h1>
          <p className="page-lead">
            A dedicated platform to help families find local farmers markets, verify operating days and hours, and source the freshest seasonal produce across Pakistan.
          </p>
        </div>

        <div className="about-story-grid">
          <div className="story-card">
            <div className="story-icon-box">
              <Target size={24} />
            </div>
            <h2>The Problem</h2>
            <p>
              Farmers markets and bachat bazaars offer unmatched freshness and value, but finding out which market is open on what day is difficult because timings are scattered across social media, flyers, or word-of-mouth.
            </p>
            <p>
              FreshFind organizes these verified locations, schedules, and available produce in one place so anyone can find their nearest market effortlessly.
            </p>
          </div>

          <div className="story-card highlight-card">
            <div className="story-icon-box green">
              <Award size={24} />
            </div>
            <h2>Our Project Mission</h2>
            <p>
              Developed for Aptech Techwiz 7 under the "eGreen Basket" theme. We engineered this Single Page Application (SPA) using React 18.
            </p>
            <p>
              Adhering to competition guidelines, the app operates completely client-side without requiring a backend server. All market and produce data is organized in structured JSON.
            </p>
          </div>
        </div>

        {/* Core Mission Features - Replaces the empty 220px avatar space */}
        <div className="about-features-section">
          <div className="team-header-center">
            <div className="badge-pill green" style={{ margin: '0 auto 0.5rem auto' }}>
              <Sparkles size={13} />
              <span>Core Pillars</span>
            </div>
            <h2>What Makes FreshFind Unique</h2>
            <p>Empowering local communities with transparency, freshness, and accessibility.</p>
          </div>

          <div className="about-features-grid">
            {missionFeatures.map((feat, i) => (
              <div key={i} className="mission-feature-card">
                <div className="mission-feature-icon-box">
                  {feat.icon}
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Project Engineering Highlights */}
        <div className="about-disciplines-section">
          <div className="team-header-center">
            <h2>Project Engineering Highlights</h2>
            <p>How the team designed and implemented the eGreen Basket solution.</p>
          </div>

          <div className="about-disciplines-grid">
            {projectHighlights.map((disc, i) => (
              <div key={i} className="discipline-card">
                <div className="discipline-badge">{disc.badge}</div>
                <h3>{disc.title}</h3>
                <p>{disc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="tech-spec-box">
          <div className="tech-spec-head">
            <h3>Project Details</h3>
          </div>
          <div className="tech-spec-items">
            <div className="spec-badge"><CheckCircle size={15} /> <span>Built with React 18</span></div>
            <div className="spec-badge"><CheckCircle size={15} /> <span>Zero-Server JSON Storage</span></div>
            <div className="spec-badge"><CheckCircle size={15} /> <span>Built-in Assistant Chatbot</span></div>
            <div className="spec-badge"><CheckCircle size={15} /> <span>Theme: eGreen Basket</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
