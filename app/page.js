'use client';
import { useState, useRef } from 'react';

const VALID_USERS = [
  { email: 'bane@vanecoinc.com', password: 'vaneco2024' },
];


// ── Score ring SVG ──────────────────────────────────────────────
function ScoreRing({ score, label, color }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="52" height="52" viewBox="0 0 52 52" aria-label={`${label}: ${score}`}>
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" />
        <circle
          cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
          strokeDashoffset={(circ / 4).toFixed(1)}
          strokeLinecap="round"
        />
        <text x="26" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill={color}>{score}</text>
      </svg>
      <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>{label}</div>
    </div>
  );
}

// ── Tier badge ──────────────────────────────────────────────────
function TierBadge({ tier }) {
  const map = {
    High: { bg: 'var(--green-dim)', color: 'var(--green)', border: 'rgba(61,184,122,0.25)' },
    Medium: { bg: 'var(--yellow-dim)', color: 'var(--yellow)', border: 'rgba(212,160,23,0.25)' },
    Low: { bg: 'var(--red-dim)', color: 'var(--red)', border: 'rgba(224,82,82,0.25)' },
  };
  const s = map[tier] || map.Low;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 9px',
      borderRadius: 20, background: s.bg, color: s.color,
      border: `0.5px solid ${s.border}`, letterSpacing: '0.03em',
    }}>{tier}</span>
  );
}

// ── Chip ────────────────────────────────────────────────────────
function Chip({ text }) {
  return (
    <span style={{
      fontSize: 11, padding: '3px 9px',
      borderRadius: 20, background: 'var(--bg3)', color: 'var(--text2)',
      border: '0.5px solid var(--border)', whiteSpace: 'nowrap',
    }}>{text}</span>
  );
}

// ── Prospect Card ───────────────────────────────────────────────
function ProspectCard({ prospect }) {
  const [open, setOpen] = useState(false);
  const d = prospect.data;

  const scoreColor = (s) =>
    s >= 70 ? 'var(--green)' : s >= 45 ? 'var(--yellow)' : 'var(--red)';

  if (prospect.status === 'error') {
    return (
      <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 8, color: 'var(--text3)', fontSize: 13 }}>
        {prospect.name} — scoring failed
      </div>
    );
  }

  if (!d) return null;

  return (
    <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 8, overflow: 'hidden' }}>
      {/* Header row */}
      <div
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{prospect.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d.company_summary?.slice(0, 75)}…
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <ScoreRing score={d.readiness_score} label="Ready" color={scoreColor(d.readiness_score)} />
          <ScoreRing score={d.opportunity_score} label="Oppty" color={scoreColor(d.opportunity_score)} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--amber)' }}>{d.composite_score}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</div>
          </div>
          <TierBadge tier={d.tier} />
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ borderTop: '0.5px solid var(--border)', padding: '16px 18px' }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>{d.company_summary}</p>

          <SectionLabel>Key signals detected</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {(d.key_signals || []).map((s, i) => <Chip key={i} text={s} />)}
          </div>

          <SectionLabel>ICP fit reasons</SectionLabel>
          {(d.icp_fit_reasons || []).map((r, i) => <BulletRow key={i}>{r}</BulletRow>)}

          <SectionLabel style={{ marginTop: 16 }}>Recommended action</SectionLabel>
          <BriefBox>{d.recommended_action}</BriefBox>

          <SectionLabel>Opening line for outreach</SectionLabel>
          <BriefBox italic>"{d.outreach_opening}"</BriefBox>

          <SectionLabel>Talking points</SectionLabel>
          {(d.talking_points || []).map((t, i) => <BulletRow key={i}>{t}</BulletRow>)}

          <SectionLabel style={{ marginTop: 16 }}>Anticipated objections</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(d.potential_objections || []).map((o, i) => <Chip key={i} text={o} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children, style }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7, marginTop: 14, ...style }}>
      {children}
    </div>
  );
}

function BulletRow({ children }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text)', padding: '3px 0' }}>
      <span style={{ color: 'var(--text3)', flexShrink: 0 }}>→</span>
      <span>{children}</span>
    </div>
  );
}

function BriefBox({ children, italic }) {
  return (
    <div style={{
      background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', padding: '10px 13px',
      fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 4,
      fontStyle: italic ? 'italic' : 'normal',
      borderLeft: '2px solid var(--amber)',
    }}>
      {children}
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────
export default function Home() {
const [authed, setAuthed] = useState(false);
const [loginEmail, setLoginEmail] = useState('');
const [loginPassword, setLoginPassword] = useState('');
const [loginErr, setLoginErr] = useState('');
    const [screen, setScreen] = useState('setup');
  const [icp, setIcp] = useState({});
  const [prospects, setProspects] = useState([]);
  const [filter, setFilter] = useState('All');
  const [progress, setProgress] = useState(0);
  const [setupErr, setSetupErr] = useState('');
  const [prospectErr, setProspectErr] = useState('');
  const productRef = useRef();
  const industryRef = useRef();
  const geoRef = useRef();
  const sizeMinRef = useRef();
  const sizeMaxRef = useRef();
  const signalsRef = useRef();
  const companiesRef = useRef();



  // ── Step 1 → 2 ──
  function goToStep2() {
    const product = productRef.current?.value.trim();
    if (!product) { setSetupErr('Please describe what you sell.');if (!authed) return (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px', width: 360 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} />
        <span style={{ fontWeight: 700, fontSize: 14 }}>Vaneco Prospector</span>
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="your@email.com" />
      </div>
      <div className="field">
        <label>Password</label>
        <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {loginErr && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10 }}>{loginErr}</div>}
      <button style={{ width: '100%' }} onClick={() => {
        const user = VALID_USERS.find(u => u.email === loginEmail && u.password === loginPassword);
        if (user) { setAuthed(true); setLoginErr(''); }
        else setLoginErr('Invalid email or password.');
      }}>Sign in</button>
    </div>
  </div>
); return; }
    setSetupErr('');
    setIcp({
      product,
      industry: industryRef.current?.value.trim() || 'Any',
      geography: geoRef.current?.value.trim() || 'Any',
      sizeMin: sizeMinRef.current?.value.trim() || '1',
      sizeMax: sizeMaxRef.current?.value.trim() || '10000',
      signals: signalsRef.current?.value.trim() || 'Not specified',
    });
    setScreen('prospects');
  }

  // ── Step 2 → scoring ──
  async function startScoring() {
    const raw = companiesRef.current?.value.trim();
    if (!raw) { setProspectErr('Please enter at least one company.'); return; }
    setProspectErr('');

    const names = raw.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 15);
    const initial = names.map(name => ({ name, status: 'pending', data: null }));
    setProspects(initial);
    setProgress(0);
    setScreen('scoring');

    const updated = [...initial];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'scoring' };
      setProspects([...updated]);
      try {
        const res = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: updated[i].name, icp }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        updated[i] = { ...updated[i], status: 'done', data };
      } catch {
        updated[i] = { ...updated[i], status: 'error' };
      }
      setProgress(Math.round(((i + 1) / updated.length) * 100));
      setProspects([...updated]);
    }

    setTimeout(() => setScreen('results'), 500);
  }

  // ── Stats ──
  const done = prospects.filter(p => p.status === 'done');
  const highCount = done.filter(p => p.data?.tier === 'High').length;
  const avgScore = done.length
    ? Math.round(done.reduce((a, p) => a + p.data.composite_score, 0) / done.length)
    : '—';

  // ── Filtered + sorted results ──
  const filtered = [...done]
    .filter(p => filter === 'All' || p.data?.tier === filter)
    .sort((a, b) => b.data.composite_score - a.data.composite_score);

  // ── Shared header ──
  const Header = () => (
    <div style={{ borderBottom: '0.5px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 0 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} />
      <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>Vaneco Prospector</span>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '32px 24px' }}>

        {/* ── SETUP ── */}
        {screen === 'setup' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Step 1 of 2 — ICP Configuration</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Define your ideal customer</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>The more specific, the sharper the scoring.</div>
            </div>

            <div className="field">
              <label>What do you sell? <span style={{ color: 'var(--red)' }}>*</span></label>
              <textarea ref={productRef} rows={3} placeholder="e.g. Revenue operations software that helps B2B SaaS companies shorten their sales cycle by automating pipeline reporting and forecasting." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Target industry / vertical</label>
                <input ref={industryRef} placeholder="e.g. B2B SaaS, FinTech, Manufacturing…" />
              </div>
              <div className="field">
                <label>Target geography</label>
                <input ref={geoRef} placeholder="e.g. US, DACH, CEE…" />
              </div>
              <div className="field">
                <label>Company size — min employees</label>
                <input ref={sizeMinRef} type="number" placeholder="10" />
              </div>
              <div className="field">
                <label>Company size — max employees</label>
                <input ref={sizeMaxRef} type="number" placeholder="500" />
              </div>
            </div>

            <div className="field">
              <label>Key buying signals</label>
              <textarea ref={signalsRef} rows={2} placeholder="e.g. Recent Series A/B funding, hiring Sales or RevOps roles, using Salesforce/HubSpot, launched a new product…" />
            </div>

            {setupErr && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10 }}>{setupErr}</div>}

            <button style={{ width: '100%', padding: '12px', fontSize: 14 }} onClick={goToStep2}>
              Continue — Add prospects →
            </button>
          </div>
        )}

        {/* ── PROSPECTS ── */}
        {screen === 'prospects' && (
          <div>
            <button className="ghost" style={{ marginBottom: 24, padding: '6px 12px', fontSize: 12 }} onClick={() => setScreen('setup')}>
              ← Back
            </button>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Step 2 of 2 — Prospects</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Add companies to score</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>One company name or domain per line. Up to 15. AI will score each against your ICP.</div>
            </div>

            <div className="field">
              <label>Company names or domains</label>
              <textarea ref={companiesRef} rows={10} placeholder={'Stripe\nacme.com\nNotion\nLinear\nIntercom\nFigma'} />
            </div>

            {prospectErr && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10 }}>{prospectErr}</div>}

            <button style={{ width: '100%', padding: '12px', fontSize: 14 }} onClick={startScoring}>
              Score with AI →
            </button>
          </div>
        )}

        {/* ── SCORING ── */}
        {screen === 'scoring' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Scoring prospects…</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>AI is analyzing each company against your ICP.</div>
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--amber)', width: `${progress}%`, borderRadius: 2, transition: 'width 0.4s ease' }} />
            </div>
            {prospects.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
                {p.status === 'pending' && <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--border2)', display: 'inline-block', flexShrink: 0 }} />}
                {p.status === 'scoring' && <span style={{ width: 16, height: 16, border: '2px solid var(--border2)', borderTopColor: 'var(--amber)', borderRadius: '50%', display: 'inline-block', flexShrink: 0, animation: 'spin 0.7s linear infinite' }} />}
                {p.status === 'done' && <span style={{ color: 'var(--green)', fontSize: 16, flexShrink: 0 }}>✓</span>}
                {p.status === 'error' && <span style={{ color: 'var(--red)', fontSize: 16, flexShrink: 0 }}>✕</span>}
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>
                    {p.status === 'scoring' && 'Analyzing…'}
                    {p.status === 'done' && `Score: ${p.data.composite_score} · ${p.data.tier}`}
                    {p.status === 'pending' && 'Waiting…'}
                    {p.status === 'error' && 'Failed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── RESULTS ── */}
        {screen === 'results' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Prospect Intelligence</div>
              <button className="ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => { setScreen('prospects'); setProspects([]); }}>
                New search
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {[['Scored', done.length], ['High fit', highCount], ['Avg score', avgScore]].map(([label, val]) => (
                <div key={label} style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: label === 'High fit' ? 'var(--green)' : label === 'Avg score' ? 'var(--amber)' : 'var(--text)' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {['All', 'High', 'Medium', 'Low'].map(f => (
                <button key={f} className={`ghost ${filter === f ? 'active' : ''}`} style={{ fontSize: 12, padding: '5px 14px' }} onClick={() => setFilter(f)}>
                  {f === 'All' ? 'All' : `${f} fit`}
                </button>
              ))}
            </div>

            {/* Cards */}
            {filtered.length === 0
              ? <div style={{ color: 'var(--text3)', fontSize: 13, padding: '20px 0' }}>No prospects in this tier.</div>
              : filtered.map((p, i) => <ProspectCard key={i} prospect={p} />)
            }
            {prospects.filter(p => p.status === 'error').map((p, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 8, color: 'var(--text3)', fontSize: 13 }}>
                {p.name} — scoring failed
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
