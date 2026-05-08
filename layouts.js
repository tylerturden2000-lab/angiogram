import { GitBranch, Circle } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   LAYOUT MODES
   hierarchical — clean UD tree, straight edges, no jitter
   cluster      — force-directed with high repulsion for spacing
───────────────────────────────────────────────────────────── */
export const LAYOUT_MODES = {
  hierarchical: {
    label: 'Hierarchy', icon: GitBranch,
    getOptions: (physOn, nodeCount = 0) => {
      const spread = Math.min(1.85, 1 + Math.max(0, nodeCount - 120) / 650);
      const levelSeparation = Math.round(280 * spread);
      const nodeSpacing     = Math.round(320 * spread);
      const treeSpacing     = Math.round(380 * spread);
      const springLength    = Math.round(240 * spread);
      const nodeDistance    = Math.round(320 * spread);
      return {
        layout: {
          improvedLayout: false,
          hierarchical: {
            enabled:              true,
            direction:            'LR',
            sortMethod:           'directed',
            levelSeparation,
            nodeSpacing,
            treeSpacing,
            blockShifting:        false,
            edgeMinimization:     true,
            parentCentralization: false,
            shakeTowards:         'roots',
          },
        },
        physics: {
          enabled: physOn,
          solver:  'hierarchicalRepulsion',
          hierarchicalRepulsion: {
            centralGravity: 0.03,
            springLength,
            springConstant: 0.004,
            nodeDistance,
            damping:        0.16,
          },
          stabilization: {
            enabled:        true,
            iterations:     Math.max(400, Math.min(1000, Math.round(nodeCount / 2))),
            updateInterval: 20,
            fit:            false,
          },
        },
      };
    },
  },
  cluster: {
    label: 'Cluster', icon: Circle,
    getOptions: (physOn, nodeCount = 0) => {
      const spread = Math.min(1.85, 1 + Math.max(0, nodeCount - 120) / 700);
      const springLength = Math.round(380 * spread);
      const avoidOverlap  = Math.min(1.8, 1.1 + (spread - 1) * 0.5);
      return {
        layout: {
          improvedLayout: false,
          hierarchical:   { enabled: false },
        },
        physics: {
          enabled: true,
          solver:  'barnesHut',
          barnesHut: {
            gravitationalConstant: -17000,
            centralGravity:        0.01,
            springLength,
            springConstant:        0.014,
            damping:               0.24,
            avoidOverlap,
          },
          stabilization: {
            enabled:        true,
            iterations:     Math.max(500, Math.min(900, Math.round(nodeCount / 2))),
            updateInterval: 18,
            fit:            false,
          },
          minVelocity: 0.75,
        },
      };
    },
  },
};
