# Network Angiogram — Refactored Architecture

## Quick-start: "How do I add…?"

### A new sidebar item
1. Open `src/core/config/sidebarConfig.jsx`
2. Add an object to `SIDEBAR_NAV_ITEMS` (or `SIDEBAR_BOTTOM_NAV_ITEMS`):
   ```js
   {
     key:     'Reports',        // must match the view key or be unique if no view
     label:   'Reports',
     icon:    <BarChart2 size={14} />,
     section: 'main',          // 'main' | 'account'
   }
   ```
3. Done. The sidebar renders it automatically.

---

### A new full-page view
1. Create your component, e.g. `src/modules/reports/ReportsPage.jsx`.
2. Open `src/core/config/viewRegistry.jsx` and add:
   ```js
   Reports: {
     component: ReportsPage,
     isTopology: false,
   }
   ```
3. Add the matching sidebar entry (above).
4. Done. Dashboard will render it when `activeView === 'Reports'`.

---

### A new topology view (live canvas)
Topology views come from the **API** (`/api/topology/views`).
No code changes needed — just add the view in your backend and it appears in the DCM selector automatically.

To add a custom icon for it:
- Open `src/core/config/iconConfig.jsx` and add an entry.

---

### A new portfolio
Portfolios come from the **API** (`/api/topology/portfolios`).
No code changes needed — add it via your backend or admin UI.

---

### A new quick-access card on the home page
1. Open `src/core/config/homeConfig.jsx`
2. Add to `QUICK_ACCESS_CARDS`:
   ```js
   {
     icon:    <YourIcon size={20} />,
     title:   'My Feature',
     desc:    'One-liner description',
     viewKey: 'MyView',         // matches viewRegistry key
     accent:  'blue',           // 'primary' | 'blue' | 'amber' | 'red'
     tag:     'New',
   }
   ```

---

## File map

```
src/
├── Dashboard.jsx                  ← Top-level orchestrator (rarely needs editing)
│
├── core/
│   ├── config/
│   │   ├── sidebarConfig.jsx      ← ADD NEW SIDEBAR ITEMS HERE
│   │   ├── viewRegistry.jsx       ← ADD NEW FULL-PAGE VIEWS HERE
│   │   ├── homeConfig.jsx         ← ADD NEW HOME PAGE SECTIONS HERE
│   │   ├── iconConfig.jsx         ← ADD NEW TOPOLOGY ICONS HERE
│   │   └── themeConfig.js         ← ADD NEW THEMES HERE
│   └── layout/
│       └── Sidebar.jsx            ← Sidebar component (reads from sidebarConfig)
│
├── shared/
│   ├── components/
│   │   ├── TimeSelector.jsx       ← Time-range dropdown
│   │   └── Toast.jsx              ← Notification toast
│   ├── hooks/
│   │   ├── useUser.js             ← Auth → user object
│   │   └── useTopologyData.js     ← API data fetching
│   └── utils/
│       └── portfolioUtils.js      ← Pure portfolio helpers
│
└── modules/
    ├── home/
    │   └── HomePage.jsx           ← Landing page
    └── dcm/
        └── DCMPage.jsx            ← Topology portfolio + view selector
```

## Principles

- **Config-driven**: sidebar, views, home cards, domain chips all read from config files.
- **No core changes for extensions**: future devs edit *only* config files or create new modules.
- **Zero behaviour change**: all logic is identical to the original Dashboard.jsx; it is only reorganised.
- **Simple**: no Redux, no context providers added, no extra abstraction layers.
