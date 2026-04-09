import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PhoneOtp() {
  const nav = useNavigate();
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [stage, setStage] = useState('send'); // send | verify
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function onSend(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { error: err } = await sendPhoneOtp(phone.trim());
      if (err) throw err;
      setStage('verify');
      setMessage('OTP sent. Enter the code from SMS.');
    } catch (e2) {
      setError(e2?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { error: err } = await verifyPhoneOtp(phone.trim(), token.trim());
      if (err) throw err;
      nav('/');
    } catch (e2) {
      setError(e2?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>Phone OTP</h2>
      <div style={{ opacity: 0.8, marginBottom: 16 }}>
        Prefer email? <Link to="/login">Sign in</Link> or <Link to="/signup">sign up</Link>
      </div>

      {stage === 'send' ? (
        <form onSubmit={onSend} style={{ display: 'grid', gap: 12 }}>
          <label>
            Phone (E.164 format, e.g. +14155552671)
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              required
              style={{ width: '100%', padding: 10, marginTop: 6 }}
            />
          </label>
          {error ? <div style={{ color: 'crimson' }}>{error}</div> : null}
          {message ? <div style={{ color: 'seagreen' }}>{message}</div> : null}
          <button disabled={loading} type="submit" style={{ padding: 12, fontWeight: 700 }}>
            {loading ? 'Sending…' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={onVerify} style={{ display: 'grid', gap: 12 }}>
          <label>
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              required
              style={{ width: '100%', padding: 10, marginTop: 6 }}
            />
          </label>
          <label>
            OTP code
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              inputMode="numeric"
              required
              style={{ width: '100%', padding: 10, marginTop: 6 }}
            />
          </label>
          {error ? <div style={{ color: 'crimson' }}>{error}</div> : null}
          {message ? <div style={{ color: 'seagreen' }}>{message}</div> : null}
          <button disabled={loading} type="submit" style={{ padding: 12, fontWeight: 700 }}>
            {loading ? 'Verifying…' : 'Verify & sign in'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStage('send');
              setToken('');
              setMessage('');
              setError('');
            }}
            style={{ padding: 10 }}
          >
            Start over
          </button>
        </form>
      )}
    </div>
  );
}

