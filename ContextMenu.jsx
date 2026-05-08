import React, { useRef, useEffect, useState } from 'react';
import { Share2, Info, X, ChevronRight } from 'lucide-react';
import { T } from '../constants/tokens';

/* ─────────────────────────────────────────────────────────────
   CONTEXT MENU COMPONENT
───────────────────────────────────────────────────────────── */
const ContextMenu = ({ x, y, node, onShowPath, onViewDetails, onClose, isLight, TH }) => {
  if (!node) return null;
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust position so menu stays within viewport
  const [adjX, setAdjX] = useState(x);
  const [adjY, setAdjY] = useState(y);
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    setAdjX(x + rect.width  > vw ? x - rect.width  : x);
    setAdjY(y + rect.height > vh ? y - rect.height : y);
  }, [x, y]);

  const statusColor = {
    healthy:'#10b981', warning:'#f59e0b', critical:'#ef4444', offline:'#6b7280', unknown:'#8b5cf6',
  };
  const sc = statusColor[(node.rawData?.status||'healthy').toLowerCase()] || '#10b981';

  return (
    <div
      ref={menuRef}
      style={{
        position:'fixed', left:adjX, top:adjY, zIndex:9999,
        background:isLight?'#ffffff':T.card,
        border:`1px solid ${isLight?'#e2e8f0':T.border}`,
        borderRadius:12, padding:4, minWidth:200,
        boxShadow:'0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)',
        animation:'tv-pop .15s ease',
        fontFamily:'"Inter",sans-serif',
      }}
    >
      {/* Header */}
      <div style={{
        padding:'10px 14px 8px', borderBottom:`1px solid ${isLight?'#e2e8f0':T.border2}`,
        marginBottom:4,
      }}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{
            width:8, height:8, borderRadius:'50%', background:sc, flexShrink:0,
            boxShadow:`0 0 6px ${sc}`,
            animation: node.rawData?.status==='critical' ? 'tv-pulse 1.2s ease-in-out infinite' : 'none',
          }}/>
          <span style={{
            fontSize:12, fontWeight:700, color:TH.text,
            maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>
            {node.label || `Node ${node.id}`}
          </span>
        </div>
        <div style={{
          marginTop:4, fontSize:10, color:TH.textSub,
          fontFamily:'"JetBrains Mono","Inter",sans-serif',
          display:'flex', alignItems:'center', gap:6,
        }}>
          <span style={{color:sc, textTransform:'uppercase', fontWeight:700}}>
            {node.rawData?.status || 'healthy'}
          </span>
          <span style={{color:TH.textDim}}>·</span>
          <span>{(node.rawData?.type || 'SERVER').toUpperCase()}</span>
        </div>
      </div>

      {/* Show Path */}
      <MenuButton
        icon={<Share2 size={14} style={{flexShrink:0}}/>}
        label="Show Path"
        hoverColor={T.emerald}
        hoverBg="rgba(16,185,129,0.12)"
        onClick={onShowPath}
        TH={TH}
      />

      {/* View Node Details */}
      <MenuButton
        icon={<Info size={14} style={{flexShrink:0}}/>}
        label="View Node Details"
        hoverColor={T.cyan}
        hoverBg="rgba(6,182,212,0.10)"
        onClick={onViewDetails}
        TH={TH}
      />

      <div style={{height:1, background:isLight?'#e2e8f0':T.border2, margin:'3px 0'}}/>

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          display:'flex', alignItems:'center', gap:10, width:'100%',
          padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer',
          background:'transparent', color:TH.textDim, fontSize:12, fontWeight:500,
          fontFamily:'"Inter",sans-serif', textAlign:'left', transition:'all .12s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.color = TH.textSub;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = TH.textDim;
        }}
      >
        <X size={13} style={{flexShrink:0}}/>
        <span>Close</span>
      </button>
    </div>
  );
};

/* Small helper to avoid repetition for the two action buttons */
const MenuButton = ({ icon, label, hoverColor, hoverBg, onClick, TH }) => (
  <button
    onClick={onClick}
    style={{
      display:'flex', alignItems:'center', gap:10, width:'100%',
      padding:'8px 14px', borderRadius:8, border:'none', cursor:'pointer',
      background:'transparent', color:TH.textSub, fontSize:12, fontWeight:600,
      fontFamily:'"Inter",sans-serif', textAlign:'left', transition:'all .12s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = hoverBg;
      e.currentTarget.style.color = hoverColor;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = TH.textSub;
    }}
  >
    {icon}
    <span>{label}</span>
    <ChevronRight size={12} style={{marginLeft:'auto', opacity:.5}}/>
  </button>
);

export default ContextMenu;
