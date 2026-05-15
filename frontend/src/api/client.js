const API = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('amar_admin_token');
}

async function request(method, path, { body, auth = false, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) data = await res.json();
  else data = await res.text();

  if (!res.ok) {
    const msg = data?.error || data?.message || `Erreur ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // ---------- public ----------
  listProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/api/products${q ? `?${q}` : ''}`);
  },
  getProduct: (idOrSlug) => request('GET', `/api/products/${idOrSlug}`),
  listCategories: () => request('GET', '/api/categories'),
  createOrder: (payload) => request('POST', '/api/orders', { body: payload }),

  // ---------- admin auth ----------
  login: (email, password) =>
    request('POST', '/api/admin/login', { body: { email, password } }),
  me: () => request('GET', '/api/admin/me', { auth: true }),

  // ---------- admin dashboard ----------
  dashboard: () => request('GET', '/api/admin/dashboard', { auth: true }),
  lowStock: () => request('GET', '/api/admin/low-stock', { auth: true }),

  // ---------- admin products ----------
  adminListProducts: (params = {}) => {
    const q = new URLSearchParams({ ...params, admin: '1', limit: 60 }).toString();
    return request('GET', `/api/products?${q}`, { auth: true });
  },
  createProduct: (payload) => request('POST', '/api/products', { body: payload, auth: true }),
  updateProduct: (id, payload) =>
    request('PUT', `/api/products/${id}`, { body: payload, auth: true }),
  toggleProduct: (id, active) =>
    request('PATCH', `/api/products/${id}/status`, { body: { active }, auth: true }),
  deleteProduct: (id) => request('DELETE', `/api/products/${id}`, { auth: true }),

  // ---------- admin images ----------
  uploadImages: (productId, files) => {
    const fd = new FormData();
    for (const f of files) fd.append('images', f);
    return request('POST', `/api/products/${productId}/images`, {
      body: fd,
      auth: true,
      isForm: true,
    });
  },
  deleteImage: (id) => request('DELETE', `/api/images/${id}`, { auth: true }),
  setMainImage: (id) => request('PATCH', `/api/images/${id}/main`, { auth: true }),

  // ---------- admin orders ----------
  adminListOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/api/admin/orders${q ? `?${q}` : ''}`, { auth: true });
  },
  adminGetOrder: (id) => request('GET', `/api/admin/orders/${id}`, { auth: true }),
  updateOrderStatus: (id, status) =>
    request('PATCH', `/api/admin/orders/${id}/status`, { body: { status }, auth: true }),

  // ---------- admin categories ----------
  createCategory: (name) => request('POST', '/api/categories', { body: { name }, auth: true }),
  deleteCategory: (id) => request('DELETE', `/api/categories/${id}`, { auth: true }),
};

export function setToken(token) {
  if (token) localStorage.setItem('amar_admin_token', token);
  else localStorage.removeItem('amar_admin_token');
}

export function imgUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API}${url}`;
}
