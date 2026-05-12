/**
 * iconConfig.jsx
 * ──────────────────────────────────────────────────────────────
 * Central icon registry for topology view icons.
 *
 * HOW TO ADD A NEW ICON:
 *   1. Import the icon from 'lucide-react'
 *   2. Add an entry below: key is the string stored in the DB,
 *      value is the rendered element.
 *
 * ADD NEW ICONS HERE ↓
 */

import React from 'react';
import { Zap, Monitor, Cpu, Waypoints, Star, Network, Globe, Server } from 'lucide-react';

export const ICON_MAP = {
  Zap:       <Zap       size={14} />,
  Monitor:   <Monitor   size={14} />,
  Cpu:       <Cpu       size={14} />,
  Waypoints: <Waypoints size={14} />,
  Star:      <Star      size={14} />,
  Network:   <Network   size={14} />,
  Globe:     <Globe     size={14} />,
  Server:    <Server    size={14} />,
};

/** Returns the icon element for a given key, or a fallback Zap icon. */
export const getIcon = (key) => ICON_MAP[key] ?? <Zap size={14} />;
