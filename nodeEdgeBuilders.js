import { T } from '../constants/tokens';
import { ICONS } from '../utils/iconCompositor';

/* ─────────────────────────────────────────────────────────────
   NODE BUILDERS
───────────────────────────────────────────────────────────── */
export const mkServer = (id, label, img, size = 80) => ({
  id, label, shape:'image', image:img, size, isPort:false,
  font:{size:14, color:T.text, face:'"Inter",sans-serif', strokeWidth:4, strokeColor:T.bg, vadjust:18},
  title: label,
});

export const mkRouterBadge = (id, label) => ({
  id, label, shape:'image', image:ICONS.router, size:78,
  color:{
    border:'transparent', background:'transparent',
    highlight:{border:T.emerald, background:T.emDim},
    hover:    {border:T.emerald, background:T.emDim},
  },
  borderWidth:0, isPort:false,
  font:{size:14, color:T.text, face:'"Inter",sans-serif', strokeWidth:4, strokeColor:T.bg, vadjust:18},
  title: label,
});

export const mkGreenCircle = (id, label) => ({
  id, label, shape:'dot', size:32,
  color:{
    border:T.emerald, background:T.emDim,
    highlight:{border:T.cyan, background:T.cyanDim},
    hover:    {border:T.cyan, background:T.cyanDim},
  },
  borderWidth:3, isPort:false,
  font:{size:14, color:T.text, face:'"Inter",sans-serif', strokeWidth:4, strokeColor:T.bg, vadjust:14},
  title: label,
});

export const mkPortDot = (id, pl) => ({
  id, label:pl, shape:'image', image:ICONS.port, size:22, isPort:true, portDetails:pl,
  font:{size:12, color:T.text, face:'"Inter",sans-serif', strokeWidth:3, strokeColor:T.bg, vadjust:14},
  title: pl,
});

export const mkBlueDot = (id, pl) => ({
  id, label:pl, shape:'image', image:ICONS.portBlue, size:20, isPort:true, portDetails:pl,
  font:{size:12, color:T.text, face:'"Inter",sans-serif', strokeWidth:3, strokeColor:T.bg, vadjust:14},
  title: pl,
});

/* ─────────────────────────────────────────────────────────────
   EDGE BUILDERS
───────────────────────────────────────────────────────────── */
export const mkArrowCurved = (from, to, label='', isLight=false) => ({
  from, to, label,
  arrows: { to: { enabled:true, scaleFactor:1.2, type:'arrow' } },
  color:  {
    color:isLight?'#0c4a6e':'#0284c7',
    highlight:isLight?'#164e63':'#38bdf8',
    hover:isLight?'#06578c':'#60a5fa',
    opacity:1,
  },
  width:  isLight ? 2.5 : 2.4,
  smooth: { enabled:true, type:'curvedCW', roundness:.5 },
  font:{size:13, color:isLight?'#0f172a':'#ecfdf5', align:'middle',
    background:isLight?'rgba(240,249,255,0.97)':'rgba(6,13,46,.92)',
    strokeWidth:isLight?4:0, strokeColor:isLight?'#ffffff':'transparent', bold:false},
  selectionWidth:5, hoverWidth:4.5,
});

export const mkCurvedNoArrow = (from, to, label='', isLight=false) => ({
  from, to, label,
  arrows: { to: { enabled:false } },
  color:  {
    color:isLight?'#0c4a6e':'#0284c7',
    highlight:isLight?'#164e63':'#38bdf8',
    hover:isLight?'#06578c':'#60a5fa',
    opacity:1,
  },
  width:  isLight ? 2.2 : 2.0,
  smooth: { enabled:true, type:'curvedCW', roundness:.5 },
  font:{size:13, color:isLight?'#0f172a':'#ecfdf5', align:'middle',
    background:isLight?'rgba(240,249,255,0.97)':'rgba(6,13,46,.92)',
    strokeWidth:isLight?4:0, strokeColor:isLight?'#ffffff':'transparent'},
  selectionWidth:4.5, hoverWidth:3.8,
});

export const mkFaintArrow = (from, to, label='', isLight=false) => ({
  from, to, label,
  arrows: { to: { enabled:true, scaleFactor:.85, type:'arrow' } },
  color:  {
    color:isLight?'#0c4a6e':'#0284c7',
    highlight:isLight?'#164e63':'#38bdf8',
    hover:isLight?'#06578c':'#60a5fa',
    opacity:1,
  },
  width:  isLight ? 2.5 : 2.4,
  smooth: { enabled:true, type:'curvedCW', roundness:.35 },
  font:{size:13, color:isLight?'#0f172a':'#ecfdf5', align:'middle',
    background:isLight?'rgba(240,249,255,0.97)':'rgba(6,13,46,.92)',
    strokeWidth:isLight?4:0, strokeColor:isLight?'#ffffff':'transparent'},
  selectionWidth:4, hoverWidth:3.5,
});
