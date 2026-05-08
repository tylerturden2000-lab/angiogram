import routerPng     from '../../../../shared/assets/Icons/router.png';
import serverPng     from '../../../../shared/assets/Icons/server.png';
import serverDiskPng from '../../../../shared/assets/Icons/serverdisk.png';
import switchPng     from '../../../../shared/assets/Icons/switch.png';
import portPng       from '../../../../shared/assets/Icons/port.png';

/* ─────────────────────────────────────────────────────────────
   ICON MAP
───────────────────────────────────────────────────────────── */
export const ICONS = {
  server: serverDiskPng,
  router: routerPng,
  switch: switchPng,
  port:   portPng,
  portBlue: portPng,
};

/* ─────────────────────────────────────────────────────────────
   ICON STATUS COMPOSITOR
───────────────────────────────────────────────────────────── */
const _iconCache = {};

const STATUS_BADGE = {
  critical: { dot:'#ef4444', ring:'#ffffff', tone:'rgba(239,68,68,0.18)'  },
  warning:  { dot:'#f59e0b', ring:'#ffffff', tone:'rgba(245,158,11,0.14)' },
  offline:  { dot:'#6b7280', ring:'#ffffff', tone:'rgba(20,20,20,0.38)'   },
  unknown:  { dot:'#8b5cf6', ring:'#ffffff', tone:'rgba(139,92,246,0.14)' },
};

export const compositeStatusIcon = (srcUrl, status) => {
  const key = `${srcUrl}::${status}`;
  if (_iconCache[key]) return _iconCache[key];

  const promise = new Promise(resolve => {
    const cfg = STATUS_BADGE[status];
    if (!cfg) { resolve(srcUrl); return; }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight;
      const badgeR  = Math.max(10, Math.round(Math.min(W, H) * 0.13));
      const padding = Math.round(badgeR * 0.55);
      const canvas  = document.createElement('canvas');
      canvas.width  = W + padding;
      canvas.height = H + padding;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0, W, H);
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = cfg.tone; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';

      const bx = W - badgeR + padding * 0.6, by = H - badgeR + padding * 0.6;

      // Outer white halo
      ctx.beginPath(); ctx.arc(bx, by, badgeR + 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();

      // Outline
      ctx.beginPath(); ctx.arc(bx, by, badgeR + 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.2; ctx.stroke();

      // Coloured badge fill with radial gradient
      ctx.beginPath(); ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(bx - badgeR * 0.25, by - badgeR * 0.25, badgeR * 0.1, bx, by, badgeR);
      const dl = cfg.dot.replace('#','');
      const r  = parseInt(dl.slice(0,2), 16);
      const g2 = parseInt(dl.slice(2,4), 16);
      const b  = parseInt(dl.slice(4,6), 16);
      const lr = Math.min(255, Math.round(r  + (255-r)  * 0.45));
      const lg = Math.min(255, Math.round(g2 + (255-g2) * 0.45));
      const lb = Math.min(255, Math.round(b  + (255-b)  * 0.45));
      grad.addColorStop(0, `rgba(${lr},${lg},${lb},1)`);
      grad.addColorStop(1, cfg.dot);
      ctx.fillStyle = grad; ctx.fill();

      // Gloss highlight
      ctx.beginPath(); ctx.arc(bx - badgeR*0.28, by - badgeR*0.28, badgeR*0.32, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill();

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(srcUrl);
    img.src = srcUrl;
  });

  _iconCache[key] = promise;
  return promise;
};
