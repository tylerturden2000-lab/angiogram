/**
 * Sidebar.jsx
 * ──────────────────────────────────────────────────────────────
 * Config-driven sidebar. Reads nav items from sidebarConfig.jsx.
 * All behaviour identical to the original Dashboard.jsx sidebar.
 *
 * Props:
 *   sidebarOpen      : boolean
 *   setSidebarOpen   : fn
 *   isFullscreen     : boolean
 *   activeView       : string
 *   setActiveView    : fn
 *   isDCM            : boolean   — true when any topology view is active
 *   theme            : 'light'|'dark'
 *   setTheme         : fn
 *   selectedRange    : string
 *   onRangeChange    : fn
 *   user             : { name, email, initials }
 *   onLogout         : fn
 *   inOverlay        : boolean   — true when rendered inside the fs overlay
 *   onOverlayClose   : fn        — call to hide the overlay sidebar
 *   badgeCounts      : object    — map of badgeKey → count
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Sun, Moon, LogOut } from 'lucide-react';

import { SIDEBAR_NAV_ITEMS, SIDEBAR_BOTTOM_NAV_ITEMS } from '../../core/config/sidebarConfig';
import TimeSelector from '../../shared/components/TimeSelector';

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  isFullscreen,
  activeView,
  setActiveView,
  isDCM,
  theme,
  setTheme,
  selectedRange,
  onRangeChange,
  user,
  onLogout,
  inOverlay = false,
  onOverlayClose,
  badgeCounts = {},
}) => {
  const navigate = useNavigate();

  /* Helper: is this nav item active? */
  const isActive = (item) => {
    if (item.key === 'DCM') return isDCM;
    return activeView === item.key;
  };

  /* Handle nav item click */
  const handleNavClick = (item) => {
    // Internal-only items (prefixed with _) have no view mapping
    if (!item.key.startsWith('_')) {
      setActiveView(item.key);
    }
    if (inOverlay) onOverlayClose?.();
  };

  /* Group nav items by section */
  const mainItems    = SIDEBAR_NAV_ITEMS.filter(i => i.section === 'main');
  const accountItems = SIDEBAR_NAV_ITEMS.filter(i => i.section === 'account');

  const expanded = sidebarOpen || inOverlay;

  return (
    <>
      {/* ── Header: hamburger + brand ─────────────────────── */}
      <div className="na-sidebar-header">
        {!isFullscreen && (
          <button
            className="na-hamburger"
            onClick={() => setSidebarOpen(p => !p)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label="Toggle sidebar"
          >
            <Menu size={15} />
          </button>
        )}

        {expanded && (
          <div
            className="na-sidebar-brand"
            onClick={() => {
              setActiveView('Empty');
              if (inOverlay) onOverlayClose?.();
            }}
            title="Go to Home"
          >
            <div className="na-sidebar-logo-mark">NA</div>
            <div className="na-sidebar-brand-text">
              <span className="na-sidebar-brand-name">Network Angiogram</span>
              <span className="na-sidebar-brand-sub">
                <span className="na-sidebar-pulse" />
                neurealm
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Search ─────────────────────────────────────────── */}
      {expanded && (
        <div className="na-sidebar-search-wrap">
          <Search size={13} />
          <input placeholder="Search…" aria-label="Search" />
          <kbd className="na-search-kbd">⌘K</kbd>
        </div>
      )}

      {/* ── Main nav ───────────────────────────────────────── */}
      {expanded && (
        <nav className="na-sidebar-nav" aria-label="Main navigation">
          <div className="na-sidebar-section-label">Navigation</div>

          {/* ADD NEW MAIN NAV ITEMS IN sidebarConfig.jsx ↓ */}
          {mainItems.map(item => (
            <button
              key={item.key}
              className={`na-sidebar-btn${isActive(item) ? ' active' : ''}`}
              onClick={() => handleNavClick(item)}
              title={item.label}
            >
              <span className="sb-icon">{item.icon}</span>
              <span className="sb-label">{item.label}</span>
            </button>
          ))}

          {/* Time range picker */}
          <div className="na-sidebar-section-label" style={{ marginTop: 6 }}>Time Range</div>
          <div style={{ padding: '0 6px 6px' }}>
            <TimeSelector selectedRange={selectedRange} onRangeChange={onRangeChange} />
          </div>

          {/* Account items */}
          <div className="na-sidebar-section-label" style={{ marginTop: 4 }}>Account</div>

          {/* ADD NEW ACCOUNT ITEMS IN sidebarConfig.jsx ↓ */}
          {accountItems.map(item => {
            const badge = item.badgeKey ? badgeCounts[item.badgeKey] : null;
            return (
              <button
                key={item.key}
                className={`na-sidebar-btn${isActive(item) ? ' active' : ''}`}
                onClick={() => handleNavClick(item)}
                title={item.label}
              >
                <span className="sb-icon">{item.icon}</span>
                <span className="sb-label">{item.label}</span>
                {badge != null && (
                  <span className="na-sidebar-badge">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── Bottom section ─────────────────────────────────── */}
      {expanded && (
        <div className="na-sidebar-bottom">
          {/* Theme toggle */}
          <div className="na-sidebar-theme-row">
            <span className="na-sidebar-theme-label">Appearance</span>
            <div className="na-theme-toggle">
              <button
                className={`na-theme-btn${theme === 'light' ? ' active' : ''}`}
                onClick={() => setTheme('light')}
                title="Light mode"
              >
                <Sun size={12} />
              </button>
              <button
                className={`na-theme-btn${theme === 'dark' ? ' active' : ''}`}
                onClick={() => setTheme('dark')}
                title="Dark mode"
              >
                <Moon size={12} />
              </button>
            </div>
          </div>

          {/* ADD NEW BOTTOM NAV ITEMS IN sidebarConfig.jsx ↓ */}
          {SIDEBAR_BOTTOM_NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`na-sidebar-btn${activeView === item.key ? ' active' : ''}`}
              onClick={() => {
                setActiveView(item.key);
                if (inOverlay) onOverlayClose?.();
              }}
              title={item.label}
              style={{ marginBottom: 6 }}
            >
              <span className="sb-icon">{item.icon}</span>
              <span className="sb-label">{item.label}</span>
            </button>
          ))}

          {/* User chip */}
          <div className="na-sidebar-user" title={user.email}>
            <div className="na-sidebar-avatar">
              {user.initials}
              <span className="na-sidebar-avatar-status" />
            </div>
            <div className="na-sidebar-user-info">
              <div className="na-sidebar-user-name">{user.name}</div>
              <div className="na-sidebar-user-email">{user.email}</div>
            </div>
          </div>

          {/* Logout */}
          <button
            className="na-logout-btn"
            onClick={() => { onLogout(); navigate('/login', { replace: true }); }}
            title="Logout"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </>
  );
};

export default Sidebar;
