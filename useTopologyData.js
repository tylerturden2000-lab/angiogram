/**
 * useTopologyData.js
 * ──────────────────────────────────────────────────────────────
 * Fetches portfolios and views from the backend and exposes
 * loading flags.  Keeps all API concerns out of Dashboard.jsx.
 *
 * HOW TO ADD A NEW API CALL:
 *   Add a new axios.get() inside the useEffect below, store
 *   the result in a new useState, and return it.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

// ── API base URL ──────────────────────────────────────────────
// Update this if the backend moves.
const API_BASE = 'http://localhost:8080/api/topology';

const useTopologyData = () => {
  const [portfolios,        setPortfolios]        = useState([]);
  const [allViews,          setAllViews]           = useState([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);
  const [loadingViews,      setLoadingViews]       = useState(true);

  useEffect(() => {
    // Fetch portfolios
    axios
      .get(`${API_BASE}/portfolios`)
      .then(r => setPortfolios(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoadingPortfolios(false));

    // Fetch topology views
    // ADD NEW API CALLS HERE ↓
    axios
      .get(`${API_BASE}/views`)
      .then(r => setAllViews(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoadingViews(false));
  }, []);

  return { portfolios, allViews, loadingPortfolios, loadingViews };
};

export default useTopologyData;
