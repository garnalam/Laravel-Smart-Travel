// resources/js/bootstrap.js

import axios from 'axios';
window.axios = axios;

// Always send cookies for cross-origin (dev: 5173 -> 8000)
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Read CSRF meta token (Blade layout)
const csrfMetaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfMetaToken) {
  axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfMetaToken;
} else {
  console.warn('[bootstrap] CSRF meta token not found');
}

