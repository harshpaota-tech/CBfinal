# CarbonBridge

Verified carbon credit marketplace — buy, sell, and retire credits from Verra (VCS), Gold Standard, and ACR.

> Developed by **Carbon Bridge Pvt. Ltd.** — India's First Environmental Credit Marketplace (Carbon · Soil · Plastic · CBG · Biogas).

## Tech stack

- [React 18](https://react.dev) + [Vite 5](https://vitejs.dev)
- [Axios](https://axios-http.com) for the API client
- Plain inline styles + a small theme object (`T` exported from `src/App.jsx`)

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on <http://localhost:5173> and proxies `/api/*` to a backend at <http://localhost:5000> (configured in `vite.config.js`).

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

## Project layout

```
.
├── index.html               # Vite entry HTML
├── vite.config.js           # Vite + React plugin + /api proxy to :5000
├── package.json
└── src
    ├── main.jsx             # React entry
    ├── App.jsx              # Page router + shared theme tokens (export T)
    └── components
        ├── Home.jsx         # Landing page
        ├── HowItWorks.jsx   # Explainer page
        └── ui
            ├── Btn.jsx      # Button (variants: solid / outline / ghost)
            └── Badge.jsx    # Pill-shaped tag
```

## Backend / API

The frontend calls `GET /api/credits?sort=price-asc` on the home page. Run any compatible backend on port `5000` (or change the proxy target in `vite.config.js`). Without a backend the app still renders — featured projects simply stay empty.

## Deploying to Render

This repo includes a [`render.yaml`](./render.yaml) blueprint, so deployment is one click.

### Option A — Blueprint (recommended)

1. Push this branch to GitHub (already done).
2. Go to <https://dashboard.render.com/blueprints> → **New Blueprint Instance**.
3. Pick this repo (`harshpaota-tech/CBfinal`) and the branch.
4. Render reads `render.yaml` and provisions a free Static Site:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
   - SPA rewrite (`/*` → `/index.html`) and long-cache headers for `/assets/*` are pre-configured.
5. Click **Apply** — first deploy takes ~1–2 min.

### Option B — Manual Static Site

1. <https://dashboard.render.com> → **New +** → **Static Site** → connect this repo.
2. Settings:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
   - **Rewrite/Redirect rule:** source `/*`, destination `/index.html`, type `Rewrite` (so deep links work).
3. Create.

### About the `/api` calls in production

`vite.config.js` proxies `/api/*` to `http://localhost:5000` **for local dev only**. On Render the static site has no proxy, so `GET /api/credits` will return 404 and the "Featured Projects" section silently stays hidden. To fix:

- Deploy the backend separately (e.g. another Render Web Service at `https://carbonbridge-api.onrender.com`).
- Then either:
  - **(simple)** change the URL in `src/components/Home.jsx` to the absolute backend URL, **or**
  - **(cleaner)** read it from an env var:
    ```jsx
    axios.get(`${import.meta.env.VITE_API_URL}/credits?sort=price-asc`)
    ```
    and set `VITE_API_URL=https://carbonbridge-api.onrender.com/api` in Render's site → **Environment**. (Vite inlines `VITE_*` vars at build time.)

## License

Copyright (c) Carbon Bridge Pvt. Ltd. All rights reserved.
