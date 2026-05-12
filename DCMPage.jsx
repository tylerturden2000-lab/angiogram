/**
 * DCMPage.jsx  (Data Center Manager)
 * ──────────────────────────────────────────────────────────────
 * Topology portfolio + view selector.  Extracted verbatim from
 * Dashboard.jsx's DCM branch — zero behaviour change.
 *
 * Props:
 *   portfolios        : array
 *   allViews          : array
 *   loadingPortfolios : boolean
 *   loadingViews      : boolean
 *   selectedPortfolio : object|null
 *   setSelectedPortfolio : fn
 *   activeDbView      : string
 *   setActiveView     : fn
 *   setActiveDbView   : fn
 *   setIsFullscreen   : fn
 */

import React from 'react';
import {
  Briefcase, CheckCircle, ChevronRight,
  BarChart2, Activity, Zap,
} from 'lucide-react';

import { getViewsForPortfolio, normalisePortfolio } from '../../shared/utils/portfolioUtils';
import { getIcon } from '../../core/config/iconConfig';

const DCMPage = ({
  portfolios,
  allViews,
  loadingPortfolios,
  loadingViews,
  selectedPortfolio,
  setSelectedPortfolio,
  activeDbView,
  setActiveView,
  setActiveDbView,
  setIsFullscreen,
}) => {
  const visibleViews = getViewsForPortfolio(selectedPortfolio, allViews, portfolios);

  return (
    <div className="dashboard-page">

      {/* ── Page header ───────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Data Center Manager</div>
          <h2 className="page-title">Topology Selector</h2>
          <p className="page-sub">
            Choose a portfolio and a service view to begin monitoring
          </p>
        </div>
        <div className="page-header-stats">
          <div className="page-header-stat">
            <span className="page-header-stat-val">
              {loadingPortfolios ? '…' : portfolios.length}
            </span>
            <span className="page-header-stat-lbl">Portfolios</span>
          </div>
          <div className="page-header-stat">
            <span className="page-header-stat-val">
              {loadingViews ? '…' : allViews.length}
            </span>
            <span className="page-header-stat-lbl">Services</span>
          </div>
          <div className="page-header-stat">
            <span className="page-header-stat-val" style={{ color: 'var(--green)' }}>98.5%</span>
            <span className="page-header-stat-lbl">Health</span>
          </div>
        </div>
      </div>

      {/* ── Summary stat cards ────────────────────────────── */}
      <div className="stat-cards-row">
        {[
          {
            delay: '0s',
            icon:  <BarChart2 size={15} />,
            label: 'Total Portfolios',
            value: loadingPortfolios ? '…' : portfolios.length,
            color: 'var(--primary)',
            sparks:[14,10,16,12,18,14,20,15,22,18,24,16],
          },
          {
            delay: '0.06s',
            icon:  <Activity size={15} />,
            label: 'Active Services',
            value: loadingViews ? '…' : allViews.length,
            color: 'var(--blue)',
            sparks:[12,18,14,22,16,20,18,24,20,26,22,28],
          },
          {
            delay: '0.12s',
            icon:  <CheckCircle size={15} color="var(--green)" />,
            label: 'Network Health',
            value: '98.5',
            unit:  '%',
            color: 'var(--green)',
            sparks:[20,22,18,24,22,26,24,28,26,30,28,32],
          },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: s.delay }}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-row">
              <div className="stat-card-value" style={s.color ? { color: s.color } : {}}>
                {s.value}{s.unit && <span className="stat-card-unit">{s.unit}</span>}
              </div>
            </div>
            <div className="stat-spark-row">
              {s.sparks.map((h, j) => (
                <div key={j} className="stat-spark-bar" style={{
                  height: `${h}px`,
                  background: j > 8 ? s.color : 'var(--border)',
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column selector ───────────────────────────── */}
      <div className="dcm-grid">

        {/* ── Portfolios column ─────────────────────────── */}
        <div className="dcm-col">
          <div className="dcm-col-header">
            <div>
              <div className="dcm-eyebrow">Infrastructure</div>
              <div className="dcm-title">Portfolios</div>
            </div>
            <span className="dcm-count">{portfolios.length}</span>
          </div>

          {loadingPortfolios ? (
            <div className="dcm-loading">
              <div className="dcm-spinner" /><span>Loading…</span>
            </div>
          ) : portfolios.length === 0 ? (
            <div className="dcm-loading"><span>No portfolios found</span></div>
          ) : (
            /* ADD NEW PORTFOLIO DISPLAY LOGIC HERE ↓
               (data comes from the API; see useTopologyData.js) */
            portfolios.map((p, i) => {
              const norm  = normalisePortfolio(p);
              const isSel = selectedPortfolio?.name === norm.name;
              return (
                <div
                  key={i}
                  className={`portfolio-item${isSel ? ' selected' : ''}`}
                  onClick={() => setSelectedPortfolio(norm)}
                >
                  <div className="portfolio-item-icon"><Briefcase size={13} /></div>
                  <span className="portfolio-item-name">{norm.name}</span>
                  {isSel && <CheckCircle size={12} className="portfolio-item-check" />}
                </div>
              );
            })
          )}
        </div>

        {/* ── Service views column ──────────────────────── */}
        <div className="dcm-col" style={{
          borderColor: selectedPortfolio ? 'var(--primary-bdr)' : 'var(--border)',
          transition: 'border-color .2s',
        }}>
          <div className="dcm-col-header">
            <div>
              <div className="dcm-eyebrow">Topology</div>
              <div className="dcm-title">Service Views</div>
            </div>
            {selectedPortfolio
              ? <span className="dcm-count">{visibleViews.length}</span>
              : <span className="dcm-hint">Select a portfolio</span>}
          </div>

          <div style={{
            opacity: selectedPortfolio ? 1 : 0.35,
            pointerEvents: selectedPortfolio ? 'auto' : 'none',
            transition: 'opacity .2s',
          }}>
            {loadingViews ? (
              <div className="dcm-loading">
                <div className="dcm-spinner" /><span>Loading views…</span>
              </div>
            ) : visibleViews.length === 0 ? (
              <div className="dcm-loading"><span>No views configured</span></div>
            ) : (
              /* ADD NEW VIEW TYPES / CUSTOM RENDERERS IN viewRegistry.jsx ↓ */
              visibleViews.map(item => {
                const isActiveView = activeDbView === item.viewKey;
                return (
                  <div
                    key={item.viewKey}
                    className={`view-item${isActiveView ? ' selected' : ''}`}
                    onClick={() => {
                      setActiveView(item.label);
                      setActiveDbView(item.viewKey);
                      setIsFullscreen(true);
                    }}
                  >
                    <div
                      className="view-item-icon"
                      style={{ background: `linear-gradient(135deg,${item.color},${item.color}bb)` }}
                    >
                      {getIcon(item.icon)}
                    </div>
                    <div className="view-item-text">
                      <div className="view-item-name">{item.label}</div>
                      <div className="view-item-key">{item.viewKey}</div>
                    </div>
                    {isActiveView
                      ? <CheckCircle size={12} className="view-item-check" />
                      : <ChevronRight size={14} className="view-item-arrow" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DCMPage;
