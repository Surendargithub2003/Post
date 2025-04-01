
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
      "chunk-AYMWC4DQ.js"
    ],
    "route": "/auth"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-AYMWC4DQ.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-AYMWC4DQ.js"
    ],
    "route": "/auth/signup"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 23610, hash: 'de50a54c0e6e4936c7bb1a26b6e984fd1d8bbb00292518398c7b0e1183dbcb9d', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17184, hash: 'c802208c5f377d17481e17c26bf5dc3a45c296feffe3f403f57f7c9b9e984b51', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-36AW6TKX.css': {size: 6979, hash: 'vY6tjD/ce7M', text: () => import('./assets-chunks/styles-36AW6TKX_css.mjs').then(m => m.default)}
  },
};
