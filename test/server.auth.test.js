const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test_secret_para_tests_unitarios_32chars';

const { createToken, verifyToken, requireAdmin } = require('../server/utils/auth');

// ── createToken / verifyToken ─────────────────────────────────────────────────

test('createToken genera un JWT válido que verifyToken puede leer', () => {
    const payload = { id: '123', name: 'Ana', role: 'admin' };
    const token = createToken(payload);
    assert.ok(typeof token === 'string');
    const decoded = verifyToken(token);
    assert.equal(decoded.id, payload.id);
    assert.equal(decoded.name, payload.name);
    assert.equal(decoded.role, payload.role);
});

test('verifyToken lanza error con token manipulado', () => {
    const token = createToken({ id: '1', role: 'admin' });
    const tampered = token.slice(0, -5) + 'XXXXX';
    assert.throws(() => verifyToken(tampered));
});

test('verifyToken lanza error con token de firma diferente', () => {
    const jwt = require('../server/node_modules/jsonwebtoken');
    const fakeToken = jwt.sign({ id: '1', role: 'admin' }, 'otra_clave_secreta');
    assert.throws(() => verifyToken(fakeToken));
});

// ── requireAdmin middleware ───────────────────────────────────────────────────

const makeRes = () => {
    const res = { _status: 200, _body: null };
    res.status = (code) => { res._status = code; return res; };
    res.json   = (body)  => { res._body  = body; return res; };
    return res;
};

test('requireAdmin llama next() con token de admin válido', () => {
    const token = createToken({ id: '1', name: 'Admin', role: 'admin' });
    const req = { cookies: { pelicanToken: token } };
    const res = makeRes();
    let nextCalled = false;
    requireAdmin(req, res, () => { nextCalled = true; });
    assert.ok(nextCalled);
    assert.equal(req.user.role, 'admin');
});

test('requireAdmin devuelve 403 con token de conductor (no admin)', () => {
    const token = createToken({ id: '2', name: 'Pepe', role: 'driver' });
    const req = { cookies: { pelicanToken: token } };
    const res = makeRes();
    requireAdmin(req, res, () => assert.fail('next no debe llamarse'));
    assert.equal(res._status, 403);
    assert.equal(res._body.message, 'Forbidden');
});

test('requireAdmin devuelve 401 sin cookie', () => {
    const req = { cookies: {} };
    const res = makeRes();
    requireAdmin(req, res, () => assert.fail('next no debe llamarse'));
    assert.equal(res._status, 401);
    assert.equal(res._body.message, 'Unauthorized');
});

test('requireAdmin devuelve 401 con token inválido', () => {
    const req = { cookies: { pelicanToken: 'esto.no.es.un.jwt' } };
    const res = makeRes();
    requireAdmin(req, res, () => assert.fail('next no debe llamarse'));
    assert.equal(res._status, 401);
    assert.equal(res._body.message, 'Invalid token');
});

test('requireAdmin devuelve 401 sin cookies en el objeto request', () => {
    const req = {};
    const res = makeRes();
    requireAdmin(req, res, () => assert.fail('next no debe llamarse'));
    assert.equal(res._status, 401);
});
