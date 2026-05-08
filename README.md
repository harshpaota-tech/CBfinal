# CarbonBridge

Verified carbon credit marketplace — buy, sell, and retire credits from Verra (VCS), Gold Standard, and ACR.

> Developed by **Nomad Life Corporation**.

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

## License

Copyright (c) Nomad Life Corporation. All rights reserved.
