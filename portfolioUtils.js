/**
 * portfolioUtils.js
 * ──────────────────────────────────────────────────────────────
 * Pure utility functions for portfolio / view filtering logic.
 * No React or side-effects — easy to unit-test.
 */

/**
 * Given a selected portfolio and the full list of views, returns
 * only the views that the portfolio is allowed to display.
 *
 * If the portfolio has no `allowedViews` restriction, all views
 * are returned.
 *
 * @param {object|null} portfolio      - currently selected portfolio
 * @param {Array}       allViews       - full list of view objects from the API
 * @param {Array}       portfoliosList - raw portfolios list from the API (may
 *                                       contain richer allowedViews data)
 * @returns {Array} filtered view list
 */
export const getViewsForPortfolio = (portfolio, allViews, portfoliosList) => {
  if (!portfolio || !Array.isArray(allViews) || allViews.length === 0) {
    return allViews || [];
  }

  const raw = Array.isArray(portfoliosList)
    ? portfoliosList.find(p => p.name === portfolio.name)
    : null;

  const allowed = raw?.allowedViews || portfolio.allowedViews;

  if (!allowed || !Array.isArray(allowed) || allowed.length === 0) {
    return allViews;
  }

  return allViews.filter(v => allowed.includes(v.viewKey));
};

/**
 * Normalises a raw portfolio entry (which can be a plain string
 * or a rich object from the API) into a consistent shape.
 *
 * @param {string|object} raw
 * @returns {{ name: string, id: string, allowedViews: Array }}
 */
export const normalisePortfolio = (raw) => ({
  name:         typeof raw === 'object' ? raw.name : raw,
  id:           raw?._id?.$oid || raw?._id || (typeof raw === 'string' ? raw : raw.name),
  allowedViews: raw?.allowedViews || [],
});
