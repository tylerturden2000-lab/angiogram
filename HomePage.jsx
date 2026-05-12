/**
 * HomePage.jsx
 * ──────────────────────────────────────────────────────────────
 * Landing / home page — config-driven via homeConfig.jsx.
 * Behaviour is identical to the original renderHomePage() in
 * Dashboard.jsx; it is simply extracted for clarity.
 *
 * Props:
 *   user           : { name }
 *   currentTime    : Date
 *   portfolioCount : number
 *   viewCount      : number
 *   setActiveView  : fn(key)
 */

import React from 'react';
import {
  Layers, BarChart2, Shield, Activity, Bell,
  TrendingUp, TrendingDown, ChevronRight, ArrowUpRight,
} from 'lucide-react';

import {
  QUICK_ACCESS_CARDS,
  DOMAIN_CHIPS,
  HOME_STAT_CARDS,
} from '../../core/config/homeConfig';

// ── Icon map for stat-card icon keys ─────────────────────────
const STAT_ICON = {
  activity: (color) => <Activity      size={15} color={color} />,
  shield:   (color) => <Shield        size={15} color={color} />,
  alert:    (color) => <Activity      size={15} color={color} />, // swap to AlertTriangle if preferred
};

const HomePage = ({ user, currentTime, portfolioCount, viewCount, setActiveView }) => {
  const hours    = currentTime.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="home-content-wrap">

      {/* ── Welcome hero ──────────────────────────────────── */}
      <div className="hero-banner">
        <div className="hero-banner-bg" />
        <div className="hero-banner-grid-overlay" />

        <div className="hero-banner-left">
          <span className="hero-app-label">Network Angiogram</span>
          <div className="hero-greeting-row">
            <span className="hero-online-tag">
              <span className="hero-pulse-dot" />
              LIVE · ALL SYSTEMS OPERATIONAL
            </span>
          </div>
          <h1 className="hero-title">
            {greeting},{' '}
            <span className="hero-title-accent">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="hero-sub">
            Real-time visibility across your entire network stack. Monitor traffic,
            detect anomalies, and resolve incidents faster than ever.
          </p>
          <div className="hero-cta-row">
            <button className="hero-cta-primary" onClick={() => setActiveView('DCM')}>
              <Layers size={14} /> Launch Topology
            </button>
            <button className="hero-cta-secondary" onClick={() => setActiveView('Assets')}>
              <BarChart2 size={14} /> View Assets
            </button>
          </div>
        </div>

        <div className="hero-banner-right">
          <div className="hero-stats-grid">
            {[
              { val: portfolioCount, lbl: 'Portfolios',  icon: <Layers   size={13} />, color: 'blue'    },
              { val: viewCount,      lbl: 'Services',    icon: <Activity size={13} />, color: 'primary' },
              { val: '98.5%',        lbl: 'Health',      icon: <Shield   size={13} />, color: 'green'   },
              { val: '24/7',         lbl: 'Monitoring',  icon: <Bell     size={13} />, color: 'amber'   },
            ].map((s, i) => (
              <div
                key={i}
                className={`hero-mini-stat hero-mini-stat--${s.color}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="hero-mini-icon">{s.icon}</div>
                <div className="hero-mini-val">{s.val}</div>
                <div className="hero-mini-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick-access cards ────────────────────────────── */}
      <div>
        <div className="section-header">
          <div>
            <span className="section-title">Quick Access</span>
            <span className="section-sub">Jump straight into your workflow</span>
          </div>
        </div>

        <div className="quick-access-grid">
          {/* ADD NEW QUICK ACCESS CARDS IN homeConfig.jsx ↓ */}
          {QUICK_ACCESS_CARDS.map((q, i) => (
            <button
              key={i}
              className={`quick-card quick-card--${q.accent}`}
              onClick={() => q.viewKey && setActiveView(q.viewKey)}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="quick-card-head">
                <div className="quick-card-icon">{q.icon}</div>
                <span className="quick-card-tag">{q.tag}</span>
              </div>
              <div className="quick-card-title">{q.title}</div>
              <div className="quick-card-desc">{q.desc}</div>
              <div className="quick-card-arrow"><ArrowUpRight size={16} /></div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Live insights ─────────────────────────────────── */}
      <div>
        <div className="section-header">
          <div>
            <span className="section-title">Live Network Insights</span>
            <span className="section-sub">Performance metrics updating in real time</span>
          </div>
          <button className="section-action" onClick={() => setActiveView('DCM')}>
            View dashboard <ArrowUpRight size={12} />
          </button>
        </div>

        <div className="stat-cards-row">
          {/* ADD NEW STAT CARDS IN homeConfig.jsx ↓ */}
          {HOME_STAT_CARDS.map((s, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="stat-card-icon">
                {STAT_ICON[s.iconKey]?.(s.color)}
              </div>
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-row">
                <div className="stat-card-value" style={{ color: s.color }}>
                  {s.value}
                  {s.unit && <span className="stat-card-unit">{s.unit}</span>}
                </div>
                <span className={`stat-card-badge ${s.badge.type}`}>
                  {s.badge.type === 'up'
                    ? <TrendingUp   size={10} />
                    : <TrendingDown size={10} />}
                  {s.badge.label}
                </span>
              </div>
              <div className="stat-progress-row">
                <span className="stat-progress-label">{s.progress.label}</span>
                <span className="stat-progress-val">{s.progress.val}</span>
              </div>
              <div className="stat-progress-track">
                <div
                  className="stat-progress-fill"
                  style={{ width: `${s.progress.pct}%`, background: s.progress.color }}
                />
              </div>
              <div className="stat-spark-row">
                {s.sparks.map((h, j) => (
                  <div
                    key={j}
                    className="stat-spark-bar"
                    style={{ height: `${h}px`, background: s.color, opacity: 0.3 + (j / 24) }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Domain chips ──────────────────────────────────── */}
      <div>
        <div className="section-header">
          <div>
            <span className="section-title">Network Domains</span>
            <span className="section-sub">Production-ready monitoring across your stack</span>
          </div>
        </div>

        <div className="domain-chips-row">
          {/* ADD NEW DOMAIN CHIPS IN homeConfig.jsx ↓ */}
          {DOMAIN_CHIPS.map((d, i) => (
            <button
              key={d.label}
              className="domain-chip"
              onClick={() => d.viewKey && setActiveView(d.viewKey)}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className={`domain-chip-icon ${d.cls}`}>{d.abbr}</div>
              <div className="domain-chip-text">
                <span className="domain-chip-label">{d.label}</span>
                <span className="domain-chip-desc">{d.desc}</span>
              </div>
              <ChevronRight size={14} className="domain-chip-arrow" />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomePage;
