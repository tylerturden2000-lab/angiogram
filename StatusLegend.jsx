import React from 'react';
import { X } from 'lucide-react';
import { T, STATUS } from '../constants/tokens';

/* ─────────────────────────────────────────────────────────────
   STATUS LEGEND PANEL
───────────────────────────────────────────────────────────── */
const StatusLegend = ({ rawNodes, onClose, isLight, TH }) => (
  <div style={{
    position:'absolute', top:130, right:12, zIndex:25, width:260,
    background: isLight ? 'rgba(255,255,255,.97)' : 'rgba(9,16,53,.97)',
    border:`1px solid ${TH.border}`, borderRadius:12, padding:'14px 16px',
    backdropFilter:'blur(16px)', boxShadow:`0 8px 32px rgba(0,0,0,.4)`,
    animation:'tv-pop .18s ease', maxHeight:'70vh', overflowY:'auto',
  }}>
    {/* Header */}
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${TH.border}`,
    }}>
      <span style={{
        fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase',
        color:T.cyan, fontFamily:'"JetBrains Mono",monospace',
      }}>
        Node Status
      </span>
      <button
        onClick={onClose}
        style={{background:'none', border:'none', cursor:'pointer', color:TH.textDim, display:'flex', padding:2}}
      >
        <X size={12}/>
      </button>
    </div>

    {/* Per-status rows */}
    {Object.entries(STATUS).map(([key, s]) => {
      const matchNodes = rawNodes.filter(r => (r.status||'healthy').toLowerCase() === key);
      const cnt = matchNodes.length;
      return (
        <div key={key} style={{marginBottom:6}}>
          <div style={{
            display:'flex', alignItems:'center', gap:10, padding:'7px 8px', borderRadius:7,
            background: cnt > 0 ? `${s.color}12` : 'transparent',
            border:`1px solid ${cnt > 0 ? `${s.color}35` : 'transparent'}`,
          }}>
            <span style={{
              width:12, height:12, borderRadius:'50%', flexShrink:0,
              background: cnt > 0 ? s.color : 'transparent',
              border:`2px solid ${s.color}`,
              boxShadow: cnt > 0 ? `0 0 7px ${s.glow}` : 'none',
              animation: key==='critical' && cnt>0 ? 'tv-pulse 1.2s ease-in-out infinite' : 'none',
            }}/>
            <span style={{flex:1, fontSize:12, fontWeight:600, color: cnt>0 ? s.color : TH.textSub}}>
              {s.label}
            </span>
            <span style={{
              fontSize:11, fontWeight:700,
              color: cnt>0 ? s.color : TH.textDim,
              fontFamily:'"JetBrains Mono",monospace',
              minWidth:18, textAlign:'right',
            }}>
              {cnt}
            </span>
          </div>

          {cnt > 0 && key !== 'healthy' && (
            <div style={{paddingLeft:8, marginTop:3, display:'flex', flexDirection:'column', gap:2}}>
              {matchNodes.map(r => (
                <div
                  key={r.id}
                  style={{
                    display:'flex', alignItems:'center', gap:6, padding:'4px 8px', borderRadius:5,
                    background: isLight ? `${s.color}08` : `${s.color}0a`,
                    border:`1px solid ${s.color}20`,
                  }}
                >
                  <span style={{width:5, height:5, borderRadius:'50%', background:s.color, flexShrink:0, boxShadow:`0 0 4px ${s.color}`}}/>
                  <span style={{
                    fontSize:11, fontWeight:600, color:s.color, flex:1,
                    fontFamily:'"Inter",sans-serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                  }}>
                    {r.name || r.id}
                  </span>
                  <span style={{fontSize:9, color:TH.textDim, fontFamily:'"JetBrains Mono",monospace', flexShrink:0}}>
                    {r.id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    })}

    {/* Edge legend */}
    <div style={{marginTop:12, paddingTop:10, borderTop:`1px solid ${TH.border}`}}>
      <div style={{
        fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase',
        color:T.cyan, fontFamily:'"JetBrains Mono",monospace', marginBottom:8,
      }}>
        Edge Status
      </div>
      {[
        { key:'normal',   color: isLight?'#0c4a6e':'#0284c7', label:'Normal',   dash:'none' },
        { key:'warning',  color:'#f59e0b', label:'Warning',  dash:'4 2' },
        { key:'critical', color:'#ef4444', label:'Critical', dash:'2 2' },
      ].map(e => (
        <div key={e.key} style={{display:'flex', alignItems:'center', gap:8, padding:'5px 0'}}>
          <svg width="32" height="8" style={{flexShrink:0}}>
            <line x1="0" y1="4" x2="24" y2="4" stroke={e.color}
              strokeWidth={e.key==='normal'?2:2.8}
              strokeDasharray={e.dash!=='none'?e.dash:undefined}/>
            <polygon points="24,1 30,4 24,7" fill={e.color}/>
          </svg>
          <span style={{fontSize:11, fontWeight:600, color:TH.textSub}}>{e.label}</span>
        </div>
      ))}
    </div>

    <div style={{
      marginTop:10, padding:'8px 10px', borderRadius:7,
      background:`${T.cyan}08`, border:`1px solid ${T.cyan}22`,
    }}>
      <p style={{margin:0, fontSize:10, color:TH.textDim, lineHeight:1.6}}>
        Set <code style={{color:T.cyan}}>status</code> on node docs in MongoDB.
        Values: <code style={{color:T.emerald}}>healthy · warning · critical · offline · unknown</code>
      </p>
    </div>
  </div>
);

export default StatusLegend;
