import { Users, Target, Award, Leaf, CheckCircle } from 'lucide-react';
import MarketSearchFilterBar from './MarketSearchFilterBar';

export default function AboutUs({ markets = [], onNavigate }) {
  const teamMembers = [
    {
      name: 'Frontend Developer',
      role: 'React Components & Design',
      focus: 'Built the UI components, filters, and local JSON loading',
      
    },
    {
      name: 'UI/UX Designer',
      role: 'Layout & Styling',
      focus: 'Color scheme, responsive views, and user-friendly navigation',
    
    },
    {
      name: 'Content & Research',
      role: 'Produce & Market Research',
      focus: 'Collected market timings, addresses, and seasonal crops list',
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
            A simple web app to help people find local farmers markets, check what days they are open, and know what produce is fresh right now.
          </p>
        </div>

        {/* Global Market Search & Filter Bar */}
        <MarketSearchFilterBar
          markets={markets}
          onNavigate={onNavigate}
          defaultOpen={false}
          collapsible={true}
          title="Search & Filter Markets"
          subtitle="Explore local mandis and bachat bazaars directly while learning about FreshFind"
        />

        <div className="about-story-grid">
          <div className="story-card">
            <div className="story-icon-box">
              <Target size={24} />
            </div>
            <h2>The Problem</h2>
            <p>
              Farmers markets are great for fresh organic food, but finding out which market is open on what day is difficult because timings are scattered everywhere on social media or posters.
            </p>
            <p>
              FreshFind collects these timings and locations in one place so anyone can check their nearest market easily.
            </p>
          </div>

          <div className="story-card highlight-card">
            <div className="story-icon-box green">
              <Award size={24} />
            </div>
            <h2>Our Project Idea</h2>
            <p>
              Made for Aptech Techwiz 7 under the "eGreen Basket" theme. We built this Single Page Application (SPA) using React.
            </p>
            <p>
              Following the competition guidelines, the app does not need any backend server. All market and fruit data is saved in simple JSON files.
            </p>
          </div>
        </div>

        <div className="about-team-section">
          <div className="team-header-center">
            <h2>Our Project Team</h2>
            <p>Students working together on FreshFind.</p>
          </div>

          <div className="team-grid">
            {teamMembers.map((m, i) => (
              <div key={i} className="team-card">
                <div className="team-avatar-box">
                  {m.avatar ? <img src={m.avatar} alt={m.name} /> : <Users size={28} />}
                </div>
                <div className="team-info">
                  <h3>{m.name}</h3>
                  <span className="team-role">{m.role}</span>
                  <p className="team-focus">{m.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tech-spec-box">
          <div className="tech-spec-head">
            <h3>Project Details</h3>
          </div>
          <div className="tech-spec-items">
            <div className="spec-badge"><CheckCircle size={15} /> <span>Built with React</span></div>
            <div className="spec-badge"><CheckCircle size={15} /> <span>Data in JSON Files</span></div>
            <div className="spec-badge"><CheckCircle size={15} /> <span>Offline AI Chatbot</span></div>
            <div className="spec-badge"><CheckCircle size={15} /> <span>Theme: eGreen Basket</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
