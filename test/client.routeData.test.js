const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const routeDataUrl = pathToFileURL(
  path.resolve(__dirname, '../client/src/utils/routeData.js')
).href;

test('RUTA_BUS existe y es un array', async () => {
  const { RUTA_BUS } = await import(routeDataUrl);
  assert.ok(Array.isArray(RUTA_BUS));
});

test('RUTA_BUS tiene granularidad alta (más de 200 puntos)', async () => {
  const { RUTA_BUS } = await import(routeDataUrl);
  assert.ok(RUTA_BUS.length > 200);
});

test('cada punto de RUTA_BUS es [lat, lng] numérico', async () => {
  const { RUTA_BUS } = await import(routeDataUrl);
  for (const point of RUTA_BUS) {
    assert.ok(Array.isArray(point));
    assert.equal(point.length, 2);
    assert.equal(typeof point[0], 'number');
    assert.equal(typeof point[1], 'number');
  }
});

test('las coordenadas de RUTA_BUS caen en un rango geográfico razonable', async () => {
  const { RUTA_BUS } = await import(routeDataUrl);
  for (const [lat, lng] of RUTA_BUS) {
    assert.ok(lat > 37 && lat < 38);
    assert.ok(lng < -5 && lng > -6);
  }
});
