import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await signIn(email.trim(), password);
      if (err) throw err;
      nav('/');
    } catch (e2) {
      setError(e2?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>Sign in</h2>
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
          Password
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
        <button disabled={loading} type="submit" style={{ padding: 12, fontWeight: 700 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div style={{ marginTop: 16 }}>
        No account? <Link to="/signup">Create one</Link>
      </div>
    </div>
  );
}

