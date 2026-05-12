/**
 * TimeSelector.jsx
 * ──────────────────────────────────────────────────────────────
 * Dropdown that lets the user pick a quick time range or a
 * custom date/time.  Extracted verbatim from Dashboard.jsx —
 * zero behaviour change.
 *
 * Props:
 *   selectedRange  : string   — currently active range label
 *   onRangeChange  : fn(str)  — called when the user picks a range
 */

import React, { useState } from 'react';
import { Clock, ChevronDown, CheckCircle, Calendar, ChevronUp } from 'lucide-react';

// ── Preset quick-range options ───────────────────────────────
// ADD NEW TIME RANGE OPTIONS HERE ↓
const QUICK_RANGES = ['10 Min', '2 Hours', '4 Hours', '24 Hours'];

const TimeSelector = ({ selectedRange, onRangeChange }) => {
  const [showPicker,      setShowPicker]      = useState(false);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [cm, setCm] = useState(new Date(2026, 1, 1));
  const [sd, setSd] = useState(26);
  const [hr, setHr] = useState(22);
  const [mn, setMn] = useState(30);

  const dim   = new Date(cm.getFullYear(), cm.getMonth() + 1, 0).getDate();
  const mName = cm.toLocaleString('default', { month: 'short' });
  const yr    = cm.getFullYear();

  const handlePick = (range) => {
    onRangeChange(range);
    setShowPicker(false);
    setShowCustomRange(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button className="na-time-btn" onClick={() => setShowPicker(p => !p)}>
        <Clock size={13} color={showPicker ? 'var(--primary)' : undefined} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: showPicker ? 'var(--primary)' : undefined, flex: 1, textAlign: 'left',
        }}>
          {selectedRange}
        </span>
        <ChevronDown size={11} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
      </button>

      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => { setShowPicker(false); setShowCustomRange(false); }}
            style={{ position: 'fixed', inset: 0, zIndex: 300 }}
          />

          <div className="time-picker-popup">
            {!showCustomRange ? (
              <>
                <div className="tp-eyebrow">Time Range</div>
                {QUICK_RANGES.map(r => (
                  <div
                    key={r}
                    className={`tp-range-item${selectedRange === r ? ' active' : ''}`}
                    onClick={() => handlePick(r)}
                  >
                    {r}
                    {selectedRange === r && <CheckCircle size={12} />}
                  </div>
                ))}
                <button className="tp-custom-btn" onClick={() => setShowCustomRange(true)}>
                  <Calendar size={12} /> Custom Range
                </button>
              </>
            ) : (
              <>
                {/* Calendar header */}
                <div className="tp-calendar-header">
                  <button className="tp-cal-nav"
                    onClick={() => setCm(new Date(cm.getFullYear(), cm.getMonth() - 1, 1))}>‹</button>
                  <span className="tp-cal-title">{mName} {yr}</span>
                  <button className="tp-cal-nav"
                    onClick={() => setCm(new Date(cm.getFullYear(), cm.getMonth() + 1, 1))}>›</button>
                </div>

                {/* Day-of-week headers */}
                <div className="tp-day-grid">
                  {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} className="tp-day-hdr">{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="tp-day-grid">
                  {[...Array(dim)].map((_, i) => {
                    const day = i + 1;
                    return (
                      <div
                        key={day}
                        className={`tp-day-cell${day === sd ? ' selected' : ''}`}
                        onClick={() => setSd(day)}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                {/* Hour/minute spinners */}
                <div className="tp-time-row">
                  {[['h', hr, setHr, 24], ['m', mn, setMn, 60]].map(([l, v, s, mx], i) => (
                    <React.Fragment key={l}>
                      {i === 1 && <span className="tp-time-sep">:</span>}
                      <div className="tp-spinner-col">
                        <button className="tp-spin-btn" onClick={() => s(x => (x + 1) % mx)}>
                          <ChevronUp size={12} />
                        </button>
                        <div className="tp-time-display">{String(v).padStart(2, '0')}</div>
                        <button className="tp-spin-btn" onClick={() => s(x => (x - 1 + mx) % mx)}>
                          <ChevronDown size={12} />
                        </button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div className="tp-action-row">
                  <button className="tp-cancel" onClick={() => setShowCustomRange(false)}>Cancel</button>
                  <button className="tp-apply" onClick={() =>
                    handlePick(`${mName} ${sd}, ${String(hr).padStart(2,'0')}:${String(mn).padStart(2,'0')}`)
                  }>
                    Apply
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TimeSelector;
