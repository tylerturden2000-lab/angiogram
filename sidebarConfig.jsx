/**
 * sidebarConfig.jsx
 * ──────────────────────────────────────────────────────────────
 * Drives the main sidebar navigation.
 *
 * HOW TO ADD A NEW SIDEBAR ITEM:
 *   1. Import (or inline) the icon you want.
 *   2. Add an object to SIDEBAR_NAV_ITEMS with:
 *        - key      : unique string matching the activeView key
 *        - label    : display name
 *        - icon     : JSX icon element
 *        - section  : 'main' | 'account' (grouping label)
 *        - badgeKey : (optional) key from a badge-count map
 *
 * ADD NEW SIDEBAR ITEMS HERE ↓
 */

import React from 'react';
import {
  Home, Layers, BarChart2, User, Bell, SlidersHorizontal, Settings,
} from 'lucide-react';

export const SIDEBAR_NAV_ITEMS = [
  // ── Main navigation ──────────────────────────────────────────
  {
    key:     'Empty',
    label:   'Home',
    icon:    <Home     size={14} />,
    section: 'main',
  },
  {
    key:     'DCM',
    label:   'Topology',
    icon:    <Layers   size={14} />,
    section: 'main',
  },
  {
    key:     'Assets',
    label:   'Assets',
    icon:    <BarChart2 size={14} />,
    section: 'main',
  },

  // ── Account items ─────────────────────────────────────────────
  {
    key:     '_profile',
    label:   'Profile',
    icon:    <User     size={14} />,
    section: 'account',
  },
  {
    key:      '_notifications',
    label:    'Notifications',
    icon:     <Bell    size={14} />,
    section:  'account',
    badgeKey: 'notifications', // resolved against badgeCounts map at render time
  },
  {
    key:     '_options',
    label:   'Options',
    icon:    <SlidersHorizontal size={14} />,
    section: 'account',
  },
];

/**
 * Bottom-bar items (Admin, etc.).
 * These live below the user chip but follow the same shape.
 *
 * ADD NEW BOTTOM NAV ITEMS HERE ↓
 */
export const SIDEBAR_BOTTOM_NAV_ITEMS = [
  {
    key:   'Admin',
    label: 'Admin',
    icon:  <Settings size={14} />,
  },
];
