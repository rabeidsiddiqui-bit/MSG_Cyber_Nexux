import { useState } from 'react';
import { Mail, ArrowRight, Heart, Check, Leaf, Share2, MessageCircle } from 'lucide-react';
import { shareContent } from '../utils/shareHelper';
import { useBookmarks } from '../context/BookmarkContext';

export default function Footer({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const { triggerToast } = useBookmarks();

  function handleSubscribe(e) {
    e.preventDefault();
    if (email) {
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setEmail('');
      }, 3000);
    }
  }

  async function handleRecommendPlatform() {
    const res = await shareContent({
      title: 'FreshFind Pakistan - Farmers Markets & Product Guide',
      text: 'Check out FreshFind Pakistan! Find verified local farmers markets, weekly bachat bazaars, and fresh seasonal crops at direct grower prices.',
      url: window.location.origin
    });

    if (res.method === 'clipboard') {
      triggerToast('info', 'FreshFind Pakistan', true, 'Recommendation link copied to clipboard!');
    }
  }

  return (
    <footer className="fresh-footer">
      <div className="footer-top-wrap">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col brand-col">
              <div className="footer-logo" onClick={() => onNavigate('home')}>
                <div className="logo-icon-box">
                  <img
                    src="/logo.svg"
                    alt="FreshFind Logo"
                    className="brand-logo-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/logo.png';
                    }}
                  />
                </div>
                <div className="brand-text-group">
                  <div className="brand-title">
                    Fresh<span>Find</span>
                  </div>
                  <div className="brand-subtitle">Pakistan Farmers & Mandis</div>
                </div>
              </div>

              <p className="footer-about">
                Connecting families in Karachi, Lahore, and Islamabad directly with local farm mandis, seasonal harvests, and fair wholesale prices.
              </p>

              {/* Working Social Media Links */}
              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#adb5bd', display: 'block', marginBottom: '8px' }}>
                  Connect With Us:
                </span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/923357787562?text=Hello%20FreshFind%20Team"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#25D366',
                      color: '#fff',
                      textDecoration: 'none'
                    }}
                    title="Join WhatsApp Community"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#1877F2',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1rem',
                      textDecoration: 'none'
                    }}
                    title="FreshFind on Facebook"
                    aria-label="Facebook"
                  >
                    f
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textDecoration: 'none'
                    }}
                    title="FreshFind on Instagram"
                    aria-label="Instagram"
                  >
                    📸
                  </a>

                  {/* X / Twitter */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#000000',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      border: '1px solid #444'
                    }}
                    title="FreshFind on X"
                    aria-label="X"
                  >
                    𝕏
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#FF0000',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                    title="FreshFind on YouTube"
                    aria-label="YouTube"
                  >
                    ▶
                  </a>
                </div>
              </div>

              {/* Share / Recommend Action */}
              <button
                onClick={handleRecommendPlatform}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                title="Recommend FreshFind to your family and friends"
              >
                <Share2 size={14} />
                <span>Recommend FreshFind</span>
              </button>

              <div className="competition-tag">
                <Leaf size={14} className="leaf-mini" />
                <span>Techwiz 7 • eGreen Basket</span>
              </div>
            </div>

            <div className="footer-col">
              <h4>Navigation</h4>
              <ul className="footer-links">
                <li><button onClick={() => onNavigate('home')}>Home</button></li>
                <li><button onClick={() => onNavigate('about')}>About Us (/about)</button></li>
                <li><button onClick={() => onNavigate('markets')}>Find Markets (/markets)</button></li>
                <li><button onClick={() => onNavigate('produce')}>Product Guide (/produce)</button></li>
                <li><button onClick={() => onNavigate('seasonal')}>Seasonal Picks (/seasonal)</button></li>
                <li><button onClick={() => onNavigate('contact')}>Contact Us (/contact)</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Major Mandis</h4>
              <ul className="footer-links">
                <li><button onClick={() => onNavigate('market-detail', 'empress-market-saddar')}>Empress Market Saddar</button></li>
                <li><button onClick={() => onNavigate('market-detail', 'sunday-bachat-bazaar-clifton')}>Sunday Bachat Bazaar Clifton</button></li>
                <li><button onClick={() => onNavigate('market-detail', 'new-sabzi-mandi-karachi')}>New Sabzi Mandi Super Highway</button></li>
                <li><button onClick={() => onNavigate('market-detail', 'dha-farmers-market')}>DHA Sunday Farmers Market</button></li>
                <li><button onClick={() => onNavigate('market-detail', 'gulshan-sunday-mandi')}>Gulshan-e-Iqbal Sunday Mandi</button></li>
                <li><button onClick={() => onNavigate('market-detail', 'jodia-bazaar-karachi')}>Jodia Bazaar Kharadar</button></li>
              </ul>
            </div>

            <div className="footer-col newsletter-col">
              <h4>Mandi Rate Alerts</h4>
              <p>Get weekly notifications on upcoming Karachi Sunday bazaars & wholesale arrivals.</p>

              {done ? (
                <div className="newsletter-success">
                  <Check size={16} />
                  <span>Subscribed! Thank you.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="newsletter-form">
                  <div className="newsletter-input-box">
                    <Mail size={16} className="news-icon" />
                    <input
                      type="email"
                      placeholder="Enter your email or phone..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-newsletter">
                    <span>Subscribe</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <p className="copyright-text">
            © 2026 <strong>FreshFind Pakistan</strong> — Aptech Techwiz 7 Project
          </p>
          <p className="eco-note">
            <span>Made with</span> <Heart size={13} fill="#e63946" color="#e63946" /> <span>for eGreen Basket</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
