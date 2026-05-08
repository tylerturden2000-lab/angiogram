import { useCallback } from 'react';
import cytoscape from 'cytoscape';
import { T, STATUS } from '../constants/tokens';
import { compositeStatusIcon } from '../utils/iconCompositor';
import { isUserNode } from '../utils/networkHelpers';
import { VIEW_CONFIG } from '../builders/viewConfigs';

/* ─────────────────────────────────────────────────────────────
   useGraphBuilder
   Owns drawGraph — the function that converts raw API data into
   vis-network DataSets (or Cytoscape elements) and wires up
   status badges, edge colours, and chunked loading for large graphs.
───────────────────────────────────────────────────────────── */
export const useGraphBuilder = ({
  activeDbView,
  isLight,
  portfolioId,
  useCy,
  layoutMode,
  zoomScale,
  nodesDS,
  edgesDS,
  cyRef,
  containerRef,
  connectedViewRef,
  NODE_DATA_CACHE,
  setNodeCount,
  setEdgeCount,
  setZoomScale,
  setSelNode,
  setSelNodeData,
  setCtxMenu,
  setLoading,
}) => {
  const viewCfg = VIEW_CONFIG[activeDbView] || VIEW_CONFIG.device_only_view;

  /* ── Cytoscape element builder ───────────────────────────── */
  const buildCytoscapeElements = useCallback((nodes, edges) => {
    return [
      ...nodes.map(n => {
        const id = String(n.id || '');
        const style = {
          label: String(n.label || id),
          width: Math.max(22, n.size || 38),
          height: Math.max(22, n.size || 38),
          'background-opacity': n.opacity ?? 1,
          'border-width': n.borderWidth || 0,
          'border-color': n.color?.border || 'transparent',
          'text-outline-color': isLight ? '#ffffff' : T.bg,
          'text-outline-width': isLight ? 5 : 4,
          color: n.font?.color || (isLight ? '#0f172a' : T.text),
          'font-size': n.font?.size || 12,
          'text-wrap': 'wrap',
          'text-max-width': 150,
          'text-valign': 'bottom',
          'text-halign': 'center',
          'font-family': '"Inter",sans-serif',
          'background-clip': 'none',
          'background-fit': 'cover',
        };

        if (n.shape === 'image' && n.image) {
          style['background-image'] = n.image;
          style['background-color'] = 'transparent';
        } else {
          style.shape = n.shape === 'dot' ? 'ellipse' : n.shape === 'square' ? 'roundrectangle' : 'ellipse';
          style['background-color'] = n.color?.background || n.color?.color || (isLight ? '#f8fafc' : '#06b6d4');
          style['border-color'] = n.color?.border || style['border-color'];
        }

        return {
          data: { id, label: String(n.label || id), rawData: n.rawData || {}, isPort: n.isPort || false },
          position: n.x != null && n.y != null ? { x: n.x, y: n.y } : undefined,
          selectable: true, grabbable: true, style,
        };
      }),
      ...edges.map(e => {
        const width = e.width || 2;
        const lineStyle = Array.isArray(e.dashes) ? 'dashed' : 'solid';
        return {
          data: {
            id: String(e.id || `${e.from}-${e.to}`),
            source: String(e.from), target: String(e.to), label: String(e.label || ''),
          },
          style: {
            'line-color': e.color?.color || (isLight ? '#0c4a6e' : '#0284c7'),
            'target-arrow-color': e.color?.color || (isLight ? '#0c4a6e' : '#0284c7'),
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier', width,
            'line-style': lineStyle,
            'line-dash-pattern': Array.isArray(e.dashes) ? e.dashes : undefined,
            opacity: e.color?.opacity ?? (isLight ? 1 : 0.9),
            label: String(e.label || ''),
            'font-size': Math.max(8, Math.min(12, 12 * (zoomScale < 0.8 ? 0.8 : 1))),
            'text-rotation': 'autorotate', 'text-margin-y': -10,
            color: isLight ? '#0f172a' : T.text,
            'text-outline-color': isLight ? '#ffffff' : T.bg,
            'text-outline-width': isLight ? 4 : 3,
          },
        };
      }),
    ];
  }, [isLight, zoomScale]);

  /* ── Cytoscape layout runner ─────────────────────────────── */
  const applyCytoscapeLayout = useCallback((cy) => {
    if (!cy) return;
    const layout = layoutMode === 'hierarchical'
      ? {
          name: 'dagre', rankDir: 'LR', nodeSep: 120, edgeSep: 60,
          rankSep: 180, align: 'UL', ranker: 'network-simplex',
          animate: false, fit: false, padding: 40, edgeLabelSpace: 24, controlPoints: true,
        }
      : {
          name: 'fcose', quality: 'default', randomize: false,
          idealEdgeLength: 160, nodeRepulsion: 12000, edgeElasticity: 0.45,
          gravity: 0.24, tile: true, packComponents: true,
          nodeDimensionsIncludeLabels: true, componentSpacing: 80,
          nestingFactor: 0.7, gravityCompound: 1.0, gravityRangeCompound: 1.5,
          animate: false, fit: false,
        };
    try { cy.layout(layout).run(); } catch (_) {}
  }, [layoutMode]);

  /* ── Cytoscape initialiser ───────────────────────────────── */
  const initCytoscape = useCallback(() => {
    if (!containerRef.current) return;
    if (cyRef.current) cyRef.current.destroy();
    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [],
      pixelRatio,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)', 'text-valign':'bottom', 'text-halign':'center',
            'text-wrap':'wrap', 'text-max-width':'150px',
            'font-family':'"Inter",sans-serif', 'font-size':'12px',
            color: isLight ? '#0f172a' : '#f1f5f9',
            'text-outline-color': isLight ? '#ffffff' : T.bg,
            'text-outline-width': isLight ? 5 : 4,
            'text-background-opacity': 0, 'background-fit':'cover', 'background-clip':'none',
            'overlay-padding':'8px',
          },
        },
        {
          selector: 'edge',
          style: {
            'curve-style':'bezier', 'target-arrow-shape':'triangle',
            'target-arrow-color': isLight ? '#0c4a6e' : '#0284c7',
            'line-color': isLight ? '#0c4a6e' : '#0284c7',
            width: 2, opacity: isLight ? 1 : 0.9, 'font-size':'10px',
            'text-rotation':'autorotate', 'text-margin-y':-10,
            color: isLight ? '#0f172a' : '#f1f5f9',
            'text-outline-color': isLight ? '#ffffff' : T.bg,
            'text-outline-width': isLight ? 4 : 3,
          },
        },
        { selector: '.faded', style: { opacity: 0.18, 'text-opacity': 0.18 } },
        { selector: 'edge.faded', style: { 'line-opacity': 0.08, opacity: 0.08 } },
        {
          selector: '.highlighted',
          style: {
            'line-color': T.emerald, 'target-arrow-color': T.emerald, 'background-color': T.emerald,
            'transition-property': 'background-color,line-color,opacity', 'transition-duration': '0.2s',
          },
        },
        {
          selector: 'node.hovered',
          style: {
            'border-width': 4, 'border-color': isLight ? '#38bdf8' : '#7dd3fc',
            'border-opacity': 1, 'transition-duration': '0.2s',
          },
        },
        {
          selector: 'edge.hovered',
          style: {
            'line-color': isLight ? '#075985' : '#0c4a6e',
            'target-arrow-color': isLight ? '#075985' : '#0c4a6e',
            width: 4, opacity: 1, 'line-opacity': 1,
          },
        },
        {
          selector: 'edge.path-edge',
          style: {
            'line-color': '#06b6d4', 'target-arrow-color': '#06b6d4',
            width: 3.5, opacity: 1, 'line-opacity': 1, 'z-index': 10,
          },
        },
        {
          selector: 'node.path-node',
          style: { 'background-color': isLight ? '#7dd3fc' : '#0ea5e9', opacity: 1 },
        },
      ],
      userZoomingEnabled: true, userPanningEnabled: true,
      boxSelectionEnabled: false, wheelSensitivity: 0.24, motionBlur: true,
    });

    cyRef.current.on('tap', event => {
      const target = event.target;
      if (target === cyRef.current) { setCtxMenu(null); return; }
      if (target.isNode()) {
        const id = target.id();
        const nd = { ...target.data(), id };
        if (nd.isPort) { setSelNode(nd); setSelNodeData(null); return; }
        setSelNode(nd); setCtxMenu(null);
      }
    });

    cyRef.current.on('cxttap', event => {
      const target = event.target;
      if (!target || !target.isNode()) { setCtxMenu(null); return; }
      const id = target.id();
      const nd = { ...target.data(), id };
      const dom = event.originalEvent || {};
      setCtxMenu({ x: dom.clientX || 0, y: dom.clientY || 0, node: nd });
    });

    cyRef.current.on('zoom', () => setZoomScale(cyRef.current.zoom()));
    cyRef.current.on('mouseover', () => { if (containerRef.current) containerRef.current.style.cursor = 'grab'; });
    cyRef.current.on('mouseout',  () => { if (containerRef.current) containerRef.current.style.cursor = 'default'; });

    cyRef.current.on('mouseover', 'node', event => {
      const node = event.target;
      node.removeClass('faded').addClass('hovered');
      node.connectedEdges().removeClass('faded').addClass('hovered');
      if (connectedViewRef.current) {
        cyRef.current.elements().difference(node.closedNeighborhood()).addClass('faded');
      }
    });

    cyRef.current.on('mouseout', 'node', event => {
      const node = event.target;
      node.removeClass('hovered');
      node.connectedEdges().removeClass('hovered');
      if (connectedViewRef.current) cyRef.current.elements().removeClass('faded');
    });
  }, [isLight, containerRef, cyRef, connectedViewRef, setCtxMenu, setSelNode, setSelNodeData, setZoomScale]);

  /* ── Main drawGraph ──────────────────────────────────────── */
  const drawGraph = useCallback((rawNodes, rawEdges) => {
    const rawById = new Map();
    rawNodes.forEach(r => { const id = String(r.id||r._id||''); if (id) rawById.set(id, r); });

    const rawEdgeMap = new Map();
    rawEdges.forEach(r => {
      const from = String(r.fromNode||r.from||''), to = String(r.toNode||r.to||''), label = String(r.label||'');
      if (from && to) rawEdgeMap.set(`${from}|${to}|${label}`, r);
    });

    const { finalNodes, finalEdges } = viewCfg.buildGraph(rawNodes, rawEdges, isLight);

    /* Apply per-node status styling */
    finalNodes.forEach(n => {
      const raw    = rawById.get(String(n.id||'')) || NODE_DATA_CACHE[portfolioId]?.[String(n.id||'')];
      const status = (raw?.status || 'healthy').toLowerCase();
      const userN  = isUserNode(raw);
      n.rawData = raw || {};

      if (!n.isPort && n.shape === 'image') {
        if (userN) {
          n.size = Math.max(n.size || 80, 120);
          n.borderWidth = 3;
          n.shadow = { enabled:true, color:'rgba(255,255,255,0.18)', size:20, x:0, y:0 };
        }
        n.shapeProperties = { useBorderWithImage: false };
        n.borderWidth = n.borderWidth || 0;
        n.shadow = n.shadow || { enabled:false };
        n.color = {
          border:'transparent', background:'transparent',
          highlight:{ border:'transparent', background:'transparent' },
          hover:    { border:'transparent', background:'transparent' },
        };

        const labelColor = {
          critical:'#f87171', warning:'#fbbf24', offline:'#9ca3af', unknown:'#c4b5fd',
        }[status] || (isLight ? '#0f172a' : T.text);

        if (n.font) {
          n.font.color       = labelColor;
          n.font.strokeColor = isLight ? '#ffffff' : T.bg;
          n.font.strokeWidth = isLight ? 5 : 4;
        }

        if (status !== 'healthy') {
          n.opacity = status === 'offline' ? 0.5 : 1;
          n.title   = status === 'critical' ? `${n.label||n.id}  🔴  Critical`
                    : status === 'warning'  ? `${n.label||n.id}  🟡  Warning`
                    : status === 'offline'  ? `${n.label||n.id}  ⚫  Offline`
                    :                         `${n.label||n.id}  🟣  Unknown`;
          compositeStatusIcon(n.image, status).then(dataUrl => {
            nodesDS.current.update({ id:n.id, image:dataUrl });
            if (useCy && cyRef.current) {
              const node = cyRef.current.getElementById(String(n.id));
              if (node) node.style('background-image', dataUrl);
            }
          });
        } else {
          n.opacity = 1;
          n.title   = n.label || String(n.id || '');
          if (n.font) {
            n.font.color       = isLight ? '#0f172a' : T.text;
            n.font.strokeColor = isLight ? '#ffffff'  : T.bg;
            n.font.strokeWidth = isLight ? 5 : 4;
          }
        }
      } else if (n.font) {
        n.font.color       = isLight ? '#0f172a' : T.text;
        n.font.strokeColor = isLight ? '#ffffff'  : T.bg;
        n.font.strokeWidth = isLight ? 4 : 3;
      }
    });

    /* Apply per-edge status styling */
    finalEdges.forEach(e => {
      const edgeKey = `${String(e.from||'')}|${String(e.to||'')}|${String(e.label||'')}`;
      const rawE    = rawEdgeMap.get(edgeKey) || rawEdgeMap.get(`${String(e.from||'')}|${String(e.to||'')}|`);

      if (rawE?.edgeStatus && rawE.edgeStatus !== 'normal') {
        const s = STATUS[rawE.edgeStatus] || STATUS.unknown;
        e.color = { color:s.color, highlight:s.color, hover:s.color, opacity:.95 };
        e.width = (e.width || 2) + 0.8;
        return;
      }

      const fromSt = (rawById.get(String(e.from||''))?.status || 'healthy').toLowerCase();
      const toSt   = (rawById.get(String(e.to  ||''))?.status || 'healthy').toLowerCase();
      const rank   = s => s==='critical'?3:s==='warning'?2:s==='offline'?1:0;
      const worst  = rank(fromSt) >= rank(toSt) ? fromSt : toSt;
      e._baseWidth = e.width || 2;

      if (worst === 'critical') {
        e.color = { color:'#ef4444', highlight:'#fca5a5', hover:'#fca5a5', opacity:.85 };
        e.width = (e.width || 2) + 0.6; e.dashes = [6, 3];
      } else if (worst === 'warning') {
        e.color = { color:'#f59e0b', highlight:'#fcd34d', hover:'#fcd34d', opacity:.80 };
        e.width = (e.width || 2) + 0.4; e.dashes = [8, 4];
      }
    });

    /* Load into DataSets — chunk large graphs */
    nodesDS.current.clear();
    edgesDS.current.clear();

    const CHUNK_SIZE   = 500;
    const SHOULD_CHUNK = finalNodes.length > 500 || finalEdges.length > 500;

    if (SHOULD_CHUNK) {
      let nodeIdx = 0, edgeIdx = 0, isProcessing = false;
      const addChunk = () => {
        if (isProcessing) return;
        isProcessing = true;
        try {
          if (nodeIdx < finalNodes.length) {
            nodesDS.current.add(finalNodes.slice(nodeIdx, nodeIdx + CHUNK_SIZE));
            nodeIdx += CHUNK_SIZE;
          }
          if (edgeIdx < finalEdges.length) {
            edgesDS.current.add(finalEdges.slice(edgeIdx, edgeIdx + CHUNK_SIZE));
            edgeIdx += CHUNK_SIZE;
          }
          if (nodeIdx < finalNodes.length || edgeIdx < finalEdges.length) {
            requestAnimationFrame(addChunk);
          }
        } finally { isProcessing = false; }
      };
      requestAnimationFrame(addChunk);
    } else {
      nodesDS.current.add(finalNodes);
      edgesDS.current.add(finalEdges);
    }

    setNodeCount(finalNodes.filter(n => !n.isPort).length);
    setEdgeCount(finalEdges.length);

    /* Sync cytoscape if active */
    if (useCy) {
      initCytoscape();
      const cy = cyRef.current;
      if (!cy) return;
      const elements = buildCytoscapeElements(finalNodes, finalEdges);
      cy.batch(() => { cy.elements().remove(); cy.add(elements); });
      applyCytoscapeLayout(cy);
      cy.fit();
      setZoomScale(cy.zoom());
    }
  }, [
    viewCfg, isLight, portfolioId, useCy, nodesDS, edgesDS, cyRef,
    NODE_DATA_CACHE, setNodeCount, setEdgeCount, setZoomScale,
    initCytoscape, buildCytoscapeElements, applyCytoscapeLayout,
  ]);

  return { drawGraph };
};
