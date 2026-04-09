import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://NGROK_URL_HERE';

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

function Header({ now }) {
  return (
    <div className="header">
      <div className="headerLeft">
        <div className="brand">
          <span className="brandShield">🛡️</span>
          <span className="brandName">CallGuard</span>
        </div>
      </div>
      <div className="headerRight">
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

  return (
    <div className="statsGrid">
      <div className="card statCard">
        <div className="statNumber statBlue">{total}</div>
        <div className="statLabel">Total Calls</div>
      </div>
      <div className="card statCard">
        <div className="statNumber statRed">{scams}</div>
        <div className="statLabel">Scams Blocked</div>
      </div>
      <div className="card statCard">
        <div className="statNumber statOrange">{suspicious}</div>
        <div className="statLabel">Suspicious</div>
      </div>
      <div className="card statCard">
        <div className="statNumber statGreen">{safe}</div>
        <div className="statLabel">Safe</div>
      </div>
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

  useEffect(() => {
    if (!result) return;
    setDisplayConfidence(0);
    const t = setTimeout(() => {
      setDisplayConfidence(clampConfidence(result.confidence));
    }, 40);
    return () => clearTimeout(t);
  }, [result]);

  async function analyze() {
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
        risk,
        reason,
        confidence,
        flags,
        isNew: true,
      };
      onAddLog(newLog);
    } catch (e) {
      setError('Backend offline — check server');
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(value) {
    setPreset(value);
    if (value) setInputText(value);
  }

  const r = result ? riskMeta(result.risk) : null;

  return (
    <div className="card panel">
      <div className="panelHeader">
        <div className="panelTitle">🎤 Test Live Transcript</div>
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
        </div>
      ) : null}
    </div>
  );
}

function CallLogTable({ logs }) {
  return (
    <div className="card tableCard">
      <div className="tableHeader">
        <div className="tableTitle">📋 Call Log</div>
        <div className="countBadge">{logs.length}</div>
      </div>

      {logs.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon" aria-hidden="true">
            🔍
          </div>
          <div className="emptyText">No calls analyzed yet</div>
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
              {logs.map((log) => {
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
    </div>
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
  const [logs, setLogs] = useState(() => [
    {
      id: 1,
      caller: 'Unknown',
      number: '+91-98XXXXXX12',
      time: '10:32 AM',
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
      risk: 'SUSPICIOUS',
      reason: 'Financial keywords detected, intent unclear',
      confidence: 63,
      flags: ['Financial keywords'],
    },
    {
      id: 4,
      caller: 'Unknown',
      number: '+91-88XXXXXX21',
      time: '09:50 AM',
      risk: 'SCAM',
      reason: 'Government impersonation + legal threat',
      confidence: 91,
      flags: ['Govt impersonation', 'Legal threat'],
    },
    {
      id: 5,
      caller: 'Priya',
      number: '+91-99XXXXXX33',
      time: '09:30 AM',
      risk: 'SAFE',
      reason: 'Personal conversation, no red flags',
      confidence: 99,
      flags: [],
    },
  ]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function addLog(newLog) {
    setLogs((prev) => [newLog, ...prev]);
    if (newLog?.id) {
      window.setTimeout(() => {
        setLogs((prev) => prev.map((l) => (l.id === newLog.id ? { ...l, isNew: false } : l)));
      }, 1000);
    }
  }

  return (
    <div className="appRoot">
      <Header now={now} />
      <div className="container">
        <StatsBar logs={logs} />
        <div className="mainGrid">
          <LiveTestPanel onAddLog={addLog} />
          <CallLogTable logs={logs} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
