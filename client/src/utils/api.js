
export const API_URL = import.meta.env.VITE_API_URL || '';

const BASE = '';

const apiFetch = (path, init = {}) =>
    fetch(`${BASE}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...init,
    });

export const api = {
    get:    (path)       => apiFetch(path),
    post:   (path, body) => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
    patch:  (path, body) => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body) }),
    delete: (path)       => apiFetch(path, { method: 'DELETE' }),
    
};
