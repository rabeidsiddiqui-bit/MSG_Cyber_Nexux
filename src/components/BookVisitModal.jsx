import { useState } from 'react';
import { X, Calendar, Clock, User, Phone, CheckCircle2, Sparkles, MapPin } from 'lucide-react';

const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM'
];

const visitReasons = [
  'General Shopping',
  'Fresh Vegetables & Fruits',
  'Wholesale Purchase',
  'Photography / Visit',
  'Price Research',
  'First Time Visit'
];

/**
 * BookVisitModal — Visit booking system for FreshFind markets
 * Allows users to book a visit slot at any market
 */
export default function BookVisitModal({ isOpen, onClose, market }) {
  const today = new Date().toISOString().split('T')[0];

  const [step, setStep] = useState(1); // 1 = form, 2 = confirmed
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    timeSlot: '',
    reason: 'General Shopping',
    groupSize: '1',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !market) return null;

  function validateForm() {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (min 2 characters).';
    }
    if (!formData.phone.trim() || !/^[0-9+\-\s]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number.';
    }
    if (!formData.date) {
      newErrors.date = 'Please select a visit date.';
    }
    if (!formData.timeSlot) {
      newErrors.timeSlot = 'Please choose a time slot.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    // Simulate processing (frontend only — no backend)
    setTimeout(() => {
      // Save booking to localStorage
      try {
        const bookings = JSON.parse(localStorage.getItem('freshfind_bookings') || '[]');
        bookings.push({
          id: `BK-${Date.now()}`,
          marketId: market.id,
          marketName: market.name,
          marketArea: market.area,
          ...formData,
          bookedAt: new Date().toISOString()
        });
        localStorage.setItem('freshfind_bookings', JSON.stringify(bookings));
      } catch (err) {
        console.warn('Could not save booking:', err);
      }

      setSubmitting(false);
      setStep(2);
    }, 800);
  }

  function handleClose() {
    setStep(1);
    setFormData({
      name: '', phone: '', date: '', timeSlot: '',
      reason: 'General Shopping', groupSize: '1', notes: ''
    });
    setErrors({});
    onClose();
  }

  // Get available days for the market
  const operatingDaysNote = market.operatingDays
    ? `Open: ${market.operatingDays.join(', ')}`
    : '';

  return (
    <div className="modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div
        className="bookmarks-modal-dialog"
        style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: '#e8f5e9' }}>
              <Calendar size={20} style={{ color: '#2b4c3f' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem' }}>Book a Market Visit</h2>
              <p style={{ fontSize: '0.82rem', color: '#6c757d', margin: 0 }}>
                <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {market.name} — {market.area}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-modal-close" aria-label="Close booking modal">
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Market Hours Note */}
              {operatingDaysNote && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Sparkles size={14} />
                  <span>{operatingDaysNote} — {market.hoursDisplay}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b4c3f', display: 'block', marginBottom: '6px' }}>
                  <User size={14} style={{ display: 'inline', marginRight: '5px' }} />
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahmad Ali"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px', borderRadius: '8px',
                    border: errors.name ? '1.5px solid #e63946' : '1.5px solid #c2e9d2',
                    fontSize: '0.9rem', outline: 'none',
                    background: errors.name ? '#fff5f5' : '#fff'
                  }}
                />
                {errors.name && <span style={{ color: '#e63946', fontSize: '0.78rem' }}>{errors.name}</span>}
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b4c3f', display: 'block', marginBottom: '6px' }}>
                  <Phone size={14} style={{ display: 'inline', marginRight: '5px' }} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0311-1234567"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px', borderRadius: '8px',
                    border: errors.phone ? '1.5px solid #e63946' : '1.5px solid #c2e9d2',
                    fontSize: '0.9rem', outline: 'none',
                    background: errors.phone ? '#fff5f5' : '#fff'
                  }}
                />
                {errors.phone && <span style={{ color: '#e63946', fontSize: '0.78rem' }}>{errors.phone}</span>}
              </div>

              {/* Date + Group Size row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b4c3f', display: 'block', marginBottom: '6px' }}>
                    <Calendar size={14} style={{ display: 'inline', marginRight: '5px' }} />
                    Visit Date *
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '9px 12px', borderRadius: '8px',
                      border: errors.date ? '1.5px solid #e63946' : '1.5px solid #c2e9d2',
                      fontSize: '0.9rem', outline: 'none',
                      background: errors.date ? '#fff5f5' : '#fff'
                    }}
                  />
                  {errors.date && <span style={{ color: '#e63946', fontSize: '0.78rem' }}>{errors.date}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b4c3f', display: 'block', marginBottom: '6px' }}>
                    Group Size
                  </label>
                  <select
                    value={formData.groupSize}
                    onChange={(e) => handleChange('groupSize', e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '9px 12px', borderRadius: '8px',
                      border: '1.5px solid #c2e9d2',
                      fontSize: '0.9rem', background: '#fff', outline: 'none'
                    }}
                  >
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'].map(n => (
                      <option key={n} value={n}>{n} {n === '1' ? 'person' : 'people'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Slot */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b4c3f', display: 'block', marginBottom: '8px' }}>
                  <Clock size={14} style={{ display: 'inline', marginRight: '5px' }} />
                  Preferred Time Slot *
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleChange('timeSlot', slot)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: formData.timeSlot === slot ? '2px solid #2b4c3f' : '1.5px solid #c2e9d2',
                        background: formData.timeSlot === slot ? '#2b4c3f' : '#f8fdf9',
                        color: formData.timeSlot === slot ? '#fff' : '#2b4c3f',
                        cursor: 'pointer'
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {errors.timeSlot && <span style={{ color: '#e63946', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>{errors.timeSlot}</span>}
              </div>

              {/* Visit Reason */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b4c3f', display: 'block', marginBottom: '6px' }}>
                  Purpose of Visit
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px', borderRadius: '8px',
                    border: '1.5px solid #c2e9d2',
                    fontSize: '0.9rem', background: '#fff', outline: 'none'
                  }}
                >
                  {visitReasons.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Optional Notes */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b4c3f', display: 'block', marginBottom: '6px' }}>
                  Special Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Any special requirement or item you're looking for..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px', borderRadius: '8px',
                    border: '1.5px solid #c2e9d2',
                    fontSize: '0.9rem', outline: 'none',
                    resize: 'vertical', fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer-toolbar">
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1.5px solid #dee2e6',
                  background: '#fff',
                  color: '#6c757d',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: submitting ? '#a8d5b5' : '#2b4c3f',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Calendar size={15} />
                {submitting ? 'Confirming...' : 'Confirm Visit Booking'}
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Confirmation Screen */
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px',
              background: '#e8f5e9',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={32} color="#2b4c3f" />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#2b4c3f', marginBottom: '8px' }}>
              Visit Booked Successfully! 🎉
            </h3>
            <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '20px' }}>
              Your visit has been confirmed. Please save these details.
            </p>

            <div style={{
              background: '#f8fdf9',
              border: '1px solid #c2e9d2',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              {[
                ['Market', `${market.name} (${market.area})`],
                ['Name', formData.name],
                ['Phone', formData.phone],
                ['Date', formData.date],
                ['Time', formData.timeSlot],
                ['Group', `${formData.groupSize} ${formData.groupSize === '1' ? 'person' : 'people'}`],
                ['Purpose', formData.reason],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e9f5eb', fontSize: '0.87rem' }}>
                  <span style={{ fontWeight: 600, color: '#2b4c3f' }}>{label}:</span>
                  <span style={{ color: '#495057', textAlign: 'right', maxWidth: '65%' }}>{value}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.78rem', color: '#adb5bd', marginBottom: '20px' }}>
              📌 Your booking is saved locally on this device. Screenshot or note these details.
            </p>

            <button
              onClick={handleClose}
              style={{
                padding: '10px 28px',
                borderRadius: '8px',
                border: 'none',
                background: '#2b4c3f',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Close & Explore
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
