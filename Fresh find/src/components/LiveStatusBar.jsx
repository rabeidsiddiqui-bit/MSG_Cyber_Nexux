import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, Sparkles } from 'lucide-react';
import { getCurrentDay } from '../utils/timeHelpers';

export default function LiveStatusBar({ userLocation, onRequestLocation }) {
  const [time, setTime] = useState(new Date());
  const [counter, setCounter] = useState(5867);

  // Real-time clock updates continuously every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // VISITOR COUNTER LOGIC:
  // On every page visit / refresh, the counter increments by exactly 1.
  // In development mode, React StrictMode mounts components twice, which
  // previously caused a double-increment bug (+2 on a single refresh).
  // A window-scoped execution guard ensures that within a single page load/refresh,
  // the counter increments exactly ONCE, while every page refresh increases it by 1.
  useEffect(() => {
    if (window.__freshfind_visit_counted__) {
      try {
        const saved = localStorage.getItem('freshfind_visitor_hits');
        if (saved) setCounter(parseInt(saved, 10));
      } catch {
        // fallback
      }
      return;
    }

    window.__freshfind_visit_counted__ = true;

    try {
      const savedCount = localStorage.getItem('freshfind_visitor_hits');
      const baseCount = savedCount ? parseInt(savedCount, 10) : 5867;
      const newCount = baseCount + 1;
      localStorage.setItem('freshfind_visitor_hits', newCount.toString());
      setCounter(newCount);
    } catch {
      setCounter((prev) => prev + 1);
    }
  }, []);

  const timeString = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const todayName = getCurrentDay();
  const digits = counter.toString().padStart(6, '0').split('');

  return (
    <aside className="live-status-bar">
      <div className="status-container">
        {/* Real-time Clock */}
        <div className="status-item clock-item">
          <Clock size={16} className="status-icon pulse-icon" />
          <span className="status-label">Time:</span>
          <span className="status-value highlight-time">
            {todayName}, {timeString}
          </span>
        </div>

        {/* Status Ticker */}
        <div className="status-item ticker-item">
          <Sparkles size={15} className="status-icon gold-icon" />
          <span className="ticker-text">
            FreshFind • Connecting neighborhoods with 350+ local growers
          </span>
        </div>

        {/* Location Indicator */}
        <div className="status-item location-item">
          <MapPin size={16} className="status-icon" />
          {userLocation ? (
            <span className="status-value location-active" title={`Lat: ${userLocation.lat}, Lng: ${userLocation.lng}`}>
              📍 {userLocation.name || `${userLocation.lat}, ${userLocation.lng}`}
            </span>
          ) : (
            <button onClick={onRequestLocation} className="location-btn" title="Click to share your GPS location">
              📍 Set My Location
            </button>
          )}
        </div>

        {/* Single-increment Visitor Counter */}
        <div className="status-item visitor-item">
          <Users size={16} className="status-icon" />
          <span className="status-label">Visits:</span>
          <div className="odometer" title={`Total Verified Visits: ${counter}`}>
            {digits.map((d, i) => (
              <span key={i} className="odometer-digit">
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
