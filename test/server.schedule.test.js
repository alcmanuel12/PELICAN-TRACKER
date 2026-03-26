const test = require('node:test');
const assert = require('node:assert/strict');

const { SCHEDULE } = require('../server/data/schedule');
const { FULL_ROUTE } = require('../server/data/route');

test('SCHEDULE existe y es un array', () => {
  assert.ok(Array.isArray(SCHEDULE));
});

test('SCHEDULE tiene 5 hitos temporales', () => {
  assert.equal(SCHEDULE.length, 5);
});

test('los offsets de SCHEDULE son crecientes y cierran en 45 min', () => {
  assert.equal(SCHEDULE[0].timeOffset, 0);
  assert.equal(SCHEDULE[SCHEDULE.length - 1].timeOffset, 45);

  for (let i = 1; i < SCHEDULE.length; i++) {
    assert.ok(SCHEDULE[i].timeOffset > SCHEDULE[i - 1].timeOffset);
  }
});

test('los índices de paradas de SCHEDULE están dentro de FULL_ROUTE', () => {
  for (const stop of SCHEDULE) {
    assert.ok(Number.isInteger(stop.index));
    assert.ok(stop.index >= 0 && stop.index < FULL_ROUTE.length);
  }
});
