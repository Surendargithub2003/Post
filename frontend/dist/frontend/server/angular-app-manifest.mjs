
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "route": "/"
  },
  {
    "renderMode": 0,
    "route": "/create"
  },
  {
    "renderMode": 0,
    "route": "/edit/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-IY7FLWRN.js"
    ],
    "route": "/auth"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-IY7FLWRN.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-IY7FLWRN.js"
    ],
    "route": "/auth/signup"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 23610, hash: 'd12ce48a2453dd1a6ad8835347a7beb34d04c9dd9810c915373a0934b237fe1d', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17184, hash: '087134922463e10ecc59e9c1879080c2134231891ca30afe02143b9a4283e5a5', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-36AW6TKX.css': {size: 6979, hash: 'vY6tjD/ce7M', text: () => import('./assets-chunks/styles-36AW6TKX_css.mjs').then(m => m.default)}
  },
};
