import { useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import { T, BASE_INTERACTION, FIT_DURATION } from '../constants/tokens';
import { LAYOUT_MODES } from '../constants/layouts';
import { smoothFit } from '../utils/networkHelpers';

/* ─────────────────────────────────────────────────────────────
   useVisNetwork
   Owns vis-network initialisation, option building, and all
   network event handlers (hover, click, right-click, drag…).
───────────────────────────────────────────────────────────── */
export const useVisNetwork = ({
  containerRef,
  networkRef,
  nodesDS,
  edgesDS,
  hoveredNodeRef,
  connectedViewRef,
  layoutMode,
  physicsOn,
  isLight,
  zoomScale,
  nodeCount,
  connectedView,
  stabilised,
  setStabilised,
  setPhysicsOn,
  setZoomScale,
  setLoading,
  setCtxMenu,
  setSelNode,
  setSelNodeData,
  fetchData,
}) => {
  /* ── buildOptions ────────────────────────────────────────── */
  const buildOptions = useCallback(() => {
    const zoomedOut  = zoomScale < 0.82;
    const isLarge    = nodeCount > 900;
    const isHierarch = layoutMode === 'hierarchical';
    const modeOpts   = LAYOUT_MODES[layoutMode].getOptions(physicsOn, nodeCount);
    const physicsEnabled = physicsOn || !stabilised;
    if (modeOpts.physics) modeOpts.physics = { ...modeOpts.physics, enabled: physicsEnabled };

    const fontColor = isLight ? '#0f172a' : '#ecfdf5';
    const fontBg    = isLight ? 'rgba(240,249,255,0.95)' : 'rgba(6,13,46,.9)';
    const nodeFont  = isLight ? '#0f172a' : T.text;

    const edgeFont = zoomedOut || isLarge
      ? { size:0, align:'middle', background:'rgba(0,0,0,0)', strokeWidth:0 }
      : { size:13, color:fontColor, align:'middle', background:fontBg,
          strokeWidth:isLight?4:0, strokeColor:isLight?'#ffffff':'transparent' };

    const nodeSize = zoomedOut ? 10 : 14;

    const smoothEdge = isHierarch
      ? { enabled:true, type:'cubicBezier', forceDirection:'vertical', roundness:0.4 }
      : { enabled:true, type:'curvedCW', roundness:.35 };

    const interaction = zoomedOut || isLarge
      ? { ...BASE_INTERACTION, hover: connectedView, hoverConnectedEdges:false, selectConnectedEdges:false, multiselect:false }
      : BASE_INTERACTION;

    if (isLarge && modeOpts.physics) {
      modeOpts.physics = {
        ...modeOpts.physics,
        stabilization: {
          ...modeOpts.physics.stabilization,
          iterations:     Math.max(modeOpts.physics.stabilization?.iterations || 250, 500),
          updateInterval: modeOpts.physics.stabilization?.updateInterval || 30,
        },
      };
    }

    return {
      autoResize: true,
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      ...modeOpts,
      nodes: {
        font: { size:nodeSize, color:nodeFont, face:'"Inter",sans-serif',
                strokeWidth:isLight?4:3, strokeColor:isLight?'#ffffff':T.bg },
      },
      edges: {
        color:          { color:isLight?'#0c4a6e':'#0284c7', highlight:isLight?'#164e63':'#38bdf8', hover:isLight?'#06578c':'#60a5fa', opacity:1 },
        width:          isLight ? 2.5 : 2.4,
        smooth:         smoothEdge,
        font:           edgeFont,
        selectionWidth: 4,
        hoverWidth:     3.5,
        arrows:         { to:{ enabled:!zoomedOut, scaleFactor:1.0, type:'arrow' } },
      },
      interaction,
    };
  }, [layoutMode, physicsOn, isLight, zoomScale, nodeCount, connectedView, stabilised]);

  /* ── initNetwork ─────────────────────────────────────────── */
  const initNetwork = useCallback(() => {
    if (!containerRef.current) return;
    setStabilised(false);
    networkRef.current?.destroy();
    networkRef.current = null;

    const network = new Network(
      containerRef.current,
      { nodes: nodesDS.current, edges: edgesDS.current },
      buildOptions()
    );
    networkRef.current = network;

    network.once('stabilizationIterationsDone', () => {
      setStabilised(true);
      smoothFit(network);
      setTimeout(() => {
        network.setOptions({ physics:{ enabled:false } });
        setPhysicsOn(false);
      }, FIT_DURATION + 80);
      setLoading(false);
    });

    network.on('stabilizationProgress', () => setStabilised(false));

    network.on('dragStart', params => {
      if (params.nodes.length > 0) network.setOptions({ physics:{ enabled:true } });
    });
    network.on('dragEnd', params => {
      if (params.nodes.length > 0) {
        setTimeout(() => {
          network.setOptions({ physics:{ enabled:false } });
          setPhysicsOn(false);
        }, 900);
      }
    });

    /* ── Hover node: highlight connected edges ─────────────── */
    network.on('hoverNode', params => {
      if (containerRef.current) containerRef.current.style.cursor = 'grab';
      if (!params?.node) return;
      const nodeId = params.node;
      if (hoveredNodeRef.current === nodeId) return;
      hoveredNodeRef.current = nodeId;

      const connectedNodes = new Set(network.getConnectedNodes(nodeId));
      connectedNodes.add(nodeId);
      const connectedEdges = new Set(network.getConnectedEdges(nodeId));

      const nodeUpdates = nodesDS.current.get().reduce((acc, n) => {
        const target = connectedViewRef.current ? (connectedNodes.has(n.id) ? 1 : 0.08) : 1;
        if (n.opacity !== target) acc.push({ id:n.id, opacity:target });
        return acc;
      }, []);
      if (nodeUpdates.length) nodesDS.current.update(nodeUpdates);

      const edgeUpdates = edgesDS.current.get().reduce((acc, e) => {
        if (connectedEdges.has(e.id)) {
          acc.push({
            id: e.id,
            color: { color:isLight?'#075985':'#0c4a6e', highlight:isLight?'#0ea5e9':'#7dd3fc', hover:isLight?'#0ea5e9':'#7dd3fc', opacity:1 },
            width: 4,
          });
        } else {
          const targetOpacity = connectedViewRef.current ? 0.08 : (e.color?.opacity ?? 1);
          acc.push({ id:e.id, color:{ ...(e.color||{}), opacity:targetOpacity }, width: connectedViewRef.current ? 1 : (e._baseWidth||2) });
        }
        return acc;
      }, []);
      if (edgeUpdates.length) edgesDS.current.update(edgeUpdates);
    });

    /* ── Blur node: restore defaults ───────────────────────── */
    network.on('blurNode', () => {
      if (containerRef.current) containerRef.current.style.cursor = 'default';
      hoveredNodeRef.current = null;

      const nodeUpdates = nodesDS.current.get().reduce((acc, n) => {
        const target = n.rawData?.status === 'offline' ? 0.5 : 1;
        if (n.opacity !== target) acc.push({ id:n.id, opacity:target });
        return acc;
      }, []);
      if (nodeUpdates.length) nodesDS.current.update(nodeUpdates);

      const edgeUpdates = edgesDS.current.get().reduce((acc, e) => {
        acc.push({ id:e.id, color:{ ...(e.color||{}), opacity: isLight?1:0.95 }, width: e._baseWidth||2 });
        return acc;
      }, []);
      if (edgeUpdates.length) edgesDS.current.update(edgeUpdates);
    });

    network.on('dragging', () => { if (containerRef.current) containerRef.current.style.cursor = 'grabbing'; });
    network.on('zoom', params => setZoomScale(params.scale));

    /* ── Left-click ────────────────────────────────────────── */
    network.on('click', params => {
      setCtxMenu(null);
      if (!params.nodes.length) return;
      const nd = nodesDS.current.get(params.nodes[0]);
      if (!nd) return;
      if (nd.isPort) { setSelNode(nd); setSelNodeData(null); }
    });

    /* ── Right-click ───────────────────────────────────────── */
    network.on('oncontext', params => {
      params.event.preventDefault();
      if (!params.nodes.length) { setCtxMenu(null); return; }
      const nd = nodesDS.current.get(params.nodes[0]);
      if (!nd) return;
      setCtxMenu({ x: params.event.clientX, y: params.event.clientY, node: nd });
    });

    /* ── Double-click (touch-friendly context menu) ─────────── */
    network.on('doubleClick', params => {
      if (!params.nodes.length) return;
      const nd = nodesDS.current.get(params.nodes[0]);
      if (!nd) return;
      const dom = params.event;
      const cx = dom.center?.x ?? dom.clientX ?? 0;
      const cy = dom.center?.y ?? dom.clientY ?? 0;
      setCtxMenu({ x:cx, y:cy, node:nd });
    });
  }, [
    buildOptions, containerRef, networkRef, nodesDS, edgesDS,
    hoveredNodeRef, connectedViewRef, isLight,
    setStabilised, setPhysicsOn, setLoading,
    setZoomScale, setCtxMenu, setSelNode, setSelNodeData,
  ]);

  return { buildOptions, initNetwork };
};
