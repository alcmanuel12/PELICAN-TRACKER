const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const translationsUrl = pathToFileURL(
  path.resolve(__dirname, '../client/src/utils/translations.js')
).href;

test('translations contiene idiomas es y en', async () => {
  const { translations } = await import(translationsUrl);
  assert.ok(translations.es);
  assert.ok(translations.en);
});

test('es y en comparten exactamente las mismas claves', async () => {
  const { translations } = await import(translationsUrl);
  const esKeys = Object.keys(translations.es).sort();
  const enKeys = Object.keys(translations.en).sort();
  assert.deepEqual(esKeys, enKeys);
});

test('todas las traducciones son strings no vacíos', async () => {
  const { translations } = await import(translationsUrl);
  for (const lang of ['es', 'en']) {
    for (const value of Object.values(translations[lang])) {
      assert.equal(typeof value, 'string');
      assert.ok(value.trim().length > 0);
    }
  }
});

test('valida un subconjunto de traducciones esperadas', async () => {
  const { translations } = await import(translationsUrl);
  assert.equal(translations.es.settings, 'CONFIGURACIÓN');
  assert.equal(translations.en.settings, 'SETTINGS');
  assert.equal(translations.es.hideStops, 'Ocultar');
  assert.equal(translations.en.hideStops, 'Hide');
});
