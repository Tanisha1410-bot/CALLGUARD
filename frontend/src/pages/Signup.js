import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const nav = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data, error: err } = await signUp(email.trim(), password);
      if (err) throw err;
      if (data?.session) {
        nav('/');
      } else {
        setMessage('Sign up successful. Check your email for a confirmation link, then sign in.');
      }
    } catch (e2) {
      setError(e2?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>Create account</h2>
      <div style={{ opacity: 0.8, marginBottom: 16 }}>
        Or use <Link to="/phone">phone OTP</Link>
      </div>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{ width: '100%', padding: 10, marginTop: 6 }}
          />
        </label>
        <label>
          Password (min 6 chars)
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={6}
            style={{ width: '100%', padding: 10, marginTop: 6 }}
          />
        </label>
        {error ? <div style={{ color: 'crimson' }}>{error}</div> : null}
        {message ? <div style={{ color: 'seagreen' }}>{message}</div> : null}
        <button disabled={loading} type="submit" style={{ padding: 12, fontWeight: 700 }}>
          {loading ? 'Creating…' : 'Sign up'}
        </button>
      </form>
      <div style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}

