// En producción el frontend se sirve desde el mismo origen que el backend,
// por lo que las rutas relativas apuntan automáticamente al servidor correcto.
// Para desarrollo local, Vite redirige /api → http://localhost:3000 (ver vite.config.js).
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
