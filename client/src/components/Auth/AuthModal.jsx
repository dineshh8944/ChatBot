import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';

const AuthModal = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (!isLogin && !fullName.trim()) {
      setFormError('Full name is required for registration');
      return;
    }

    if (!isLogin && !agreeTerms) {
      setFormError('You must agree to the terms of use & privacy policy');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (isLogin) {
        res = await login(email, password);
      } else {
        res = await register(fullName, email, password);
      }

      if (!res.success) {
        setFormError(res.message);
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background glows */}
      <div className="ambient-glow" />
      <div className="ambient-glow-secondary" />

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1000px',
        width: '90%',
        gap: '60px',
        zIndex: 1
      }}>
        {/* Left Branding Section (Screenshot 1) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{
            width: '110px',
            height: '110px',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            borderRadius: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4)',
            marginBottom: '20px'
          }}>
            <MessageSquare size={60} color="#ffffff" fill="#ffffff" style={{ opacity: 0.95 }} />
          </div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            letterSpacing: '-1px',
            background: 'linear-gradient(to right, #ffffff, #d1d5db)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            QuickChat
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '340px' }}>
            Instant, secure, real-time messaging for everyone.
          </p>
        </div>

        {/* Right Form Card (Screenshot 1) */}
        <div className="glass-panel" style={{
          flex: 1,
          maxWidth: '440px',
          width: '100%',
          padding: '40px',
          backdropFilter: 'blur(25px)',
          background: 'rgba(15, 15, 24, 0.75)'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '24px', color: '#fff' }}>
            {isLogin ? 'Welcome back' : 'Sign up'}
          </h2>

          {formError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              marginBottom: '20px'
            }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="glass-input"
                  style={{ width: '100%' }}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Email Address"
                className="glass-input"
                style={{ width: '100%' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                className="glass-input"
                style={{ width: '100%' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ accentColor: 'var(--primary-purple)', cursor: 'pointer' }}
                />
                <label htmlFor="terms" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  Agree to the terms of use & privacy policy.
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', marginTop: '10px', height: '46px' }}
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Login to Account' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <span
                  onClick={() => { setIsLogin(false); setFormError(''); }}
                  style={{ color: '#a855f7', cursor: 'pointer', fontWeight: '500' }}
                >
                  Create one here
                </span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span
                  onClick={() => { setIsLogin(true); setFormError(''); }}
                  style={{ color: '#a855f7', cursor: 'pointer', fontWeight: '500' }}
                >
                  Login here
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
