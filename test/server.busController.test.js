const test = require('node:test');
const assert = require('node:assert/strict');

const { FULL_ROUTE } = require('../server/data/route');

const loadFreshController = () => {
  const modulePath = require.resolve('../server/busController');
  delete require.cache[modulePath];
  return require('../server/busController');
};

test('busController exporta calculateBusPosition y updateSimulationTimeByStopId', () => {
  const controller = loadFreshController();
  assert.equal(typeof controller.calculateBusPosition, 'function');
  assert.equal(typeof controller.updateSimulationTimeByStopId, 'function');
});

test('calculateBusPosition devuelve un punto válido de FULL_ROUTE', () => {
  const { calculateBusPosition } = loadFreshController();
  const point = calculateBusPosition();
  assert.ok(Array.isArray(point));
  assert.equal(point.length, 2);
  assert.ok(FULL_ROUTE.some(([lat, lng]) => lat === point[0] && lng === point[1]));
});

test('updateSimulationTimeByStopId acepta stopId válidos', () => {
  const { updateSimulationTimeByStopId } = loadFreshController();
  assert.equal(updateSimulationTimeByStopId(2), true);
  assert.equal(updateSimulationTimeByStopId(8), true);
  assert.equal(updateSimulationTimeByStopId(17), true);
  assert.equal(updateSimulationTimeByStopId(22), true);
});

test('updateSimulationTimeByStopId rechaza stopId no mapeados', () => {
  const { updateSimulationTimeByStopId } = loadFreshController();
  assert.equal(updateSimulationTimeByStopId(999), false);
});
