import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, Navigation, MessageCircle, HelpCircle, Building, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import MarketSearchFilterBar from './MarketSearchFilterBar';

export default function ContactUs({ onRequestLocation, userLocation, markets = [], onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [marketSelection, setMarketSelection] = useState('');
  const [inquiryType, setInquiryType] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  // Real browser location state
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'
  const [coords, setCoords] = useState(userLocation || null);
  const [selectedMapPin, setSelectedMapPin] = useState('default'); // 'user' | 'default' | marketId

  // Famous Karachi Market coordinates for interactive map pins
  const marketCoordinates = {
    default: { lat: 24.8607, lng: 67.0011, name: 'Karachi Central (Default View)' },
    empress: { lat: 24.8624, lng: 67.0253, name: 'Empress Market Saddar' },
    clifton: { lat: 24.8198, lng: 67.0315, name: 'Sunday Bachat Bazaar Clifton' },
    sabzimandi: { lat: 24.9982, lng: 67.1428, name: 'New Sabzi Mandi Super Highway' },
    dha: { lat: 24.7865, lng: 67.0673, name: 'DHA Sunday Farmers Market' },
    gulshan: { lat: 24.9127, lng: 67.0862, name: 'Gulshan-e-Iqbal Sunday Mandi' }
  };

  /**
   * Request actual browser location permission
   * Handles user allow/deny gracefully without breaking the page
   */
  function handleRequestBrowserLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }

    setLocationStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userGps = {
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
          name: 'Your Current Live Location'
        };
        setCoords(userGps);
        setSelectedMapPin('user');
        setLocationStatus('granted');
        if (onRequestLocation) {
          onRequestLocation(userGps);
        }
      },
      (err) => {
        console.warn('Geolocation access denied or failed:', err);
        setLocationStatus('denied');
        // Sensible fallback: Do not pretend to know location
        setSelectedMapPin('default');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // Determine active coordinates to show on Google Map
  const activeLocation =
    selectedMapPin === 'user' && coords
      ? coords
      : marketCoordinates[selectedMapPin] || marketCoordinates.default;

  const googleMapEmbedUrl = `https://maps.google.com/maps?q=${activeLocation.lat},${activeLocation.lng}&hl=en&z=13&output=embed`;
  const googleMapExternalUrl = `https://www.google.com/maps?q=${activeLocation.lat},${activeLocation.lng}`;

  function handleNameChange(e) {
    const val = e.target.value;
    setName(val);

    if (/\d/.test(val)) {
      setErrors((prev) => ({
        ...prev,
        name: 'Please enter alphabetic characters only (A-Z).'
      }));
    } else {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  }

  function handlePhoneChange(e) {
    const val = e.target.value;
    setPhone(val);

    if (/[a-zA-Z]/.test(val)) {
      setErrors((prev) => ({
        ...prev,
        phone: 'Phone number should only contain digits and standard symbols.'
      }));
    } else {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  }

  function handleEmailChange(e) {
    const val = e.target.value;
    setEmail(val);
    if (val.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Please provide a valid email format (e.g. name@domain.com).'
      }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  }

  function validateAll() {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full Name is required.';
    } else if (/\d/.test(name)) {
      newErrors.name = 'Name should only contain alphabets (A-Z).';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!message.trim()) {
      newErrors.message = 'Message field is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateAll()) {
      return;
    }
    setSent(true);
  }

  return (
    <section className="contact-page-section">
      <div className="contact-container">
        <div className="contact-header">
          <div className="badge-pill">
            <Mail size={14} />
            <span>Contact & Support Desk</span>
          </div>
          <h1 className="page-heading">Get in Touch With FreshFind</h1>
          <p className="page-lead">
            Have questions regarding Pakistani mandi schedules, wholesale rates, or want to list your local farm stall? Reach out anytime!
          </p>
        </div>

        {/* Global Market Search & Filter Bar */}
        <MarketSearchFilterBar
          markets={markets}
          onNavigate={onNavigate}
          defaultOpen={false}
          collapsible={true}
          title="Search & Filter Markets"
          subtitle="Looking for a specific market? Filter by area, day, or category before contacting us"
        />

        <div className="contact-layout-grid">
          <div className="contact-form-card">
            <h2>Send Us a Message</h2>
            <p className="form-subtext">Our team usually replies within 15 to 30 minutes during operating hours.</p>

            {sent ? (
              <div className="contact-success-state">
                <CheckCircle2 size={48} className="success-icon" />
                <h3>Thank you, {name}!</h3>
                <p>Your message has been received. Our team will contact you via WhatsApp ({phone || email}) shortly.</p>
                <button
                  onClick={() => {
                    setSent(false);
                    setName('');
                    setEmail('');
                    setPhone('');
                    setMessage('');
                    setSubject('');
                    setErrors({});
                  }}
                  className="btn-send-another"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="actual-contact-form" noValidate>
                <div className="form-two-cols">
                  <div className="form-field">
                    <label>Full Name * (Alphabets Only)</label>
                    <input
                      type="text"
                      placeholder="e.g. Ali Khan"
                      value={name}
                      onChange={handleNameChange}
                      className={errors.name ? 'input-error' : ''}
                      required
                    />
                    {errors.name && (
                      <div className="form-field-error">
                        <AlertCircle size={14} />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="form-field">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. ali@example.com"
                      value={email}
                      onChange={handleEmailChange}
                      className={errors.email ? 'input-error' : ''}
                      required
                    />
                    {errors.email && (
                      <div className="form-field-error">
                        <AlertCircle size={14} />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-two-cols">
                  <div className="form-field">
                    <label>Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. +92 335 7787562"
                      value={phone}
                      onChange={handlePhoneChange}
                      className={errors.phone ? 'input-error' : ''}
                      required
                    />
                    {errors.phone && (
                      <div className="form-field-error">
                        <AlertCircle size={14} />
                        <span>{errors.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="form-field">
                    <label>Related Market (Optional)</label>
                    <select
                      value={marketSelection}
                      onChange={(e) => setMarketSelection(e.target.value)}
                    >
                      <option value="">General / All Markets</option>
                      <option value="empress">Empress Market Saddar</option>
                      <option value="clifton">Sunday Bachat Bazaar Clifton</option>
                      <option value="sabzi-mandi">New Sabzi Mandi Super Highway</option>
                      <option value="dha">DHA Sunday Farmers Market</option>
                      <option value="gulshan">Gulshan-e-Iqbal Sunday Mandi</option>
                      <option value="jodia">Jodia Bazaar Kharadar</option>
                      <option value="liaquatabad">Liaquatabad Super Market</option>
                      <option value="lahore">Model Town Mandi Lahore</option>
                      <option value="islamabad">H-9 Itwar Bazaar Islamabad</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Inquiry Reason</label>
                  <div className="inquiry-type-pills">
                    {[
                      { id: 'general', label: 'General Question' },
                      { id: 'vendor', label: 'Register Farm Stall' },
                      { id: 'price', label: 'Report Price Discrepancy' },
                      { id: 'partnership', label: 'Partnership / NGO' }
                    ].map((type) => (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setInquiryType(type.id)}
                        className={`inquiry-pill-btn ${inquiryType === type.id ? 'active' : ''}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <label>Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Stall registration at Clifton Sunday Bazaar"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Your Message *</label>
                  <textarea
                    rows="6"
                    style={{ minHeight: '140px' }}
                    placeholder="Describe your inquiry, requested market addition, or question in detail..."
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
                    }}
                    className={errors.message ? 'input-error' : ''}
                    required
                  ></textarea>
                  {errors.message && (
                    <div className="form-field-error">
                      <AlertCircle size={14} />
                      <span>{errors.message}</span>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-contact-submit">
                  <Send size={16} />
                  <span>Send Message Directly</span>
                </button>
              </form>
            )}
          </div>

          <div className="contact-details-sidebar">
            <div className="contact-info-card">
              <h3>Office & Helpline Contacts</h3>
              <ul className="info-list">
                <li>
                  <Building size={18} className="info-icon" />
                  <div>
                    <strong>FreshFind Pakistan HQ:</strong>
                    <span>Suite 402, Metro Star Gate, Main Shahrah-e-Faisal, Karachi</span>
                  </div>
                </li>
                <li>
                  <Phone size={18} className="info-icon" />
                  <div>
                    <strong>Helpline:</strong>
                    <span>+92 21 3456 7890 / +92 335 7787562</span>
                  </div>
                </li>
                <li>
                  <MessageCircle size={18} className="info-icon whatsapp-green" />
                  <div>
                    <strong>WhatsApp Live Desk:</strong>
                    <span>+92 335 7787562 (24/7 Mandi Assistance)</span>
                  </div>
                </li>
                <li>
                  <Mail size={18} className="info-icon" />
                  <div>
                    <strong>Official Email:</strong>
                    <span>info@freshfind.pk</span>
                  </div>
                </li>
                <li>
                  <Clock size={18} className="info-icon" />
                  <div>
                    <strong>Support Hours:</strong>
                    <span>Mon - Sat: 7:00 AM - 9:00 PM PKT<br />Sunday: 7:30 AM - 3:00 PM PKT</span>
                  </div>
                </li>
              </ul>

              <a
                href="https://wa.me/923357787562?text=Hello%20FreshFind%20Team,%20I%20have%20an%20inquiry%20regarding%20Karachi%20markets"
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp-direct"
              >
                <MessageCircle size={17} />
                <span>Chat Instantly on WhatsApp</span>
              </a>
            </div>

            <div className="contact-faq-mini">
              <h4>
                <HelpCircle size={15} />
                <span>Quick Information</span>
              </h4>
              <p><strong>Are prices official?</strong> Yes, daily rates are cross-referenced with local agriculture market committees and daily mandi auctions.</p>
            </div>
          </div>
        </div>

        {/* ========================================================
            REQUIREMENT 5: LIVE GOOGLE MAP WITH USER LOCATION & PERMISSIONS
            ======================================================== */}
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e9ecef', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={22} style={{ color: '#2b4c3f' }} />
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1f2937' }}>Interactive Live Google Map</h3>
                </div>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
                  View mandis across the city or use your device's browser location with your permission.
                </p>
              </div>

              {/* Geolocation Trigger Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleRequestBrowserLocation}
                  disabled={locationStatus === 'requesting'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    background: locationStatus === 'granted' ? '#2b4c3f' : '#2a9d8f',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: locationStatus === 'requesting' ? 'wait' : 'pointer'
                  }}
                >
                  {locationStatus === 'requesting' ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Requesting Permission...</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={16} />
                      <span>{locationStatus === 'granted' ? 'Location Active' : 'Use My Current Location'}</span>
                    </>
                  )}
                </button>

                <a
                  href={googleMapExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    background: '#f8f9fa',
                    color: '#2b4c3f',
                    border: '1px solid #dee2e6',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <span>Open in Maps</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Permission feedback banner */}
            {locationStatus === 'granted' && coords && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '8px', marginBottom: '14px', color: '#2e7d32', fontSize: '0.88rem' }}>
                <CheckCircle2 size={16} />
                <span>
                  <strong>Location Granted:</strong> Centering map on your GPS coordinates ({coords.lat}, {coords.lng}).
                </span>
              </div>
            )}

            {locationStatus === 'denied' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', marginBottom: '14px', color: '#856404', fontSize: '0.88rem' }}>
                <AlertCircle size={16} />
                <span>
                  <strong>Location Permission Denied:</strong> Location access was not granted by your browser. Showing default central Karachi map view.
                </span>
              </div>
            )}

            {locationStatus === 'unsupported' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px', marginBottom: '14px', color: '#721c24', fontSize: '0.88rem' }}>
                <AlertCircle size={16} />
                <span>Geolocation is not supported by your current browser. Showing default Karachi map.</span>
              </div>
            )}

            {/* Quick interactive market selector pins */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6c757d', alignSelf: 'center' }}>
                Quick Map Pins:
              </span>
              {locationStatus === 'granted' && coords && (
                <button
                  type="button"
                  onClick={() => setSelectedMapPin('user')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: selectedMapPin === 'user' ? '#2b4c3f' : '#fff',
                    color: selectedMapPin === 'user' ? '#fff' : '#2b4c3f',
                    border: '1px solid #2b4c3f'
                  }}
                >
                  📍 My Location
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedMapPin('default')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedMapPin === 'default' ? '#2b4c3f' : '#fff',
                  color: selectedMapPin === 'default' ? '#fff' : '#495057',
                  border: '1px solid #ced4da'
                }}
              >
                Karachi Central
              </button>
              <button
                type="button"
                onClick={() => setSelectedMapPin('empress')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedMapPin === 'empress' ? '#2b4c3f' : '#fff',
                  color: selectedMapPin === 'empress' ? '#fff' : '#495057',
                  border: '1px solid #ced4da'
                }}
              >
                Empress Market Saddar
              </button>
              <button
                type="button"
                onClick={() => setSelectedMapPin('clifton')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedMapPin === 'clifton' ? '#2b4c3f' : '#fff',
                  color: selectedMapPin === 'clifton' ? '#fff' : '#495057',
                  border: '1px solid #ced4da'
                }}
              >
                Clifton Sunday Bazaar
              </button>
              <button
                type="button"
                onClick={() => setSelectedMapPin('sabzimandi')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedMapPin === 'sabzimandi' ? '#2b4c3f' : '#fff',
                  color: selectedMapPin === 'sabzimandi' ? '#fff' : '#495057',
                  border: '1px solid #ced4da'
                }}
              >
                Super Highway Mandi
              </button>
              <button
                type="button"
                onClick={() => setSelectedMapPin('dha')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedMapPin === 'dha' ? '#2b4c3f' : '#fff',
                  color: selectedMapPin === 'dha' ? '#fff' : '#495057',
                  border: '1px solid #ced4da'
                }}
              >
                DHA Farmers Market
              </button>
              <button
                type="button"
                onClick={() => setSelectedMapPin('gulshan')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedMapPin === 'gulshan' ? '#2b4c3f' : '#fff',
                  color: selectedMapPin === 'gulshan' ? '#fff' : '#495057',
                  border: '1px solid #ced4da'
                }}
              >
                Gulshan Sunday Mandi
              </button>
            </div>

            {/* The Actual Interactive Google Map Embed */}
            <div style={{ width: '100%', height: '380px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
              <iframe
                title={`FreshFind Map - ${activeLocation.name}`}
                src={googleMapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.82rem', color: '#6c757d' }}>
              <span>
                Currently Displaying: <strong>{activeLocation.name}</strong> ({activeLocation.lat}, {activeLocation.lng})
              </span>
              <span>Interactive Google Map • Drag, pan or zoom to explore</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
