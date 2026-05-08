/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
export const T = {
  bg:'#060D2E', surface:'#091035', card:'#0F1A42',
  border:'#1E2E62', border2:'#162050',
  cyan:'#06b6d4', cyanDim:'rgba(6,182,212,0.10)', cyanGlow:'rgba(6,182,212,0.22)',
  emerald:'#10b981', emDim:'rgba(16,185,129,0.10)',
  amber:'#f59e0b', red:'#ef4444', violet:'#8b5cf6',
  text:'#f1f5f9', textSub:'#94a3b8', textDim:'#3D5A9A',
  edge:'#38bdf8',
};

export const LIVE_MS   = 15_000;
export const CACHE_TTL = 30 * 60 * 1000;

export const STATUS = {
  healthy:  { color:'#10b981', glow:'rgba(16,185,129,0.30)', label:'Healthy',  border:'#10b981' },
  warning:  { color:'#f59e0b', glow:'rgba(245,158,11,0.30)',  label:'Warning',  border:'#f59e0b' },
  critical: { color:'#ef4444', glow:'rgba(239,68,68,0.35)',   label:'Critical', border:'#ef4444' },
  offline:  { color:'#6b7280', glow:'rgba(107,114,128,0.25)', label:'Offline',  border:'#6b7280' },
  unknown:  { color:'#8b5cf6', glow:'rgba(139,92,246,0.25)',  label:'Unknown',  border:'#8b5cf6' },
};

export const COMPACT_SCALE_MIN = 0.18;
export const COMPACT_SCALE_MAX = 0.82;
export const FIT_DURATION      = 700;

export const BASE_INTERACTION = {
  dragNodes:true, dragView:true, zoomView:true, hover:true, hoverConnectedEdges:true,
  hideEdgesOnDrag:true, hideEdgesOnZoom:true,
  selectable:true, selectConnectedEdges:true, multiselect:true, navigationButtons:false,
  tooltipDelay:120,
  keyboard:{ enabled:true, speed:{ x:12, y:12, zoom:.02 } },
};
