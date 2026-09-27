import { useState } from 'react';
import { X, User, Lock, Mail, CheckCircle2, ArrowRight, AlertCircle, Info, ShieldCheck, LogOut } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, currentUser, onLogin, onLogout }) {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'

  // Form Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Validation Errors
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Retrieve locally stored dummy users
  function getRegisteredUsers() {
    try {
      const saved = localStorage.getItem('freshfind_demo_users');
      return saved ? JSON.parse(saved) : [
        { name: 'Demo Shopper', email: 'demo@freshfind.pk', password: 'password123' },
        { name: 'Ali Khan', email: 'ali@example.com', password: 'password123' }
      ];
    } catch {
      return [{ name: 'Demo Shopper', email: 'demo@freshfind.pk', password: 'password123' }];
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  // Handle Login Submission
  function handleLoginSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (!loginEmail.trim()) {
      newErrors.loginEmail = 'Email address is required.';
    } else if (!validateEmail(loginEmail)) {
      newErrors.loginEmail = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    if (!loginPassword) {
      newErrors.loginPassword = 'Password is required.';
    } else if (loginPassword.length < 6) {
      newErrors.loginPassword = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const users = getRegisteredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (!found) {
      setErrors({ form: 'No account found with this email. Please check your spelling or Register.' });
      return;
    }

    if (found.password !== loginPassword) {
      setErrors({ form: 'Incorrect password. (Tip: Demo password is password123)' });
      return;
    }

    // Success
    setErrors({});
    const loggedInUser = { name: found.name, email: found.email };
    setSuccessMessage(`Welcome back, ${found.name}! Signed in successfully.`);

    if (onLogin) {
      onLogin(loggedInUser);
    }

    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1200);
  }

  // Handle Signup Submission
  function handleSignupSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (!signupName.trim()) {
      newErrors.signupName = 'Full Name is required.';
    } else if (signupName.trim().length < 2) {
      newErrors.signupName = 'Name must be at least 2 characters.';
    }

    if (!signupEmail.trim()) {
      newErrors.signupEmail = 'Email address is required.';
    } else if (!validateEmail(signupEmail)) {
      newErrors.signupEmail = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    if (!signupPassword) {
      newErrors.signupPassword = 'Password is required.';
    } else if (signupPassword.length < 6) {
      newErrors.signupPassword = 'Password must be at least 6 characters long.';
    }

    if (!signupConfirmPassword) {
      newErrors.signupConfirmPassword = 'Please confirm your password.';
    } else if (signupPassword !== signupConfirmPassword) {
      newErrors.signupConfirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const users = getRegisteredUsers();
    const alreadyExists = users.some(
      (u) => u.email.toLowerCase() === signupEmail.trim().toLowerCase()
    );

    if (alreadyExists) {
      setErrors({ form: 'An account with this email already exists. Please Sign In instead.' });
      return;
    }

    // Register user locally in browser storage
    const newUser = {
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword
    };

    const updated = [...users, newUser];
    localStorage.setItem('freshfind_demo_users', JSON.stringify(updated));

    setErrors({});
    setSuccessMessage(`Account created successfully for ${newUser.name}!`);

    if (onLogin) {
      onLogin({ name: newUser.name, email: newUser.email });
    }

    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1300);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <div className="auth-icon-circle">
            <User size={22} />
          </div>
          <h2>
            {currentUser
              ? `Account Profile`
              : tab === 'login'
              ? 'Welcome Back'
              : 'Create Account'}
          </h2>
          <p>
            {currentUser
              ? 'Manage your FreshFind session and preferences'
              : 'Sign in to access your personal market notes and saved produce.'}
          </p>
          <button onClick={onClose} className="btn-modal-close" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* If user is already logged in, show current session status */}
        {currentUser ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '16px', background: '#e8f5e9', borderRadius: '50%', color: '#2e7d32', marginBottom: '14px' }}>
              <ShieldCheck size={36} />
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: '#1f2937' }}>{currentUser.name}</h3>
            <p style={{ margin: '0 0 16px 0', color: '#6c757d', fontSize: '0.9rem' }}>{currentUser.email}</p>

            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#495057', marginBottom: '20px', border: '1px solid #e9ecef' }}>
              Frontend Session Active: All your favorited markets, bookmarked produce items, and custom notes are stored locally in this browser.
            </div>

            <button
              onClick={() => {
                if (onLogout) onLogout();
                onClose();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#e63946',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
              <span>Sign Out of FreshFind</span>
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setTab('login');
                  setErrors({});
                  setSuccessMessage('');
                }}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setTab('signup');
                  setErrors({});
                  setSuccessMessage('');
                }}
              >
                Register
              </button>
            </div>

            {/* Success message banner */}
            {successMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', margin: '16px 20px 0', background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* General form error banner */}
            {errors.form && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', margin: '16px 20px 0', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.88rem' }}>
                <AlertCircle size={18} />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Forms */}
            {tab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
                {/* Email Field */}
                <div className="form-field">
                  <label>Email Address *</label>
                  <div className="input-wrap">
                    <Mail size={16} className="auth-field-icon" />
                    <input
                      type="email"
                      placeholder="e.g. demo@freshfind.pk"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (errors.loginEmail) setErrors(prev => ({ ...prev, loginEmail: '' }));
                      }}
                      className={errors.loginEmail ? 'input-error' : ''}
                    />
                  </div>
                  {errors.loginEmail && (
                    <span style={{ fontSize: '0.78rem', color: '#e63946', marginTop: '4px', display: 'block' }}>
                      {errors.loginEmail}
                    </span>
                  )}
                </div>

                {/* Password Field */}
                <div className="form-field">
                  <label>Password *</label>
                  <div className="input-wrap">
                    <Lock size={16} className="auth-field-icon" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (errors.loginPassword) setErrors(prev => ({ ...prev, loginPassword: '' }));
                      }}
                      className={errors.loginPassword ? 'input-error' : ''}
                    />
                  </div>
                  {errors.loginPassword && (
                    <span style={{ fontSize: '0.78rem', color: '#e63946', marginTop: '4px', display: 'block' }}>
                      {errors.loginPassword}
                    </span>
                  )}
                </div>

                {/* Quick Demo Hint */}
                <div style={{ fontSize: '0.78rem', color: '#6c757d', background: '#f8f9fa', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                  💡 Demo credentials: <strong>demo@freshfind.pk</strong> / <strong>password123</strong>
                </div>

                <button type="submit" className="btn-auth-submit" style={{ marginTop: '14px' }}>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="auth-form" noValidate>
                {/* Full Name */}
                <div className="form-field">
                  <label>Full Name *</label>
                  <div className="input-wrap">
                    <User size={16} className="auth-field-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Fatima Ali"
                      value={signupName}
                      onChange={(e) => {
                        setSignupName(e.target.value);
                        if (errors.signupName) setErrors(prev => ({ ...prev, signupName: '' }));
                      }}
                      className={errors.signupName ? 'input-error' : ''}
                    />
                  </div>
                  {errors.signupName && (
                    <span style={{ fontSize: '0.78rem', color: '#e63946', marginTop: '4px', display: 'block' }}>
                      {errors.signupName}
                    </span>
                  )}
                </div>

                {/* Email Address */}
                <div className="form-field">
                  <label>Email Address *</label>
                  <div className="input-wrap">
                    <Mail size={16} className="auth-field-icon" />
                    <input
                      type="email"
                      placeholder="e.g. fatima@example.com"
                      value={signupEmail}
                      onChange={(e) => {
                        setSignupEmail(e.target.value);
                        if (errors.signupEmail) setErrors(prev => ({ ...prev, signupEmail: '' }));
                      }}
                      className={errors.signupEmail ? 'input-error' : ''}
                    />
                  </div>
                  {errors.signupEmail && (
                    <span style={{ fontSize: '0.78rem', color: '#e63946', marginTop: '4px', display: 'block' }}>
                      {errors.signupEmail}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div className="form-field">
                  <label>Create Password * (Min 6 chars)</label>
                  <div className="input-wrap">
                    <Lock size={16} className="auth-field-icon" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => {
                        setSignupPassword(e.target.value);
                        if (errors.signupPassword) setErrors(prev => ({ ...prev, signupPassword: '' }));
                      }}
                      className={errors.signupPassword ? 'input-error' : ''}
                    />
                  </div>
                  {errors.signupPassword && (
                    <span style={{ fontSize: '0.78rem', color: '#e63946', marginTop: '4px', display: 'block' }}>
                      {errors.signupPassword}
                    </span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-field">
                  <label>Confirm Password *</label>
                  <div className="input-wrap">
                    <Lock size={16} className="auth-field-icon" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => {
                        setSignupConfirmPassword(e.target.value);
                        if (errors.signupConfirmPassword) setErrors(prev => ({ ...prev, signupConfirmPassword: '' }));
                      }}
                      className={errors.signupConfirmPassword ? 'input-error' : ''}
                    />
                  </div>
                  {errors.signupConfirmPassword && (
                    <span style={{ fontSize: '0.78rem', color: '#e63946', marginTop: '4px', display: 'block' }}>
                      {errors.signupConfirmPassword}
                    </span>
                  )}
                </div>

                <button type="submit" className="btn-auth-submit" style={{ marginTop: '14px' }}>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Important Disclaimer Required by Project */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px 18px', background: '#f8f9fa', borderTop: '1px solid #e9ecef', fontSize: '0.75rem', color: '#6c757d' }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Frontend Demo Mode:</strong> This is a client-side dummy authentication system for demonstration and presentation purposes. Credentials are saved locally in your browser's localStorage.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
