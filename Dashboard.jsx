/**
 * Dashboard.jsx  — REFACTORED
 * ──────────────────────────────────────────────────────────────
 * Top-level orchestrator.  All UI, data-fetching, and config
 * concerns have been extracted to dedicated files:
 *
 *   Config  →  src/core/config/
 *   Layout  →  src/core/layout/Sidebar.jsx
 *   Hooks   →  src/shared/hooks/
 *   Utils   →  src/shared/utils/
 *   Pages   →  src/modules/*/
 *
 * ── HOW TO ADD NEW CAPABILITIES ──────────────────────────────
 *
 *   New sidebar item  →  src/core/config/sidebarConfig.jsx
 *   New full-page view→  src/core/config/viewRegistry.jsx
 *   New home section  →  src/core/config/homeConfig.jsx
 *   New API call      →  src/shared/hooks/useTopologyData.js
 *   New topology icon →  src/core/config/iconConfig.jsx
 *   New theme         →  src/core/config/themeConfig.js
 *
 * This file should ONLY change when the top-level layout
 * structure itself needs to change (e.g. adding a second
 * sidebar or a global header bar).
 * ──────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth }       from '../../../../features/auth/services';

// ── Sub-pages / modules ──────────────────────────────────────
import HomePage    from '../../modules/home/HomePage';
import DCMPage     from '../../modules/dcm/DCMPage';
import { TopologyView } from '../../../topology/pages';

// ── Shared components ────────────────────────────────────────
import Sidebar from '../../core/layout/Sidebar';
import Toast   from '../../shared/components/Toast';

// ── Hooks ────────────────────────────────────────────────────
import useUser          from '../../shared/hooks/useUser';
import useTopologyData  from '../../shared/hooks/useTopologyData';

// ── Config ───────────────────────────────────────────────────
import { VIEW_REGISTRY, NON_TOPOLOGY_KEYS } from '../../core/config/viewRegistry';

// ── Styles ───────────────────────────────────────────────────
import './Dashboard.css';

/* ════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  /* ── Persisted UI state ──────────────────────────────────── */
  const [activeView,        setActiveView]        = useState(() => localStorage.getItem('activeView')  || 'Empty');
  const [activeDbView,      setActiveDbView]      = useState(() => localStorage.getItem('activeDbView') || '');
  const [selectedPortfolio, setSelectedPortfolio] = useState(() => {
    const saved = localStorage.getItem('selectedPortfolio');
    return saved ? JSON.parse(saved) : null;
  });
  const [theme,       setTheme]       = useState(() => localStorage.getItem('theme')       || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [selectedRange, setSelectedRange] = useState('10 Min');

  /* ── Transient state ─────────────────────────────────────── */
  const [currentTime,  setCurrentTime]  = useState(new Date());
  const [toast,        setToast]        = useState({ show: false, message: '' });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsHoverSidebar, setFsHoverSidebar] = useState(false);
  const hoverTimerRef = useRef(null);

  /* ── Data + user ─────────────────────────────────────────── */
  const { portfolios, allViews, loadingPortfolios, loadingViews } = useTopologyData();
  const user    = useUser();
  const auth    = useAuth();
  const { logout } = auth;
  const navigate = useNavigate();

  /* ── Derived flags ───────────────────────────────────────── */
  const isTopologyView = !NON_TOPOLOGY_KEYS.has(activeView);
  const isDCM          = !['Empty', 'Assets', 'Admin'].includes(activeView);

  /* ── Helpers ─────────────────────────────────────────────── */
  const showToast = (msg, ms = 3500) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), ms);
  };

  /* ── Clock ───────────────────────────────────────────────── */
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── First-visit welcome toast ───────────────────────────── */
  useEffect(() => {
    if (!localStorage.getItem('hasVisited')) {
      showToast('Welcome to Network Angiogram!', 4000);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  /* ── Persist state to localStorage ───────────────────────── */
  useEffect(() => { localStorage.setItem('activeView',   activeView);                      }, [activeView]);
  useEffect(() => { localStorage.setItem('activeDbView', activeDbView);                    }, [activeDbView]);
  useEffect(() => { localStorage.setItem('theme',        theme);                           }, [theme]);
  useEffect(() => { localStorage.setItem('sidebarOpen',  JSON.stringify(sidebarOpen));     }, [sidebarOpen]);
  useEffect(() => {
    if (selectedPortfolio) {
      localStorage.setItem('selectedPortfolio', JSON.stringify(selectedPortfolio));
    }
  }, [selectedPortfolio]);

  /* ── Apply data-theme attribute ──────────────────────────── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /* ── Exit fullscreen when leaving topology views ─────────── */
  useEffect(() => {
    if (!isTopologyView) setIsFullscreen(false);
  }, [isTopologyView]);

  /* ── Time-range handler (shows toast) ────────────────────── */
  const handleRangeChange = (range) => {
    setSelectedRange(range);
    showToast(`Time range: ${range}`);
  };

  /* ── Fullscreen sidebar hover ─────────────────────────────── */
  const handleFsEdgeEnter = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setFsHoverSidebar(true);
  }, []);

  const handleFsEdgeLeave = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => setFsHoverSidebar(false), 300);
  }, []);

  /* ── Sidebar badge counts ─────────────────────────────────── */
  // Add new badge counts here as new features are built.
  const badgeCounts = {
    notifications: 3,
  };

  /* ════════════════════════════════════════════════════════════
     MAIN CONTENT RENDERER
     ──────────────────────────────────────────────────────────
     Consult VIEW_REGISTRY first, then handle built-in special
     views ('Empty', 'DCM'), then fall through to TopologyView.

     ADD NEW FULL-PAGE VIEWS IN src/core/config/viewRegistry.jsx
  ════════════════════════════════════════════════════════════ */
  const renderMainContent = () => {
    // ── Home ────────────────────────────────────────────────
    if (activeView === 'Empty') {
      return (
        <HomePage
          user={currentTime && user}           // re-renders when clock ticks
          currentTime={currentTime}
          portfolioCount={portfolios.length}
          viewCount={allViews.length}
          setActiveView={setActiveView}
        />
      );
    }

    // ── DCM (topology selector) ──────────────────────────────
    if (activeView === 'DCM') {
      return (
        <DCMPage
          portfolios={portfolios}
          allViews={allViews}
          loadingPortfolios={loadingPortfolios}
          loadingViews={loadingViews}
          selectedPortfolio={selectedPortfolio}
          setSelectedPortfolio={setSelectedPortfolio}
          activeDbView={activeDbView}
          setActiveView={setActiveView}
          setActiveDbView={setActiveDbView}
          setIsFullscreen={setIsFullscreen}
        />
      );
    }

    // ── Registered static views (Assets, Admin, …) ───────────
    const registered = VIEW_REGISTRY[activeView];
    if (registered) {
      const Component = registered.component;
      // Pass minimal props; extend as needed per component.
      return (
        <div style={activeView === 'Admin' ? { padding: '20px 0' } : undefined}>
          <Component
            current={undefined}                   // AssetInventory uses this
            onBack={() => setActiveView('DCM')}
          />
        </div>
      );
    }

    // ── Live topology view (anything not in the sets above) ──
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', minHeight: 0, position: 'relative', zIndex: 2,
      }}>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <TopologyView
            portfolioId={selectedPortfolio?.name}
            selectedRange={selectedRange}
            activeDbView={activeDbView}
            theme={theme}
            onBack={() => setActiveView('DCM')}
            onGotoDCM={() => setActiveView('DCM')}
          />
        </div>
      </div>
    );
  };

  /* ── Shared sidebar props ───────────────────────────────────── */
  const sharedSidebarProps = {
    sidebarOpen,
    setSidebarOpen,
    isFullscreen,
    activeView,
    setActiveView,
    isDCM,
    theme,
    setTheme,
    selectedRange,
    onRangeChange: handleRangeChange,
    user,
    onLogout: logout,
    badgeCounts,
  };

  /* ════════════════════════════════════════════════════════════
     FULLSCREEN LAYOUT
  ════════════════════════════════════════════════════════════ */
  if (isFullscreen && isTopologyView) {
    return (
      <div
        data-theme={theme}
        style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: 'var(--bg)', position: 'relative' }}
      >
        {/* Invisible left-edge zone that triggers the overlay sidebar */}
        <div
          className="fs-edge-hover-zone"
          onMouseEnter={handleFsEdgeEnter}
          onMouseLeave={handleFsEdgeLeave}
        />

        {/* Slide-in overlay sidebar */}
        <div
          className={`fs-overlay-sidebar${fsHoverSidebar ? ' visible' : ''}`}
          onMouseEnter={handleFsEdgeEnter}
          onMouseLeave={handleFsEdgeLeave}
        >
          <Sidebar
            {...sharedSidebarProps}
            inOverlay={true}
            onOverlayClose={() => setFsHoverSidebar(false)}
          />
        </div>

        <div className="na-content-area" style={{ width: '100%' }}>
          <Toast show={toast.show} message={toast.message} />
          <div className="na-main">{renderMainContent()}</div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     NORMAL LAYOUT
  ════════════════════════════════════════════════════════════ */
  return (
    <div
      data-theme={theme}
      style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: 'var(--bg)' }}
    >
      <aside className={`na-sidebar${sidebarOpen ? '' : ' na-sidebar--collapsed'}`}>
        <Sidebar {...sharedSidebarProps} inOverlay={false} />
      </aside>

      <div className="na-content-area">
        <Toast show={toast.show} message={toast.message} />
        <div className="na-main">{renderMainContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
