'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // login | signup
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  async function handleSubmit() {
    setError('');
    setSuccess('');
    setLoading(true);
    const supabase = createClient();

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else window.location.href = '/';
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setSuccess('Check your email to confirm your account.');
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '36px', width: 360 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Vaneco Prospector</span>
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>
          {mode === 'login' ? 'Welcome back.' : 'Get started for free.'}
        </div>

        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        {error && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ fontSize: 12, color: 'var(--green)', marginBottom: 12 }}>{success}</div>}

        <button style={{ width: '100%', marginBottom: 14 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <div style={{ fontSize: 12, color: 'var(--text2)', textAlign: 'center' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={{ color: 'var(--amber)', cursor: 'pointer' }} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </div>
      </div>
    </div>
  );
}