import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const LOGS_STORAGE_KEY = 'callguard.logs.v2';
const THEME_STORAGE_KEY = 'callguard.theme.v1';
const REDUCED_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
const REAL_TEST_CALLERS = [
  { caller: 'Unknown', number: '+91-98XXXXXX12' },
  { caller: 'SBI Support', number: '+91-11XXXXXX90' },
  { caller: 'Prize Center', number: '+91-70XXXXXX44' },
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatNowTime(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h === 0 ? 12 : h;
  return `${h}:${pad2(m)} ${ampm}`;
}

function riskWeight(risk) {
  const r = String(risk || '').toUpperCase();
  if (r === 'SCAM') return 100;
  if (r === 'SUSPICIOUS') return 60;
  return 20;
}

function riskMeta(risk) {
  const r = String(risk || '').toUpperCase();
  if (r === 'SCAM') {
    return {
      risk: 'SCAM',
      colorVar: '--scam-red',
      pillClass: 'pill pillScam',
      rowClass: 'row rowScam',
      emoji: '🛑',
      label: 'SCAM',
      resultClass: 'resultCard resultScam',
    };
  }
  if (r === 'SAFE') {
    return {
      risk: 'SAFE',
      colorVar: '--safe-green',
      pillClass: 'pill pillSafe',
      rowClass: 'row rowSafe',
      emoji: '✅',
      label: 'SAFE',
      resultClass: 'resultCard resultSafe',
    };
  }
  return {
    risk: 'SUSPICIOUS',
    colorVar: '--suspicious-orange',
    pillClass: 'pill pillSuspicious',
    rowClass: 'row rowSuspicious',
    emoji: '⚠️',
    label: 'SUSPICIOUS',
    resultClass: 'resultCard resultSuspicious',
  };
}

function clampConfidence(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function parseDateForSort(log) {
  if (log?.createdAt) return new Date(log.createdAt).getTime();
  return Date.now();
}

function normalizeLog(raw, idx = 0) {
  const createdAt = raw?.createdAt || new Date(Date.now() - idx * 60000).toISOString();
  return {
    id: raw?.id ?? Date.parse(createdAt) + idx,
    caller: raw?.caller || 'Unknown',
    number: raw?.number || '—',
    time: raw?.time || formatNowTime(new Date(createdAt)),
    createdAt,
    risk: riskMeta(raw?.risk).risk,
    reason: raw?.reason || 'No reason provided.',
    confidence: clampConfidence(raw?.confidence),
    flags: Array.isArray(raw?.flags) ? raw.flags : [],
    isNew: Boolean(raw?.isNew),
  };
}

function toCsv(logs) {
  const esc = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const header = ['Time', 'Caller', 'Number', 'Risk', 'Reason', 'Confidence', 'Flags'].join(',');
  const rows = logs.map((log) =>
    [
      esc(log.time),
      esc(log.caller),
      esc(log.number),
      esc(log.risk),
      esc(log.reason),
      esc(clampConfidence(log.confidence)),
      esc(Array.isArray(log.flags) ? log.flags.join(' | ') : ''),
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

function downloadTextFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

function ParticleNetwork() {
  useEffect(() => {
    if (REDUCED_MOTION) return undefined;
    const canvas = document.getElementById('particleNetwork');
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let raf = 0;
    let width = 0;
    let height = 0;
    let points = [];

    function reset() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      const count = Math.max(38, Math.floor(width / 36));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;

        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(154, 166, 181, 0.54)';
        ctx.fill();

        for (let j = i + 1; j < points.length; j += 1) {
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const alpha = 1 - dist / 120;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(154, 166, 181, ${alpha * 0.22})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = window.requestAnimationFrame(draw);
    }

    reset();
    draw();
    window.addEventListener('resize', reset);
    return () => {
      window.removeEventListener('resize', reset);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas id="particleNetwork" className="particleNetwork" aria-hidden="true" />;
}

function TiltCard({ className = '', children }) {
  if (REDUCED_MOTION) return <div className={`tiltCard ${className}`}>{children}</div>;

  function onMove(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 12;
    const rx = (0.5 - py) * 10;
    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  }

  function onLeave(e) {
    const el = e.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');
  }

  return (
    <div className={`tiltCard ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

function Header({ now, highRiskCount, theme, onToggleTheme }) {
  return (
    <div className="header">
      <div className="headerLeft">
        <div className="brand">
          <span className="brandShield">🛡️</span>
          <span className="brandName">CallGuard</span>
        </div>
      </div>
      <div className="headerRight">
        <button className="chipGhost clickable" onClick={onToggleTheme}>
          {theme === 'light' ? 'Slate Dark' : 'Slate Light'}
        </button>
        <span className="chipGhost">High risk: {highRiskCount}</span>
        <span className="liveDot" aria-hidden="true" />
        <span className="liveText">Live</span>
        <span className="headerTime">{formatNowTime(now)}</span>
      </div>
    </div>
  );
}

function StatsBar({ logs }) {
  const total = logs.length;
  const scams = logs.filter((l) => String(l.risk).toUpperCase() === 'SCAM').length;
  const suspicious = logs.filter((l) => String(l.risk).toUpperCase() === 'SUSPICIOUS').length;
  const safe = logs.filter((l) => String(l.risk).toUpperCase() === 'SAFE').length;
  const threatScore = total ? Math.round(((scams * 1 + suspicious * 0.5) / total) * 100) : 0;

  return (
    <div className="statsGrid">
      <TiltCard className="card statCard">
        <div className="statNumber statBlue">{total}</div>
        <div className="statLabel">Total Calls</div>
      </TiltCard>
      <TiltCard className="card statCard">
        <div className="statNumber statRed">{scams}</div>
        <div className="statLabel">Scams Blocked</div>
      </TiltCard>
      <TiltCard className="card statCard">
        <div className="statNumber statOrange">{suspicious}</div>
        <div className="statLabel">Suspicious</div>
      </TiltCard>
      <TiltCard className="card statCard">
        <div className="statNumber statGreen">{safe}</div>
        <div className="statLabel">Safe</div>
      </TiltCard>
      <TiltCard className="card statCard threatCard">
        <div className="threatHead">
          <span className="statLabel">Threat Level</span>
          <span className="statNumber statBlue">{threatScore}%</span>
        </div>
        <div className="threatBarTrack">
          <div className="threatBarFill" style={{ width: `${threatScore}%` }} />
        </div>
      </TiltCard>
    </div>
  );
}

function LiveTestPanel({ onAddLog }) {
  const presets = [
    'Sir aapka SBI account block hone wala hai, OTP share karo turant',
    'Hey are you coming to the meeting tomorrow at 3pm',
    'Congratulations! You won KBC 50 lakh lottery, share bank details now',
  ];

  const [inputText, setInputText] = useState('');
  const [preset, setPreset] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [displayConfidence, setDisplayConfidence] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) return;
    setDisplayConfidence(0);
    const t = setTimeout(() => {
      setDisplayConfidence(clampConfidence(result.confidence));
    }, 40);
    return () => clearTimeout(t);
  }, [result]);

  const analyze = useCallback(async () => {
    const transcript = String(inputText || '').trim();
    setError('');

    if (!transcript) {
      setError('Please paste a transcript to analyze.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const resp = await axios.post(`${API_URL}/analyze`, { transcript });
      const data = resp?.data || {};

      const risk = riskMeta(data.risk || data.risk_level || data.label).risk;
      const reason =
        data.reason ||
        data.explanation ||
        data.summary ||
        'Model analysis complete (no reason provided).';
      const confidence = clampConfidence(
        data.confidence ?? data.score ?? data.probability ?? data.confidence_pct
      );
      const flags = Array.isArray(data.flags) ? data.flags : Array.isArray(data.signals) ? data.signals : [];

      const out = { risk, reason, confidence, flags };
      setResult(out);

      const newLog = {
        id: Date.now(),
        caller: 'Test Transcript',
        number: '—',
        time: formatNowTime(new Date()),
        createdAt: new Date().toISOString(),
        risk,
        reason,
        confidence,
        flags,
        isNew: true,
      };
      onAddLog(normalizeLog(newLog));
    } catch (e) {
      setError('Backend offline — check server');
    } finally {
      setLoading(false);
    }
  }, [inputText, onAddLog]);

  useEffect(() => {
    function onGlobalKeydown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        analyze();
      }
    }
    window.addEventListener('keydown', onGlobalKeydown);
    return () => window.removeEventListener('keydown', onGlobalKeydown);
  }, [analyze]);

  async function copyResult() {
    if (!result) return;
    const payload = JSON.stringify(result, null, 2);
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1000);
  }

  function applyPreset(value) {
    setPreset(value);
    if (value) setInputText(value);
  }

  const r = result ? riskMeta(result.risk) : null;

  return (
    <TiltCard className="card panel">
      <div className="panelHeader">
        <div className="panelTitle">🎤 Test Live Transcript</div>
        <div className="kbdHint">Ctrl/Cmd + Enter</div>
      </div>

      <textarea
        className="textArea"
        placeholder="Paste a call transcript to test... e.g. Sir aapka account block hoga"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <div className="panelControls">
        <select className="select" value={preset} onChange={(e) => applyPreset(e.target.value)}>
          <option value="">Choose a preset transcript…</option>
          <option value={presets[0]}>Option 1: SBI OTP urgency</option>
          <option value={presets[1]}>Option 2: Meeting reminder</option>
          <option value={presets[2]}>Option 3: Lottery + bank details</option>
        </select>
      </div>

      <button className="btnPrimary" onClick={analyze} disabled={loading}>
        {loading ? (
          <span className="btnInline">
            <span className="spinner" aria-hidden="true" />
            Analyzing...
          </span>
        ) : (
          'Analyze Call →'
        )}
      </button>
      <div className="microHint">{inputText.trim().length} chars</div>

      {error ? <div className="errorBanner">{error}</div> : null}

      {result ? (
        <div className={`${r.resultClass} fadeInUp`}>
          <div className="resultTop">
            <div className="resultEmoji" aria-hidden="true">
              {r.emoji}
            </div>
            <div className="resultMain">
              <div className="resultRisk">{r.label}</div>
              <div className="resultReason">{result.reason}</div>
            </div>
            <div className="resultConfidence">{clampConfidence(result.confidence)}%</div>
          </div>

          <div className="confidenceWrap">
            <div className="confidenceLabelRow">
              <span className="confidenceLabel">Confidence</span>
              <span className="confidenceValue">{clampConfidence(result.confidence)}%</span>
            </div>
            <div className="confidenceTrack">
              <div
                className="confidenceFill"
                style={{
                  width: `${displayConfidence}%`,
                  background: `var(${r.colorVar})`,
                }}
              />
            </div>
          </div>

          {Array.isArray(result.flags) && result.flags.length ? (
            <div className="flagsRow">
              {result.flags.map((f, idx) => (
                <span key={`${f}-${idx}`} className="flagChip">
                  {f}
                </span>
              ))}
            </div>
          ) : null}
          <div className="resultActions">
            <button className="btnGhost" onClick={copyResult}>
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          </div>
        </div>
      ) : null}
    </TiltCard>
  );
}

function CallLogTable({ logs }) {
  const [query, setQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('LATEST');

  const filteredLogs = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    let next = logs.filter((log) => {
      const text = `${log.caller} ${log.number} ${log.reason} ${(log.flags || []).join(' ')}`.toLowerCase();
      const queryMatch = lowered ? text.includes(lowered) : true;
      const riskMatch = riskFilter === 'ALL' ? true : String(log.risk).toUpperCase() === riskFilter;
      return queryMatch && riskMatch;
    });

    if (sortBy === 'CONF_DESC') {
      next = [...next].sort((a, b) => clampConfidence(b.confidence) - clampConfidence(a.confidence));
    } else if (sortBy === 'CONF_ASC') {
      next = [...next].sort((a, b) => clampConfidence(a.confidence) - clampConfidence(b.confidence));
    } else {
      next = [...next].sort((a, b) => parseDateForSort(b) - parseDateForSort(a));
    }
    return next;
  }, [logs, query, riskFilter, sortBy]);

  return (
    <TiltCard className="card tableCard">
      <div className="tableHeader">
        <div className="tableTitle">📋 Call Log</div>
        <div className="countBadge">{filteredLogs.length}</div>
      </div>
      <div className="tableToolbar">
        <input
          className="input"
          placeholder="Search caller, reason, flags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="select compact" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
          <option value="ALL">All Risks</option>
          <option value="SCAM">Scam</option>
          <option value="SUSPICIOUS">Suspicious</option>
          <option value="SAFE">Safe</option>
        </select>
        <select className="select compact" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="LATEST">Latest</option>
          <option value="CONF_DESC">High Confidence</option>
          <option value="CONF_ASC">Low Confidence</option>
        </select>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon" aria-hidden="true">
            🔍
          </div>
          <div className="emptyText">No calls match your filters</div>
        </div>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Caller</th>
                <th>Number</th>
                <th>Risk</th>
                <th>Reason</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const meta = riskMeta(log.risk);
                return (
                  <tr
                    key={log.id}
                    className={`${meta.rowClass} ${log.isNew ? 'rowNew' : ''}`}
                    title={Array.isArray(log.flags) && log.flags.length ? `Flags: ${log.flags.join(', ')}` : ''}
                  >
                    <td className="mono">{log.time}</td>
                    <td>{log.caller}</td>
                    <td className="mono">{log.number}</td>
                    <td>
                      <span className={meta.pillClass}>{meta.label}</span>
                    </td>
                    <td className="reasonCell">{log.reason}</td>
                    <td className="mono">{clampConfidence(log.confidence)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </TiltCard>
  );
}

function RiskTrendChart({ logs }) {
  const chartPoints = useMemo(() => {
    const sorted = [...logs].sort((a, b) => parseDateForSort(a) - parseDateForSort(b)).slice(-14);
    if (sorted.length === 0) return [];
    return sorted.map((log, idx) => {
      const x = (idx / Math.max(1, sorted.length - 1)) * 100;
      const y = 100 - riskWeight(log.risk);
      return { x, y, risk: log.risk, label: log.time };
    });
  }, [logs]);

  const polyline = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <TiltCard className="card trendCard">
      <div className="tableHeader">
        <div className="tableTitle">📈 Real-time Risk Trend</div>
        <div className="countBadge">{chartPoints.length}</div>
      </div>
      <div className="trendSub">Last 14 analyses • SAFE=low, SCAM=high</div>
      {chartPoints.length > 1 ? (
        <svg className="trendSvg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Risk trend">
          <defs>
            <linearGradient id="trendStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e1e7ee" />
              <stop offset="60%" stopColor="#aab4c0" />
              <stop offset="100%" stopColor="#7f8a98" />
            </linearGradient>
          </defs>
          <path d="M 0 100 L 100 100" stroke="rgba(255,255,255,0.1)" />
          <polyline className="trendLine" fill="none" points={polyline} stroke="url(#trendStroke)" />
          {chartPoints.map((p, idx) => (
            <circle
              key={`${p.label}-${idx}`}
              cx={p.x}
              cy={p.y}
              r="1.8"
              className={`trendDot trendDot${String(p.risk).toUpperCase()}`}
            />
          ))}
        </svg>
      ) : (
        <div className="emptyMini">Analyze at least 2 calls to see trend movement.</div>
      )}
    </TiltCard>
  );
}

function InsightsPanel({ logs }) {
  const topFlags = useMemo(() => {
    const counter = new Map();
    logs.forEach((log) => {
      (log.flags || []).forEach((flag) => {
        const key = String(flag).trim();
        if (!key) return;
        counter.set(key, (counter.get(key) || 0) + 1);
      });
    });
    return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [logs]);

  const safetyRatio = useMemo(() => {
    const total = logs.length || 1;
    const safe = logs.filter((l) => String(l.risk).toUpperCase() === 'SAFE').length;
    return Math.round((safe / total) * 100);
  }, [logs]);

  return (
    <TiltCard className="card insightsCard">
      <div className="tableHeader">
        <div className="tableTitle">✨ Threat Insights</div>
        <div className="countBadge">{logs.length}</div>
      </div>

      <div className="insightMetric">
        <div className="insightMetricTop">
          <span className="statLabel">Safety Ratio</span>
          <span className="statNumber statGreen">{safetyRatio}%</span>
        </div>
        <div className="threatBarTrack">
          <div className="safetyBarFill" style={{ width: `${safetyRatio}%` }} />
        </div>
      </div>

      <div className="insightSubTitle">Top Trigger Flags</div>
      {topFlags.length ? (
        <div className="insightChips">
          {topFlags.map(([flag, count]) => (
            <span className="flagChip" key={flag}>
              {flag} <strong>({count})</strong>
            </span>
          ))}
        </div>
      ) : (
        <div className="emptyMini">Analyze more calls to populate insights.</div>
      )}
    </TiltCard>
  );
}

function Footer() {
  return (
    <div className="footer">
      <div>© 2025 CallGuard. All rights reserved.</div>
      <div>Powered by Claude AI &amp; Whisper</div>
    </div>
  );
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) || 'dark');
  const [loadingRealData, setLoadingRealData] = useState(false);
  const [realDataError, setRealDataError] = useState('');
  const [logs, setLogs] = useState(() => {
    try {
      const stored = localStorage.getItem(LOGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.map((item, idx) => normalizeLog(item, idx)) : [];
      }
    } catch {
      // ignore JSON parse/storage errors and use defaults
    }
    return [
      {
        id: 1,
        caller: 'Unknown',
        number: '+91-98XXXXXX12',
        time: '10:32 AM',
        createdAt: new Date().toISOString(),
        risk: 'SCAM',
        reason: 'OTP request + account block threat + urgency',
        confidence: 95,
        flags: ['OTP request', 'Urgency', 'Bank impersonation'],
      },
      {
        id: 2,
        caller: 'Rahul Sharma',
        number: '+91-70XXXXXX44',
        time: '10:28 AM',
        createdAt: new Date().toISOString(),
        risk: 'SAFE',
        reason: 'Normal casual conversation detected',
        confidence: 97,
        flags: [],
      },
      {
        id: 3,
        caller: 'SBI Customer Care',
        number: '+91-11XXXXXX90',
        time: '10:15 AM',
        createdAt: new Date().toISOString(),
        risk: 'SUSPICIOUS',
        reason: 'Financial keywords detected, intent unclear',
        confidence: 63,
        flags: ['Financial keywords'],
      },
    ].map((item, idx) => normalizeLog(item, idx));
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function addLog(newLog) {
    setLogs((prev) => [newLog, ...prev]);
    if (newLog?.id) {
      window.setTimeout(() => {
        setLogs((prev) => prev.map((l) => (l.id === newLog.id ? { ...l, isNew: false } : l)));
      }, 1000);
    }
  }

  function clearLogs() {
    setLogs([]);
  }

  function exportCsv() {
    const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const csv = toCsv(logs);
    downloadTextFile(`callguard-logs-${stamp}.csv`, csv, 'text/csv;charset=utf-8');
  }

  async function loadRealData() {
    setLoadingRealData(true);
    setRealDataError('');
    try {
      const resp = await axios.get(`${API_URL}/test`);
      const results = Array.isArray(resp?.data?.results) ? resp.data.results : [];
      if (!results.length) {
        setRealDataError('No test data returned from backend.');
        return;
      }
      const nowMs = Date.now();
      const mapped = results.map((item, idx) =>
        normalizeLog(
          {
            id: nowMs + idx,
            caller: REAL_TEST_CALLERS[idx % REAL_TEST_CALLERS.length].caller,
            number: REAL_TEST_CALLERS[idx % REAL_TEST_CALLERS.length].number,
            createdAt: new Date(nowMs + idx * 1000).toISOString(),
            risk: item?.risk,
            reason: item?.reason,
            confidence: item?.confidence,
            flags: item?.flags,
            isNew: true,
          },
          idx
        )
      );
      setLogs((prev) => [...mapped, ...prev].slice(0, 200));
      window.setTimeout(() => {
        setLogs((prev) => prev.map((l) => (mapped.some((m) => m.id === l.id ? true : false) ? { ...l, isNew: false } : l)));
      }, 1200);
    } catch (error) {
      setRealDataError('Could not load live test data. Check backend.');
    } finally {
      setLoadingRealData(false);
    }
  }

  const highRiskCount = logs.filter((l) => ['SCAM', 'SUSPICIOUS'].includes(String(l.risk).toUpperCase())).length;

  return (
    <div className="appRoot">
      <ParticleNetwork />
      <div className="meshBg" aria-hidden="true" />
      <Header
        now={now}
        highRiskCount={highRiskCount}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />
      <div className="container">
        <div className="topActions">
          <button className="btnGhost" onClick={loadRealData} disabled={loadingRealData}>
            {loadingRealData ? 'Loading Data...' : 'Load Real Data'}
          </button>
          <button className="btnGhost" onClick={exportCsv} disabled={!logs.length}>
            Export CSV
          </button>
          <button className="btnGhost danger" onClick={clearLogs} disabled={!logs.length}>
            Clear Logs
          </button>
        </div>
        {realDataError ? <div className="errorBanner">{realDataError}</div> : null}
        <StatsBar logs={logs} />
        <div className="dashboardGrid">
          <div className="leftColumn">
            <LiveTestPanel onAddLog={addLog} />
            <InsightsPanel logs={logs} />
          </div>
          <div className="rightColumn">
            <CallLogTable logs={logs} />
            <RiskTrendChart logs={logs} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
