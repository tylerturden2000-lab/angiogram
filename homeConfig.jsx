/**
 * homeConfig.jsx
 * ──────────────────────────────────────────────────────────────
 * Configuration for the Home (landing) page:
 *   - Quick-access cards
 *   - Network-domain chips
 *   - Live-insight stat cards (static / mock data shown until
 *     real telemetry is wired in)
 *
 * HOW TO ADD A NEW QUICK-ACCESS CARD:
 *   Append an object to QUICK_ACCESS_CARDS:
 *     { icon, title, desc, viewKey, accent, tag }
 *   'viewKey' must match a key in sidebarConfig / viewRegistry.
 *
 * HOW TO ADD A NEW DOMAIN CHIP:
 *   Append an object to DOMAIN_CHIPS:
 *     { label, abbr, cls, desc, viewKey }
 *
 * ADD NEW HOME PAGE SECTIONS HERE ↓
 */

import React from 'react';
import { Layers, BarChart2, Shield } from 'lucide-react';

// ── Quick-access cards ────────────────────────────────────────
export const QUICK_ACCESS_CARDS = [
  {
    icon:    <Layers    size={20} />,
    title:   'Network Topology',
    desc:    'Visualise L2/L3 layers with real-time traffic flow',
    viewKey: 'DCM',
    accent:  'primary',
    tag:     'Live',
  },
  {
    icon:    <BarChart2 size={20} />,
    title:   'Asset Inventory',
    desc:    'Hardware, firmware, and lifecycle tracking',
    viewKey: 'Assets',
    accent:  'blue',
    tag:     'Updated',
  },
  {
    icon:    <Shield    size={20} />,
    title:   'Admin Console',
    desc:    'Configure rules, users, and discovery policies',
    viewKey: 'Admin',
    accent:  'amber',
    tag:     'Settings',
  },
  // ADD NEW QUICK-ACCESS CARDS HERE ↓
];

// ── Domain chips ──────────────────────────────────────────────
export const DOMAIN_CHIPS = [
  { label: 'Topology Map',    abbr: 'L2', cls: 'd-blue',    desc: 'Layer 2/3 mapping',        viewKey: 'DCM'    },
  { label: 'Asset Discovery', abbr: 'AS', cls: 'd-primary', desc: 'Auto-scan inventory',      viewKey: 'Assets' },
  { label: 'Active Alerts',   abbr: 'AL', cls: 'd-amber',   desc: 'Threshold notifications',  viewKey: null     }, // no dedicated page yet
  { label: 'Admin Console',   abbr: 'AD', cls: 'd-red',     desc: 'Rules & policies',         viewKey: 'Admin'  },
  // ADD NEW DOMAIN CHIPS HERE ↓
];

// ── Stat spark data (purely presentational / mock) ────────────
export const HOME_STAT_CARDS = [
  {
    color:    'var(--blue)',
    iconKey:  'activity',
    label:    'Traffic Throughput',
    value:    '2.4',
    unit:     'Gb/s',
    badge:    { type: 'up', label: '+12.4%' },
    progress: { label: 'Peak utilization', val: '68%', pct: 68, color: 'var(--blue)' },
    sparks:   [14,18,12,22,16,24,20,28,22,30,26,32],
  },
  {
    color:    'var(--green)',
    iconKey:  'shield',
    label:    'Network Health',
    value:    '98.5',
    unit:     '%',
    badge:    { type: 'up', label: '+0.3%' },
    progress: { label: 'Uptime SLA', val: '99.9%', pct: 98.5, color: 'var(--green)' },
    sparks:   [20,22,18,24,22,26,24,28,26,30,28,32],
  },
  {
    color:    'var(--amber)',
    iconKey:  'alert',
    label:    'Active Alerts',
    value:    '7',
    unit:     '',
    badge:    { type: 'down', label: '-3' },
    progress: { label: 'Critical / Warning', val: '2 / 5', pct: 28, color: 'var(--amber)' },
    sparks:   [24,28,22,18,16,14,12,10,8,9,7,7],
  },
  // ADD NEW STAT CARDS HERE ↓
];
