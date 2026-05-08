import { COMPACT_SCALE_MIN, COMPACT_SCALE_MAX, FIT_DURATION } from '../constants/tokens';

/* ─────────────────────────────────────────────────────────────
   SMOOTH FIT HELPER
   • Clamps scale to COMPACT_SCALE_MIN..MAX
   • Computes true bounding-box centre from node positions
   • Single smooth eased moveTo — no double-fit flicker
───────────────────────────────────────────────────────────── */
export function smoothFit(network, opts = {}) {
  if (!network) return;
  const {
    minScale = COMPACT_SCALE_MIN,
    maxScale = COMPACT_SCALE_MAX,
    duration = FIT_DURATION,
  } = opts;

  network.fit({ animation: false });
  const rawScale = network.getScale();
  const clamped  = Math.min(maxScale, Math.max(minScale, rawScale));

  const positions = Object.values(network.getPositions());
  if (!positions.length) return;
  const xs = positions.map(p => p.x);
  const ys = positions.map(p => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;

  network.moveTo({
    position:  { x: cx, y: cy },
    scale:     clamped,
    animation: { duration, easingFunction: 'easeInOutCubic' },
  });
}

/* ─────────────────────────────────────────────────────────────
   NODE TYPE GUARD
───────────────────────────────────────────────────────────── */
export const isUserNode = (raw) => {
  if (!raw) return false;
  const type = String(raw.type || '').toUpperCase();
  const role = String(raw.role || '').toLowerCase();
  return raw.isUser === true || type === 'USER' || role === 'user' || type === 'PERSON';
};

/* ─────────────────────────────────────────────────────────────
   THEME HELPER — returns TH object for light or dark mode
───────────────────────────────────────────────────────────── */
import { T } from '../constants/tokens';

export const buildTheme = (isLight) =>
  isLight
    ? {
        bg:'#ffffff', surface:'#f8fafc', card:'#ffffff',
        border:'#e2e8f0', border2:'#cbd5e1',
        text:'#0f172a', textSub:'#475569', textDim:'#94a3b8',
      }
    : {
        bg:T.bg, surface:T.surface, card:T.card,
        border:T.border, border2:T.border2,
        text:T.text, textSub:T.textSub, textDim:T.textDim,
      };
