const test = require('node:test');
const assert = require('node:assert/strict');

const { sanitize } = require('../server/utils/sanitize');

test('sanitize escapa < y >', () => {
    assert.equal(sanitize('<script>'), '&lt;script&gt;');
});

test('sanitize escapa & " \'', () => {
    assert.equal(sanitize('a & b'), 'a &amp; b');
    assert.equal(sanitize('"comillas"'), '&quot;comillas&quot;');
    assert.equal(sanitize("it's"), 'it&#39;s');
});

test('sanitize no modifica texto limpio', () => {
    assert.equal(sanitize('Parada Central'), 'Parada Central');
    assert.equal(sanitize('Línea 1 - Norte'), 'Línea 1 - Norte');
});

test('sanitize devuelve cadena vacía con null o undefined', () => {
    assert.equal(sanitize(null), '');
    assert.equal(sanitize(undefined), '');
});

test('sanitize convierte números a string', () => {
    assert.equal(sanitize(42), '42');
});

test('sanitize bloquea payload XSS típico', () => {
    const xss = '<img src=x onerror="alert(1)">';
    const result = sanitize(xss);
    assert.ok(!result.includes('<'));
    assert.ok(!result.includes('>'));
    assert.ok(!result.includes('"'));
});
