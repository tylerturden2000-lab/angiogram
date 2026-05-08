import { T } from './tokens';

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
export const S = {
  root:{display:'flex', flexDirection:'column', flex:1, minHeight:0,
    width:'100%', position:'relative', overflow:'hidden', fontFamily:'"Inter",sans-serif'},
  canvasWrap:{flex:1, minHeight:0, position:'relative', overflow:'hidden', background:T.bg},
  canvas:{position:'absolute', inset:0, width:'100%', height:'100%', background:'transparent', zIndex:1},
  loadOverlay:{position:'absolute', inset:0, display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center', background:`${T.bg}ee`, zIndex:20},
  errorBox:{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
    background:T.card, border:`1px solid ${T.red}44`, borderRadius:14, padding:'28px 36px',
    color:T.red, fontWeight:700, zIndex:50,
    boxShadow:`0 8px 40px rgba(0,0,0,.6),0 0 0 1px ${T.red}22`,
    display:'flex', flexDirection:'column', alignItems:'center', gap:14, animation:'tv-in .2s ease'},
  portPanel:{position:'absolute', right:16, top:80, background:T.card,
    borderRadius:10, border:`1px solid ${T.border}`, padding:'12px 16px',
    zIndex:200, boxShadow:`0 12px 40px rgba(0,0,0,.6)`,
    minWidth:210, maxWidth:300, animation:'tv-in .18s ease'},
  portHead:{display:'flex', justifyContent:'space-between', alignItems:'center',
    marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${T.border2}`},
  floatBtn:{display:'flex', alignItems:'center', borderRadius:8, cursor:'pointer',
    flexShrink:0, backdropFilter:'blur(10px)', transition:'all .14s', fontFamily:'"Inter",sans-serif'},
};

export const GLOBAL_CSS = (T) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  @keyframes tv-spin    { to{transform:rotate(360deg)} }
  @keyframes tv-pulse   { 0%,100%{opacity:1}50%{opacity:.2} }
  @keyframes tv-fade    { 0%,100%{opacity:.4}50%{opacity:1} }
  @keyframes tv-in      { from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)} }
  @keyframes tv-pop     { from{opacity:0;transform:scale(.92) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes tv-glow-red{ 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}40%{box-shadow:0 0 0 8px rgba(239,68,68,0.25)}80%{box-shadow:0 0 0 4px rgba(239,68,68,0.12)} }
  @keyframes tv-glow-amb{ 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0)}40%{box-shadow:0 0 0 6px rgba(245,158,11,0.22)}80%{box-shadow:0 0 0 3px rgba(245,158,11,0.10)} }
  .tv-pill{transition:all .14s!important}
  .tv-pill:hover{border-color:${T.emerald}!important;color:${T.emerald}!important;background:rgba(16,185,129,.1)!important}
  .tv-btn{transition:all .14s!important}
  .tv-btn:hover{border-color:${T.emerald}!important;background:rgba(16,185,129,.08)!important;color:${T.emerald}!important}
  .tv-search:focus{border-color:${T.emerald}!important;box-shadow:0 0 0 3px rgba(16,185,129,.15)!important;outline:none}
  .tv-toolbar-sep{width:1px;height:22px;background:${T.border};flex-shrink:0}
`;
