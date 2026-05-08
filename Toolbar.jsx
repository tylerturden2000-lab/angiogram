import React from 'react';
import {
  Search, RefreshCw, Maximize2, X,
  ZoomIn, ZoomOut, Play, Pause,
  GitBranch, Share2, Zap,
} from 'lucide-react';
import { T } from '../constants/tokens';
import { LAYOUT_MODES } from '../constants/layouts';
import { S } from '../constants/styles';

/* ─────────────────────────────────────────────────────────────
   TOP-LEFT TOOLBAR
───────────────────────────────────────────────────────────── */
export const TopLeftToolbar = ({
  onBack, vColor, viewLabel,
  layoutMode, setLayoutMode,
  TH,
}) => (
  <div style={{
    position:'absolute', top:12, left:12, zIndex:20,
    display:'flex', flexDirection:'column', gap:8, animation:'tv-in .2s ease',
  }}>
    <div style={{display:'flex', alignItems:'center', gap:6}}>
      <button
        onClick={onBack}
        className="tv-btn"
        title="Back"
        style={{
          ...S.floatBtn, padding:'5px 12px', gap:5, fontSize:11, fontWeight:700,
          color:TH.text, background:TH.card, border:`1px solid ${TH.border}`,
        }}
      >
        ← Back
      </button>

      <div style={{
        display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8,
        border:`1px solid ${vColor}50`,
        background: `${vColor}0d`,
        backdropFilter:'blur(8px)',
      }}>
        <span style={{
          width:6, height:6, borderRadius:'50%', background:vColor, display:'inline-block',
          animation:'tv-pulse 2.5s ease-in-out infinite',
          boxShadow:`0 0 6px ${vColor}`,
        }}/>
        <span style={{
          fontSize:11, fontWeight:700, color:vColor,
          whiteSpace:'nowrap', fontFamily:'"Inter",sans-serif', letterSpacing:'.02em',
        }}>
          {viewLabel}
        </span>
      </div>
    </div>

    {/* Layout toggle pills */}
    <div style={{
      display:'flex', gap:2,
      background: TH.bg === '#ffffff' ? 'rgba(255,255,255,.9)' : 'rgba(9,16,53,.88)',
      borderRadius:8, padding:3, border:`1px solid ${TH.border}`,
      backdropFilter:'blur(10px)', width:'fit-content',
    }}>
      {Object.entries(LAYOUT_MODES).map(([key, cfg]) => {
        const Icon   = cfg.icon;
        const active = layoutMode === key;
        return (
          <button
            key={key}
            className="tv-pill"
            onClick={() => setLayoutMode(key)}
            style={{
              display:'flex', alignItems:'center', gap:5, padding:'5px 13px', borderRadius:6,
              cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'"Inter",sans-serif',
              border:'none',
              background: active ? `linear-gradient(135deg,${T.emerald},#059669)` : 'transparent',
              color:      active ? '#022c1c' : TH.textSub,
              transition:'all .15s',
              boxShadow:  active ? `0 2px 8px rgba(16,185,129,.3)` : 'none',
            }}
          >
            <Icon size={12} style={{flexShrink:0}}/>{cfg.label}
          </button>
        );
      })}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   TOP-RIGHT TOOLBAR
───────────────────────────────────────────────────────────── */
export const TopRightToolbar = ({
  searchVal, setSearchVal, onSearch, onClearSearch,
  useCy, physicsOn, togglePhysics,
  liveMode, setLiveMode,
  onRefresh,
  connectedView, setConnectedView,
  setUseCy, setRendererSwitching,
  showLegend, setShowLegend,
  alertCount,
  nodeCount, edgeCount, fromCache,
  fromDate, toDate, lastRefresh,
  isLight, TH,
}) => (
  <div style={{
    position:'absolute', top:12, right:12, zIndex:20,
    display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6,
    animation:'tv-in .2s ease',
  }}>
    {/* Search */}
    <div style={{position:'relative', display:'flex', alignItems:'center'}}>
      <Search size={12} color={TH.textDim} style={{position:'absolute', left:9, pointerEvents:'none'}}/>
      <input
        className="tv-search"
        type="text"
        placeholder="Search nodes…"
        value={searchVal}
        onChange={e => setSearchVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch()}
        style={{
          width:210, padding:'6px 28px 6px 28px', height:32,
          background: isLight ? 'rgba(255,255,255,.94)' : 'rgba(9,16,53,.90)',
          border:`1px solid ${TH.border}`, borderRadius:8, fontSize:12, color:TH.text,
          fontFamily:'"JetBrains Mono","Inter",sans-serif',
          backdropFilter:'blur(10px)', transition:'all .14s',
        }}
      />
      {searchVal && (
        <button
          onClick={onClearSearch}
          style={{position:'absolute', right:8, background:'none', border:'none', cursor:'pointer', color:TH.textDim, display:'flex', padding:0}}
        >
          <X size={11}/>
        </button>
      )}
    </div>

    {/* Action buttons row */}
    <div style={{display:'flex', alignItems:'center', gap:5}}>
      {/* Physics toggle */}
      <button
        className="tv-btn"
        onClick={togglePhysics}
        title={useCy ? 'Physics unavailable in Cytoscape mode' : physicsOn ? 'Freeze layout' : 'Enable physics'}
        disabled={useCy}
        style={{
          ...S.floatBtn, padding:'5px 10px', gap:5, fontSize:11, fontWeight:700,
          border:`1px solid ${physicsOn ? `${T.amber}66` : TH.border}`,
          background: useCy
            ? (isLight ? 'rgba(159,162,191,.22)' : 'rgba(75,85,99,.18)')
            : physicsOn
              ? (isLight ? 'rgba(245,158,11,.12)' : 'rgba(245,158,11,.10)')
              : (isLight ? 'rgba(255,255,255,.92)' : 'rgba(9,16,53,.88)'),
          color: useCy ? TH.textDim : physicsOn ? T.amber : TH.textSub,
          cursor: useCy ? 'not-allowed' : 'pointer',
        }}
      >
        <Zap size={11}/>
        <span>{useCy ? 'Physics N/A' : physicsOn ? 'Unfreeze' : 'Freeze'}</span>
      </button>

      {/* Live toggle */}
      <button
        className="tv-btn"
        onClick={() => setLiveMode(l => !l)}
        title={liveMode ? 'Stop live' : 'Start live polling'}
        style={{
          ...S.floatBtn, padding:'5px 11px', gap:5, fontSize:11, fontWeight:700,
          border:`1px solid ${liveMode ? `${T.emerald}66` : TH.border}`,
          background: liveMode
            ? (isLight ? 'rgba(16,185,129,.12)' : 'rgba(16,185,129,.10)')
            : (isLight ? 'rgba(255,255,255,.92)' : 'rgba(9,16,53,.88)'),
          color: liveMode ? T.emerald : TH.textSub,
        }}
      >
        {liveMode ? <Pause size={12}/> : <Play size={12}/>}
        <span>{liveMode ? 'Stop' : 'Live'}</span>
        {liveMode && (
          <span style={{
            width:5, height:5, borderRadius:'50%', background:T.emerald,
            animation:'tv-pulse 1s ease-in-out infinite',
            display:'inline-block', marginLeft:2,
          }}/>
        )}
      </button>

      {/* Refresh */}
      <button
        className="tv-btn"
        onClick={onRefresh}
        title="Refresh data"
        style={{
          ...S.floatBtn, width:30, height:30, justifyContent:'center',
          border:`1px solid ${TH.border}`,
          background: isLight ? 'rgba(255,255,255,.92)' : 'rgba(9,16,53,.88)',
          color: TH.textSub,
        }}
      >
        <RefreshCw size={13}/>
      </button>

      {/* Connected hover view */}
      <button
        className="tv-btn"
        onClick={() => setConnectedView(on => !on)}
        title={connectedView ? 'Disable connected hover view' : 'Enable connected hover view'}
        style={{
          ...S.floatBtn, padding:'5px 10px', gap:5, fontSize:11, fontWeight:700,
          border:`1px solid ${connectedView ? `${T.emerald}66` : TH.border}`,
          background: connectedView
            ? (isLight ? 'rgba(16,185,129,.12)' : 'rgba(16,185,129,.10)')
            : (isLight ? 'rgba(255,255,255,.92)' : 'rgba(9,16,53,.88)'),
          color: connectedView ? T.emerald : TH.textSub,
        }}
      >
        <Share2 size={12}/>
        <span>{connectedView ? 'Connected ON' : 'Connected'}</span>
      </button>

      {/* Renderer toggle */}
      <button
        className="tv-btn"
        onClick={() => { setRendererSwitching(true); setUseCy(c => !c); }}
        title={useCy ? 'Switch to Curved layout' : 'Switch to Straight layout'}
        style={{
          ...S.floatBtn, padding:'5px 10px', gap:5, fontSize:11, fontWeight:700,
          border:`1px solid ${useCy ? `${T.emerald}66` : TH.border}`,
          background: useCy
            ? (isLight ? 'rgba(16,185,129,.12)' : 'rgba(16,185,129,.10)')
            : (isLight ? 'rgba(255,255,255,.92)' : 'rgba(9,16,53,.88)'),
          color: useCy ? T.emerald : TH.textSub,
        }}
      >
        <span style={{fontSize:11, fontWeight:700}}>{useCy ? 'Straight layout' : 'Curved layout'}</span>
      </button>

      {/* Status legend toggle */}
      <button
        className="tv-btn"
        onClick={() => setShowLegend(l => !l)}
        title="Node status legend"
        style={{
          ...S.floatBtn, padding:'5px 10px', gap:5, fontSize:11, fontWeight:700,
          position:'relative',
          border:`1px solid ${showLegend ? `${T.cyan}88` : alertCount>0 ? `${T.red}66` : TH.border}`,
          background: showLegend
            ? (isLight ? 'rgba(6,182,212,.12)' : 'rgba(6,182,212,.10)')
            : alertCount > 0
              ? (isLight ? 'rgba(239,68,68,.08)' : 'rgba(239,68,68,.08)')
              : (isLight ? 'rgba(255,255,255,.92)' : 'rgba(9,16,53,.88)'),
          color: showLegend ? T.cyan : alertCount>0 ? T.red : TH.textSub,
        }}
      >
        <span style={{display:'flex', gap:2, alignItems:'center'}}>
          {['#10b981','#f59e0b','#ef4444'].map(c => (
            <span key={c} style={{width:6, height:6, borderRadius:'50%', background:c, display:'inline-block'}}/>
          ))}
        </span>
        <span>Status</span>
        {alertCount > 0 && (
          <span style={{
            position:'absolute', top:-5, right:-5,
            minWidth:16, height:16, borderRadius:8,
            background:T.red, color:'#fff', fontSize:9, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px',
            boxShadow:`0 0 6px ${T.red}88`,
            animation:'tv-pulse 2s ease-in-out infinite',
          }}>
            {alertCount}
          </span>
        )}
      </button>
    </div>

    {/* Node / edge count */}
    {nodeCount > 0 && (
      <div style={{
        display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:7,
        background: isLight ? 'rgba(255,255,255,.92)' : 'rgba(9,16,53,.88)',
        border:`1px solid ${TH.border}`, backdropFilter:'blur(8px)',
        fontFamily:'"JetBrains Mono",monospace', fontSize:10,
      }}>
        <span style={{color:T.emerald, fontWeight:700}}>{nodeCount}</span>
        <span style={{color:TH.border}}>·</span>
        <span style={{color:TH.textSub}}>{edgeCount} edges</span>
        {fromCache && (
          <span style={{marginLeft:4, fontSize:9, fontWeight:700, color:T.cyan, letterSpacing:'.05em'}}>
            CACHED
          </span>
        )}
      </div>
    )}

    {/* Date range */}
    <div style={{
      padding:'5px 10px', borderRadius:7,
      background: isLight ? 'rgba(255,255,255,.88)' : 'rgba(9,16,53,.80)',
      border:`1px solid ${TH.border}`, backdropFilter:'blur(8px)',
      fontSize:9, lineHeight:1.9, fontFamily:'"JetBrains Mono",monospace', textAlign:'right',
    }}>
      <div><span style={{color:TH.textDim}}>FROM </span><span style={{color:TH.textSub}}>{fromDate}</span></div>
      <div><span style={{color:TH.textDim}}>TO   </span><span style={{color:TH.textSub}}>{toDate}</span></div>
      {lastRefresh && <div style={{color:TH.textDim, fontSize:8}}>↻ {lastRefresh}</div>}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   BOTTOM-RIGHT ZOOM CONTROLS
───────────────────────────────────────────────────────────── */
export const ZoomControls = ({ onFit, onZoomIn, onZoomOut, isLight, TH }) => (
  <div style={{
    position:'absolute', bottom:20, right:16, zIndex:20,
    display:'flex', flexDirection:'column', gap:5, animation:'tv-in .2s ease',
  }}>
    <button
      className="tv-btn"
      onClick={onFit}
      title="Fit all nodes"
      style={{
        ...S.floatBtn, width:36, height:36, justifyContent:'center',
        border:`1px solid ${T.emerald}66`,
        background: isLight ? 'rgba(16,185,129,.12)' : 'rgba(16,185,129,.10)',
        color: T.emerald,
        boxShadow:`0 2px 10px rgba(16,185,129,.2)`,
      }}
    >
      <Maximize2 size={15}/>
    </button>
    <button
      className="tv-btn"
      onClick={onZoomIn}
      title="Zoom in"
      style={{
        ...S.floatBtn, width:36, height:36, justifyContent:'center',
        border:`1px solid ${TH.border}`,
        background: isLight ? 'rgba(255,255,255,.92)' : 'rgba(9,16,53,.88)',
        color: TH.textSub,
      }}
    >
      <ZoomIn size={14}/>
    </button>
    <button
      className="tv-btn"
      onClick={onZoomOut}
      title="Zoom out"
      style={{
        ...S.floatBtn, width:36, height:36, justifyContent:'center',
        border:`1px solid ${TH.border}`,
        background: isLight ? 'rgba(255,255,255,.92)' : 'rgba(9,16,53,.88)',
        color: TH.textSub,
      }}
    >
      <ZoomOut size={14}/>
    </button>
  </div>
);
