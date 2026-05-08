import React from 'react';
import { Share2 } from 'lucide-react';
import { T } from '../constants/tokens';

/* ─────────────────────────────────────────────────────────────
   PATH HIGHLIGHT BANNER
───────────────────────────────────────────────────────────── */
const PathBanner = ({ nodeName, connectionCount, onClear, isLight }) => (
  <div style={{
    position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)',
    zIndex:300, display:'flex', alignItems:'center', gap:12,
    background:isLight?'rgba(255,255,255,0.97)':'rgba(9,16,53,0.97)',
    border:`1px solid ${T.emerald}`,
    borderRadius:12, padding:'9px 18px',
    boxShadow:`0 8px 32px rgba(16,185,129,0.2)`,
    animation:'tv-in .2s ease',
    fontFamily:'"Inter",sans-serif',
    whiteSpace:'nowrap',
  }}>
    <Share2 size={14} color={T.emerald}/>
    <span style={{fontSize:12, fontWeight:700, color:T.emerald}}>
      Path for&nbsp;
      <span style={{color:isLight?'#0f172a':T.text}}>{nodeName}</span>
      &nbsp;&mdash;&nbsp;
      <span style={{fontFamily:'"JetBrains Mono",monospace'}}>{connectionCount}</span> direct connections
    </span>
    <button
      onClick={onClear}
      style={{
        padding:'4px 12px', borderRadius:7,
        background:'transparent', border:`1px solid ${T.emerald}55`,
        color:T.emerald, fontSize:11, fontWeight:700, cursor:'pointer',
        fontFamily:'"Inter",sans-serif', transition:'all .12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background='rgba(16,185,129,0.12)'}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}
    >
      Clear path
    </button>
  </div>
);

export default PathBanner;
