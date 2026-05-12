/**
 * viewRegistry.jsx
 * ──────────────────────────────────────────────────────────────
 * Central map of view keys → React components.
 * Dashboard's renderMainContent() consults this to decide what
 * to render without needing a long if/else chain.
 *
 * HOW TO ADD A NEW FULL-PAGE VIEW:
 *   1. Create your component (e.g. src/modules/reports/ReportsPage.jsx).
 *   2. Import it below.
 *   3. Add an entry in VIEW_REGISTRY with a unique key.
 *   4. Add a matching entry in sidebarConfig.jsx so users can reach it.
 *   5. That's it — no changes to Dashboard.jsx needed.
 *
 * SPECIAL KEYS (handled separately in Dashboard):
 *   'Empty'  → home / landing page rendered inline
 *   'Assets' → AssetInventory
 *   'Admin'  → TopologyAdmin
 *   'DCM'    → topology selector page
 *   any other key → TopologyView (live topology)
 *
 * ADD NEW VIEWS HERE ↓
 */

import React from 'react';
import { AssetInventory }  from '../../../topology/pages';
import { TopologyAdmin }   from '../../../topology/pages';

export const VIEW_REGISTRY = {
  /**
   * Format:
   *   [viewKey]: {
   *     component : React component or render function
   *     isTopology: boolean  — true → full-screen capable topology view
   *   }
   *
   * ADD NEW ENTRIES BELOW ↓
   */
  Assets: {
    component: AssetInventory,
    isTopology: false,
  },
  Admin: {
    component: TopologyAdmin,
    isTopology: false,
  },

  // Example of how you'd add a future "Reports" page:
  // Reports: {
  //   component: ReportsPage,
  //   isTopology: false,
  // },
};

/**
 * Keys that are handled as topology (live) views.
 * Any activeView NOT in this set and NOT in VIEW_REGISTRY
 * is treated as a TopologyView automatically.
 */
export const NON_TOPOLOGY_KEYS = new Set(['Empty', 'Assets', 'Admin', 'DCM']);
