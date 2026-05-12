/**
 * Toast.jsx
 * ──────────────────────────────────────────────────────────────
 * Minimal toast notification banner.
 *
 * Props:
 *   show    : boolean
 *   message : string
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';

const Toast = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="na-toast">
      <CheckCircle size={13} /> {message}
    </div>
  );
};

export default Toast;
