const test = require('node:test');
const assert = require('node:assert/strict');

const { FULL_ROUTE } = require('../server/data/route');

test('FULL_ROUTE existe y es un array', () => {
  assert.ok(Array.isArray(FULL_ROUTE));
});

test('FULL_ROUTE tiene 27 paradas de referencia', () => {
  assert.equal(FULL_ROUTE.length, 27);
});

test('cada punto de FULL_ROUTE es [lat, lng] numérico', () => {
  for (const point of FULL_ROUTE) {
    assert.ok(Array.isArray(point));
    assert.equal(point.length, 2);
    assert.equal(typeof point[0], 'number');
    assert.equal(typeof point[1], 'number');
  }
});

test('las coordenadas de FULL_ROUTE están en rango esperado de Carmona', () => {
  for (const [lat, lng] of FULL_ROUTE) {
    assert.ok(lat > 37 && lat < 38);
    assert.ok(lng < -5 && lng > -6);
  }
});
