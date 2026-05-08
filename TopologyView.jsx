import React, {
  useEffect, useRef, useState, useCallback, useLayoutEffect,
} from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import dagre from 'cytoscape-dagre';
import { DataSet } from 'vis-network/standalone';
import axios from 'axios';
import { NodeDetailsModal } from '../../components';

cytoscape.use(fcose);
cytoscape.use(dagre);

/* ── Internal modules ──────────────────────────────────────── */
import { T, LIVE_MS, CACHE_TTL, FIT_DURATION } from './constants/tokens';
import { S, GLOBAL_CSS } from './constants/styles';
import { LAYOUT_MODES } from './constants/layouts';
import { VIEW_CONFIG } from './builders/viewConfigs';
import { smoothFit, buildTheme } from './utils/networkHelpers';
import { useGraphBuilder } from './hooks/useGraphBuilder';
import { useVisNetwork } from './hooks/useVisNetwork';
import ContextMenu from './components/ContextMenu';
import PathBanner from './components/PathBanner';
import StatusLegend from './components/StatusLegend';
import { TopLeftToolbar, TopRightToolbar, ZoomControls } from './components/Toolbar';

/* ── Module-level caches (survive re-mounts) ────────────────── */
const RAW_CACHE       = {};
const NODE_DATA_CACHE = {};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const TopologyView = ({
  portfolioId, selectedRange, activeDbView,
  theme = 'dark', onBack, onGotoDCM,
  hideToolbar = false,
}) => {
  /* ── Refs ────────────────────────────────────────────────── */
  const wrapRef         = useRef(null);
  const containerRef    = useRef(null);
  const networkRef      = useRef(null);
  const cyRef           = useRef(null);
  const nodesDS         = useRef(new DataSet([]));
  const edgesDS         = useRef(new DataSet([]));
  const liveTimer       = useRef(null);
  const prevKey         = useRef('');
  const rawNodesRef     = useRef([]);
  const rawEdgesRef     = useRef([]);
  const hoveredNodeRef  = useRef(null);
  const connectedViewRef = useRef(false);
  const prevLayoutMode  = useRef('cluster');

  /* ── State ───────────────────────────────────────────────── */
  const [loading,          setLoading]          = useState(true);
  const [useCy,            setUseCy]            = useState(true);
  const [errorMsg,         setErrorMsg]         = useState('');
  const [nodeCount,        setNodeCount]        = useState(0);
  const [edgeCount,        setEdgeCount]        = useState(0);
  const [searchVal,        setSearchVal]        = useState('');
  const [fromDate,         setFromDate]         = useState('');
  const [toDate,           setToDate]           = useState('');
  const [selNode,          setSelNode]          = useState(null);
  const [selNodeData,      setSelNodeData]      = useState(null);
  const [liveMode,         setLiveMode]         = useState(false);
  const [lastRefresh,      setLastRefresh]      = useState('');
  const [layoutMode,       setLayoutMode]       = useState('cluster');
  const [physicsOn,        setPhysicsOn]        = useState(false);
  const [stabilised,       setStabilised]       = useState(false);
  const [fromCache,        setFromCache]        = useState(false);
  const [zoomScale,        setZoomScale]        = useState(1);
  const [modeSwitching,    setModeSwitching]    = useState(false);
  const [rendererSwitching,setRendererSwitching]= useState(false);
  const [showLegend,       setShowLegend]       = useState(false);
  const [connectedView,    setConnectedView]    = useState(false);
  const [ctxMenu,          setCtxMenu]          = useState(null);
  const [pathState,        setPathState]        = useState(null);

  const isLight = theme === 'light';
  const TH      = buildTheme(isLight);
  const viewCfg = VIEW_CONFIG[activeDbView] || VIEW_CONFIG.device_only_view;
  const viewLabel = viewCfg.uiLabel;

  /* Keep ref in sync */
  useEffect(() => { connectedViewRef.current = connectedView; }, [connectedView]);

  /* Reset renderer-switching flag once loading is done */
  useEffect(() => {
    if (!rendererSwitching) return;
    if (!loading) setRendererSwitching(false);
  }, [rendererSwitching, loading]);

  /* Restore opacities when connected-view is turned off */
  useEffect(() => {
    if (!connectedView) {
      if (useCy && cyRef.current) {
        cyRef.current.elements().removeClass('faded hovered');
      } else if (nodesDS.current && edgesDS.current) {
        nodesDS.current.update(nodesDS.current.get().map(n => ({
          id: n.id, opacity: n.rawData?.status === 'offline' ? 0.5 : 1,
        })));
        edgesDS.current.update(edgesDS.current.get().map(e => ({
          id:    e.id,
          color: { ...(e.color || {}), opacity: 1 },
          width: e._baseWidth || 2.4,
        })));
      }
    }
  }, [connectedView, useCy]);

  /* ── Date range ──────────────────────────────────────────── */
  useEffect(() => {
    const pad = v => String(v).padStart(2, '0');
    const DAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const fmt = d => `${DAY[d.getDay()]}, ${MON[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}, `
                   + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const now  = new Date();
    const mins = selectedRange==='2 Hours'?120:selectedRange==='4 Hours'?240:selectedRange==='24 Hours'?1440:10;
    setToDate(fmt(now));
    setFromDate(fmt(new Date(now.getTime() - mins * 60_000)));
  }, [selectedRange, lastRefresh]);

  /* ── Hooks ───────────────────────────────────────────────── */
  const { drawGraph } = useGraphBuilder({
    activeDbView, isLight, portfolioId, useCy, layoutMode, zoomScale,
    nodesDS, edgesDS, cyRef, containerRef, connectedViewRef,
    NODE_DATA_CACHE,
    setNodeCount, setEdgeCount, setZoomScale,
    setSelNode, setSelNodeData, setCtxMenu, setLoading,
  });

  const { buildOptions, initNetwork } = useVisNetwork({
    containerRef, networkRef, nodesDS, edgesDS,
    hoveredNodeRef, connectedViewRef,
    layoutMode, physicsOn, isLight, zoomScale, nodeCount, connectedView, stabilised,
    setStabilised, setPhysicsOn, setZoomScale, setLoading,
    setCtxMenu, setSelNode, setSelNodeData,
  });

  /* ── Controls ────────────────────────────────────────────── */
  const autoFit = useCallback(() => {
    if (useCy && cyRef.current) { cyRef.current.fit(); return; }
    smoothFit(networkRef.current);
  }, [useCy]);

  const zoomIn = useCallback(() => {
    if (useCy && cyRef.current) {
      cyRef.current.zoom({ level: Math.min(cyRef.current.zoom() * 1.35, 8) }); return;
    }
    const n = networkRef.current;
    if (!n) return;
    n.moveTo({ scale: Math.min(n.getScale() * 1.35, 8), animation: { duration:220 } });
  }, [useCy]);

  const zoomOut = useCallback(() => {
    if (useCy && cyRef.current) {
      cyRef.current.zoom({ level: Math.max(cyRef.current.zoom() / 1.35, .05) }); return;
    }
    const n = networkRef.current;
    if (!n) return;
    n.moveTo({ scale: Math.max(n.getScale() / 1.35, .05), animation: { duration:220 } });
  }, [useCy]);

  const togglePhysics = useCallback(() => {
    if (useCy) return;
    setPhysicsOn(p => {
      const next = !p;
      networkRef.current?.setOptions({ physics: { enabled: next } });
      return next;
    });
  }, [useCy]);

  const doSearch = useCallback(() => {
    const term = searchVal.trim().toLowerCase();
    if (useCy && cyRef.current) {
      const cy = cyRef.current;
      cy.nodes().removeClass('faded');
      if (!term) return;
      const match = cy.nodes().filter(node => String(node.data('label')||'').toLowerCase().includes(term));
      if (match.empty()) return;
      cy.nodes().difference(match.closedNeighborhood()).addClass('faded');
      match.first().select();
      return;
    }
    if (!networkRef.current) return;
    const all = nodesDS.current.get();
    if (!term) { nodesDS.current.update(all.map(n => ({ id:n.id, opacity:1 }))); return; }
    const match = all.find(n => (n.label||'').toLowerCase().includes(term));
    if (!match) return;
    const conn = new Set(networkRef.current.getConnectedNodes(match.id));
    conn.add(match.id);
    nodesDS.current.update(all.map(n => ({ id:n.id, opacity: conn.has(n.id)?1:.07 })));
    networkRef.current.focus(match.id, {
      scale: 1.5, animation: { duration: FIT_DURATION, easingFunction:'easeInOutCubic' },
    });
  }, [searchVal, useCy]);

  const clearSearch = useCallback(() => {
    setSearchVal('');
    if (useCy && cyRef.current) { cyRef.current.nodes().removeClass('faded'); cyRef.current.elements().unselect(); return; }
    nodesDS.current.update(nodesDS.current.get().map(n => ({ id:n.id, opacity:1 })));
  }, [useCy]);

  /* ── SHOW PATH ───────────────────────────────────────────── */
  const handleShowPath = useCallback(() => {
    if (!ctxMenu?.node) return;
    setCtxMenu(null);
    const nodeId   = String(ctxMenu.node.id);
    const nodeName = ctxMenu.node.label || `Node ${nodeId}`;

    if (useCy && cyRef.current) {
      const cy   = cyRef.current;
      const node = cy.getElementById(nodeId);
      if (!node || !node.isNode()) return;
      const connEdges = node.connectedEdges();
      const connNodes = node.closedNeighborhood().filter(el => el.isNode());
      cy.elements().addClass('faded');
      connEdges.removeClass('faded').addClass('path-edge');
      connNodes.removeClass('faded').addClass('path-node');
      node.removeClass('faded').select();
      cy.fit(connNodes.union(connEdges), 50);
      setPathState({ nodeId, nodeName, connectionCount: connNodes.size - 1 });
      return;
    }

    const net = networkRef.current;
    if (!net) return;
    const connNodes = new Set(net.getConnectedNodes(nodeId));
    connNodes.add(nodeId);
    const connEdges = new Set(net.getConnectedEdges(nodeId));

    nodesDS.current.update(nodesDS.current.get().map(n => ({
      id:n.id, opacity: connNodes.has(n.id) ? 1 : 0.05,
    })));
    edgesDS.current.update(edgesDS.current.get().map(e => {
      if (connEdges.has(e.id)) {
        return {
          id:e.id,
          color: { color:isLight?'#075985':'#0c4a6e', highlight:isLight?'#0ea5e9':'#7dd3fc', hover:isLight?'#0ea5e9':'#7dd3fc', opacity:1 },
          width:4, dashes:false,
        };
      }
      return { id:e.id, color:{ color:isLight?'#cbd5e1':'#1E2E62', opacity:.04 }, width:1 };
    }));
    net.focus(nodeId, {
      scale: Math.max(net.getScale(), 0.9),
      animation: { duration:600, easingFunction:'easeInOutCubic' },
    });
    setPathState({ nodeId, nodeName, connectionCount: connNodes.size - 1 });
  }, [ctxMenu, isLight, useCy]);

  /* ── CLEAR PATH ──────────────────────────────────────────── */
  const clearPath = useCallback(() => {
    setPathState(null);
    if (useCy && cyRef.current) {
      cyRef.current.elements().removeClass('faded path-edge path-node hovered');
      cyRef.current.elements().unselect();
      return;
    }
    nodesDS.current.update(nodesDS.current.get().map(n => ({
      id:n.id, opacity: n.rawData?.status === 'offline' ? 0.5 : 1,
    })));

    const rawById = new Map();
    rawNodesRef.current.forEach(r => { const id = String(r.id??r._id??''); if (id) rawById.set(id, r); });

    edgesDS.current.update(edgesDS.current.get().map(e => {
      const fromNode = rawById.get(String(e.from??''));
      const toNode   = rawById.get(String(e.to  ??''));
      const rank     = s => s==='critical'?3:s==='warning'?2:s==='offline'?1:0;
      const fromSt   = (fromNode?.status||'healthy').toLowerCase();
      const toSt     = (toNode?.status  ||'healthy').toLowerCase();
      const worst    = rank(fromSt) >= rank(toSt) ? fromSt : toSt;

      if (worst === 'critical') {
        return { id:e.id, color:{color:'#ef4444',highlight:'#fca5a5',hover:'#fca5a5',opacity:.85}, width:(e._baseWidth||2)+0.6, dashes:[6,3] };
      } else if (worst === 'warning') {
        return { id:e.id, color:{color:'#f59e0b',highlight:'#fcd34d',hover:'#fcd34d',opacity:.80}, width:(e._baseWidth||2)+0.4, dashes:[8,4] };
      }
      return {
        id:e.id,
        color: { color:isLight?'#0c4a6e':'#0284c7', highlight:isLight?'#164e63':'#38bdf8', hover:isLight?'#06578c':'#60a5fa', opacity:1 },
        width: e._baseWidth || 2.4, dashes:false,
      };
    }));
  }, [isLight, useCy]);

  /* ── VIEW NODE DETAILS ───────────────────────────────────── */
  const handleViewDetails = useCallback(() => {
    if (!ctxMenu?.node) return;
    const nd = ctxMenu.node;
    setCtxMenu(null);
    if (nd.isPort) { setSelNode(nd); setSelNodeData(null); return; }
    setSelNode(nd);

    const ip = String(nd.id || '');
    const cached = NODE_DATA_CACHE[portfolioId]?.[ip];
    if (cached) { setSelNodeData(cached); return; }

    axios.get(`http://localhost:8080/api/topology/nodes/${encodeURIComponent(ip)}`)
      .then(r => {
        const data = r.data || nd;
        if (!NODE_DATA_CACHE[portfolioId]) NODE_DATA_CACHE[portfolioId] = {};
        NODE_DATA_CACHE[portfolioId][ip] = data;
        setSelNodeData(data);
      })
      .catch(() => setSelNodeData(nd));
  }, [ctxMenu, portfolioId]);

  /* ── fetchData ───────────────────────────────────────────── */
  const fetchData = useCallback(async (isLive = false, forceRefresh = false) => {
    if (!portfolioId || !activeDbView) return;
    const cacheKey = `${portfolioId}::${activeDbView}`;
    try {
      if (!isLive) setLoading(true);
      setErrorMsg('');

      if (!forceRefresh && !isLive) {
        const cached = RAW_CACHE[cacheKey];
        if (cached && (Date.now() - cached.fetchedAt) < CACHE_TTL) {
          drawGraph(cached.nodes, cached.edges);
          setLastRefresh(new Date(cached.fetchedAt).toLocaleTimeString());
          setFromCache(true); setLoading(false);
          return;
        }
      }

      const res      = await axios.post('http://localhost:8080/api/topology/generate-and-fetch', null, { params:{ portfolioId, viewName:activeDbView } });
      const rawNodes = res.data?.nodes || [];
      const rawEdges = res.data?.edges || [];

      if (!NODE_DATA_CACHE[portfolioId]) NODE_DATA_CACHE[portfolioId] = {};
      rawNodes.forEach(n => {
        const ip = String(n.id || n._id || '');
        if (ip) NODE_DATA_CACHE[portfolioId][ip] = n;
      });

      rawNodesRef.current = rawNodes;
      rawEdgesRef.current = rawEdges;

      if (!rawNodes.length) {
        setErrorMsg(`No data found for: ${viewLabel}`);
        if (!isLive) setLoading(false);
        return;
      }

      RAW_CACHE[cacheKey] = { nodes:rawNodes, edges:rawEdges, fetchedAt:Date.now() };

      const key = JSON.stringify({ rawNodes, rawEdges });
      if (isLive && key === prevKey.current) { setLastRefresh(new Date().toLocaleTimeString()); return; }
      prevKey.current = key;
      drawGraph(rawNodes, rawEdges);
      setLastRefresh(new Date().toLocaleTimeString());
      setFromCache(false);
      if (!isLive) setLoading(false);
    } catch (err) {
      console.error('[TopologyView]', err);
      if (!isLive) { setErrorMsg('Failed to connect to backend.'); setLoading(false); }
    }
  }, [portfolioId, activeDbView, drawGraph, viewLabel]);

  /* ── Live polling ────────────────────────────────────────── */
  useEffect(() => {
    clearInterval(liveTimer.current);
    if (liveMode) liveTimer.current = setInterval(() => fetchData(true), LIVE_MS);
    return () => clearInterval(liveTimer.current);
  }, [liveMode, fetchData]);

  /* ── Network init effect ─────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;
    setStabilised(false);
    clearInterval(liveTimer.current);
    networkRef.current?.destroy();
    networkRef.current = null;

    if (!useCy) initNetwork();

    // Prevent native context menu
    const preventContext = e => e.preventDefault();
    containerRef.current.addEventListener('contextmenu', preventContext);
    fetchData(false);

    return () => {
      clearInterval(liveTimer.current);
      networkRef.current?.destroy(); networkRef.current = null;
      if (useCy && cyRef.current) { cyRef.current.destroy(); cyRef.current = null; }
      if (containerRef.current) containerRef.current.removeEventListener('contextmenu', preventContext);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDbView, layoutMode, useCy]);

  useEffect(() => {
    if (portfolioId) fetchData(false);
  }, [portfolioId, useCy]); // eslint-disable-line

  /* Sync connected-view option on vis-network */
  useEffect(() => {
    if (!useCy && networkRef.current) {
      networkRef.current.setOptions({
        interaction: {
          ...require('./constants/tokens').BASE_INTERACTION,
          hover: connectedView, hoverConnectedEdges:false, selectConnectedEdges:false, multiselect:false,
        },
      });
    }
  }, [connectedView, useCy]);

  /* Layout-switch overlay */
  useEffect(() => {
    if (!networkRef.current) return;
    if (prevLayoutMode.current === layoutMode) return;
    setModeSwitching(true);
    const timer = setTimeout(() => setModeSwitching(false), 550);
    prevLayoutMode.current = layoutMode;
    return () => clearTimeout(timer);
  }, [layoutMode]);

  /* Physics opt sync */
  useEffect(() => {
    networkRef.current?.setOptions({ physics:{ enabled:physicsOn } });
  }, [physicsOn]);

  /* Auto-resize */
  useLayoutEffect(() => {
    const obs = new ResizeObserver(() => {
      if (networkRef.current) { networkRef.current.redraw(); networkRef.current.fit({ animation:false }); }
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  /* Global Escape key */
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') { setCtxMenu(null); clearPath(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [clearPath]);

  /* ── Derived values ──────────────────────────────────────── */
  const vColor = activeDbView==='l2_port_view'    ? T.cyan
               : activeDbView==='l3_network_view'  ? T.violet
               : activeDbView==='minified_view'     ? T.emerald
               : T.amber;

  const alertCount = rawNodesRef.current.filter(r => {
    const st = (r.status||'healthy').toLowerCase();
    return st === 'critical' || st === 'warning';
  }).length;

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <div
      ref={wrapRef}
      style={{ ...S.root, display:'flex', flexDirection:'column', flex:1, minHeight:0, background: isLight ? '#ffffff' : T.bg }}
    >
      <style>{GLOBAL_CSS(T)}</style>

      <div style={{ ...S.canvasWrap, flex:1, minHeight:0, position:'relative', background: isLight ? '#ffffff' : T.bg }}>

        {/* Circuit-board background */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
          backgroundImage: isLight
            ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M0 40 H32 V16 H64 V40 H80 M40 0 V32 M40 48 V80 M32 16 H16 V0 M64 16 H72 V0 M16 80 V64 H32 M64 64 H72 V80' stroke='%2310b981' stroke-width='0.7' fill='none' stroke-opacity='0.18'/%3E%3Ccircle cx='40' cy='40' r='1.8' fill='none' stroke='%2310b981' stroke-width='0.8' stroke-opacity='0.22'/%3E%3Ccircle cx='40' cy='40' r='0.8' fill='%2310b981' fill-opacity='0.18'/%3E%3Ccircle cx='32' cy='16' r='1.5' fill='%2334D399' fill-opacity='0.20'/%3E%3Ccircle cx='64' cy='16' r='1.5' fill='%2310b981' fill-opacity='0.18'/%3E%3Ccircle cx='16' cy='64' r='1.5' fill='%2334D399' fill-opacity='0.16'/%3E%3Ccircle cx='64' cy='64' r='1.5' fill='%2310b981' fill-opacity='0.14'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Cpath d='M0 48 H38 V19 H77 V48 H96 M48 0 V38 M48 58 V96 M38 19 H19 V0 M77 19 H86 V0 M19 96 V77 H38 M77 77 H86 V96' stroke='%2334D399' stroke-width='0.55' fill='none' stroke-opacity='0.08'/%3E%3Ccircle cx='48' cy='48' r='2' fill='none' stroke='%2334D399' stroke-width='0.7' stroke-opacity='0.13'/%3E%3Ccircle cx='48' cy='48' r='0.8' fill='%2334D399' fill-opacity='0.10'/%3E%3Ccircle cx='38' cy='19' r='1.5' fill='%2334D399' fill-opacity='0.09'/%3E%3Ccircle cx='77' cy='19' r='1.5' fill='%2310b981' fill-opacity='0.08'/%3E%3Ccircle cx='19' cy='77' r='1.5' fill='%2310b981' fill-opacity='0.08'/%3E%3Ccircle cx='77' cy='77' r='1.5' fill='%2334D399' fill-opacity='0.07'/%3E%3C/svg%3E")`,
          backgroundSize:  isLight ? '80px 80px' : '96px 96px',
          backgroundRepeat:'repeat',
        }}/>

        <div ref={containerRef} style={S.canvas}/>

        {/* ── TOP-LEFT TOOLBAR ─────────────────────────────── */}
        {!hideToolbar && (
          <TopLeftToolbar
            onBack={() => typeof onBack === 'function' && onBack()}
            vColor={vColor}
            viewLabel={viewLabel}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            TH={TH}
          />
        )}

        {/* ── TOP-RIGHT TOOLBAR ────────────────────────────── */}
        {!hideToolbar && (
          <TopRightToolbar
            searchVal={searchVal} setSearchVal={setSearchVal}
            onSearch={doSearch} onClearSearch={clearSearch}
            useCy={useCy} physicsOn={physicsOn} togglePhysics={togglePhysics}
            liveMode={liveMode} setLiveMode={setLiveMode}
            onRefresh={() => { delete RAW_CACHE[`${portfolioId}::${activeDbView}`]; fetchData(false, true); }}
            connectedView={connectedView} setConnectedView={setConnectedView}
            setUseCy={setUseCy} setRendererSwitching={setRendererSwitching}
            showLegend={showLegend} setShowLegend={setShowLegend}
            alertCount={alertCount}
            nodeCount={nodeCount} edgeCount={edgeCount} fromCache={fromCache && !liveMode}
            fromDate={fromDate} toDate={toDate} lastRefresh={lastRefresh}
            isLight={isLight} TH={TH}
          />
        )}

        {/* ── STATUS LEGEND ─────────────────────────────────── */}
        {showLegend && (
          <StatusLegend
            rawNodes={rawNodesRef.current}
            onClose={() => setShowLegend(false)}
            isLight={isLight}
            TH={TH}
          />
        )}

        {/* ── PATH BANNER ───────────────────────────────────── */}
        {pathState && (
          <PathBanner
            nodeName={pathState.nodeName}
            connectionCount={pathState.connectionCount}
            onClear={clearPath}
            isLight={isLight}
          />
        )}

        {/* ── ZOOM CONTROLS ─────────────────────────────────── */}
        <ZoomControls
          onFit={autoFit} onZoomIn={zoomIn} onZoomOut={zoomOut}
          isLight={isLight} TH={TH}
        />

        {/* ── ERROR BOX ─────────────────────────────────────── */}
        {errorMsg && (
          <div style={S.errorBox}>
            <span style={{fontSize:22}}>⚠</span>
            <span style={{fontSize:13}}>{errorMsg}</span>
            <button
              onClick={() => { delete RAW_CACHE[`${portfolioId}::${activeDbView}`]; fetchData(false, true); }}
              style={{
                padding:'8px 20px',
                background:`linear-gradient(135deg,${T.cyan},${T.emerald})`,
                color:'#fff', border:'none', borderRadius:8, cursor:'pointer',
                fontWeight:700, fontSize:12, fontFamily:'"Inter",sans-serif',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── LOADING / SWITCHING OVERLAY ───────────────────── */}
        {(loading || modeSwitching || rendererSwitching) && (
          <div style={{
            ...S.loadOverlay,
            background: isLight ? 'rgba(255,255,255,.92)' : `${T.bg}ee`,
            backdropFilter:'blur(4px)',
          }}>
            <div style={{
              padding:26, background: isLight ? '#ffffff' : '#0f172a', borderRadius:20,
              boxShadow:'0 22px 80px rgba(0,0,0,0.28)',
              display:'flex', flexDirection:'column', alignItems:'center', gap:12, maxWidth:280,
            }}>
              <div style={{
                width:48, height:48, borderRadius:'50%',
                border:`2px solid ${TH.border}`,
                borderTop:`2px solid ${T.emerald}`,
                animation:'tv-spin .7s linear infinite',
              }}/>
              <span style={{
                fontSize:15, fontWeight:700, color:TH.text, letterSpacing:'.04em',
                fontFamily:'"Inter",sans-serif', textAlign:'center',
              }}>
                {rendererSwitching
                  ? `Switching to ${useCy ? 'Straight' : 'Curved'} layout…`
                  : modeSwitching
                    ? `Switching to ${layoutMode === 'cluster' ? 'Cluster' : 'Hierarchy'} view…`
                    : `Loading ${viewLabel}…`}
              </span>
              <span style={{fontSize:12, color:TH.textSub, textAlign:'center', lineHeight:1.6}}>
                {rendererSwitching
                  ? 'Applying the requested layout. Please wait while the view updates.'
                  : modeSwitching
                    ? 'Preparing the new view. This may take a moment while the layout updates.'
                    : 'Fetching topology data and building the map. The view will centre automatically when ready.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── CONTEXT MENU ──────────────────────────────────────── */}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x} y={ctxMenu.y} node={ctxMenu.node}
          onShowPath={handleShowPath}
          onViewDetails={handleViewDetails}
          onClose={() => setCtxMenu(null)}
          isLight={isLight} TH={TH}
        />
      )}

      {/* ── NODE DETAILS MODAL ────────────────────────────────── */}
      {selNodeData && (
        <NodeDetailsModal
          node={selNodeData}
          selectedRange={selectedRange}
          onClose={() => { setSelNode(null); setSelNodeData(null); }}
        />
      )}

      {/* ── PORT PANEL ────────────────────────────────────────── */}
      {selNode?.isPort && (
        <div style={S.portPanel}>
          <div style={S.portHead}>
            <span style={{
              fontWeight:700, fontSize:11, color:T.cyan,
              fontFamily:'"Inter",sans-serif', letterSpacing:'.04em', textTransform:'uppercase',
            }}>
              Interface
            </span>
            <button
              onClick={() => setSelNode(null)}
              style={{border:'none', background:'none', cursor:'pointer', color:T.textDim, display:'flex', padding:2}}
            >
              <span style={{fontSize:14}}>✕</span>
            </button>
          </div>
          <p style={{
            margin:0, fontSize:12, color:T.emerald, fontWeight:600,
            fontFamily:'"JetBrains Mono",monospace', wordBreak:'break-all', lineHeight:1.7,
          }}>
            {selNode.portDetails}
          </p>
        </div>
      )}
    </div>
  );
};

export default TopologyView;
