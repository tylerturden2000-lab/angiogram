import { ICONS } from '../utils/iconCompositor';
import {
  mkServer, mkRouterBadge, mkGreenCircle,
  mkPortDot, mkBlueDot,
  mkArrowCurved, mkCurvedNoArrow, mkFaintArrow,
} from './nodeEdgeBuilders';

/* ─────────────────────────────────────────────────────────────
   VIEW CONFIGS
   Each view exposes { uiLabel, buildGraph(rawNodes, rawEdges, isLight) }
   returning { finalNodes, finalEdges }.
───────────────────────────────────────────────────────────── */
export const VIEW_CONFIG = {
  device_only_view: {
    uiLabel: 'Device Only View',
    buildGraph(rawNodes, rawEdges, isLight = false) {
      const fn=[], fe=[], seenN=new Set(), seenE=new Set();
      rawNodes.forEach(n => {
        const id = String(n.id ?? n._id ?? '');
        if (!id || seenN.has(id)) return; seenN.add(id);
        const t   = (n.type || 'SERVER').toUpperCase();
        const img = t.includes('ROUTER') ? ICONS.router : t.includes('SWITCH') ? ICONS.switch : ICONS.server;
        fn.push(mkServer(id, n.name||id, img, t.includes('ROUTER')?84:t.includes('SWITCH')?82:80));
      });
      rawEdges.forEach(e => {
        const from=String(e.fromNode??e.from??''), to=String(e.toNode??e.to??''), k=`${from}|${to}`;
        if (!from||!to||!seenN.has(from)||!seenN.has(to)||seenE.has(k)) return;
        seenE.add(k); fe.push(mkArrowCurved(from, to, '', isLight));
      });
      return { finalNodes:fn, finalEdges:fe };
    },
  },

  l2_port_view: {
    uiLabel: 'Server And Port View',
    buildGraph(rawNodes, rawEdges, isLight = false) {
      const fn=[], fe=[], seenN=new Set(), seenE=new Set();
      rawNodes.forEach(n => {
        const id = String(n.id ?? n._id ?? '');
        if (!id || seenN.has(id)) return; seenN.add(id);
        const t   = (n.type || 'SERVER').toUpperCase();
        const img = t.includes('ROUTER') ? ICONS.router : t.includes('SWITCH') ? ICONS.switch : ICONS.server;
        fn.push(mkServer(id, n.name||id, img, t.includes('ROUTER')?84:t.includes('SWITCH')?82:80));
      });
      rawEdges.forEach(e => {
        const from    = String(e.fromNode ?? e.from ?? '');
        const to      = String(e.toNode   ?? e.to   ?? '');
        const srcPort = e.sourcePort || e.label || 'Port';
        const pl = srcPort, k = `${from}|${to}|${pl}`;
        if (!from||!to||!seenN.has(from)||!seenN.has(to)||seenE.has(k)) return; seenE.add(k);
        const srcPid  = `pdot__${from}__${pl.replace(/\W/g,'_')}`;
        const destPl  = e.destPort || 'Port';
        const destPid = `pdot__${to}__${destPl.replace(/\W/g,'_')}`;
        if (!seenN.has(srcPid))  { fn.push(mkPortDot(srcPid,  pl));     seenN.add(srcPid);  }
        if (!seenN.has(destPid)) { fn.push(mkPortDot(destPid, destPl)); seenN.add(destPid); }
        fe.push({
          from, to:srcPid, label:pl,
          arrows:{ to:{ enabled:false } },
          color:{ color:isLight?'#0c4a6e':'#0284c7', opacity:1 },
          width: isLight?2.5:2.4,
          smooth:{ type:'curvedCW', roundness:.35 },
          font:{ size:12, color:isLight?'#0f172a':'#ecfdf5',
            background:isLight?'rgba(240,249,255,.95)':'rgba(11,15,26,.9)',
            strokeWidth:isLight?3:0, strokeColor:isLight?'#fff':'transparent', align:'middle' },
        });
        fe.push(mkCurvedNoArrow(srcPid, destPid, '', isLight));
        fe.push(mkArrowCurved(destPid, to, destPl, isLight));
      });
      return { finalNodes:fn, finalEdges:fe };
    },
  },

  // Alias
  server_port_view: {
    uiLabel: 'Server And Port View',
    buildGraph(n, e, il) { return VIEW_CONFIG.l2_port_view.buildGraph(n, e, il); },
  },

  l3_network_view: {
    uiLabel: 'Server And Network Device View',
    buildGraph(rawNodes, rawEdges, isLight = false) {
      const fn=[], fe=[], seenN=new Set(), seenE=new Set();
      rawNodes.forEach(n => {
        const id = String(n.id ?? n._id ?? '');
        if (!id || seenN.has(id)) return; seenN.add(id);
        const t = (n.type || 'SERVER').toUpperCase();
        fn.push(t.includes('ROUTER')
          ? mkRouterBadge(id, n.name||id)
          : mkServer(id, n.name||id, ICONS.server, 80));
      });
      rawEdges.forEach(e => {
        const from=String(e.fromNode??e.from??''), to=String(e.toNode??e.to??''), k=`${from}|${to}`;
        if (!from||!to||!seenN.has(from)||!seenN.has(to)||seenE.has(k)) return;
        seenE.add(k); fe.push(mkFaintArrow(from, to, e.label||'', isLight));
      });
      return { finalNodes:fn, finalEdges:fe };
    },
  },

  // Alias
  server_network_devices_view: {
    uiLabel: 'Server And Network Device View',
    buildGraph(n, e, il) { return VIEW_CONFIG.l3_network_view.buildGraph(n, e, il); },
  },

  minified_view: {
    uiLabel: 'Minified Server Port View',
    buildGraph(rawNodes, rawEdges, isLight = false) {
      const fn=[], fe=[], seenN=new Set(), seenE=new Set();
      rawNodes.forEach(n => {
        const id = String(n.id ?? n._id ?? '');
        if (!id || seenN.has(id)) return; seenN.add(id);
        fn.push(mkGreenCircle(id, n.name||id));
      });
      rawEdges.forEach(e => {
        const from=String(e.fromNode??e.from??''), to=String(e.toNode??e.to??'');
        const lbl=e.label||'', k=`${from}|${to}|${lbl}`;
        if (!from||!to||!seenN.has(from)||!seenN.has(to)||seenE.has(k)) return; seenE.add(k);
        if (lbl) {
          const pid = `mpd__${from}__${lbl.replace(/\W/g,'_')}`;
          if (!seenN.has(pid)) { fn.push(mkBlueDot(pid, lbl)); seenN.add(pid); }
          fe.push(mkCurvedNoArrow(from, pid, '', isLight));
          fe.push(mkCurvedNoArrow(pid, to, lbl, isLight));
        } else {
          fe.push(mkCurvedNoArrow(from, to, '', isLight));
        }
      });
      return { finalNodes:fn, finalEdges:fe };
    },
  },

  // Alias
  network_device_view: {
    uiLabel: 'Network Device View',
    buildGraph(n, e, il) { return VIEW_CONFIG.device_only_view.buildGraph(n, e, il); },
  },
};
