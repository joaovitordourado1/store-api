import assert from 'node:assert/strict';

const baseURL = 'http://127.0.0.1:' + (process.env.PORT || '4000');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function json(path, status = 200) {
  const response = await fetch(baseURL + path, { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, status, 'HTTP inesperado em ' + path);
  return response.json();
}

let ready = false;
for (let attempt = 0; attempt < 40; attempt++) {
  try {
    const ping = await json('/ping');
    assert.equal(ping.message, 'pong');
    ready = true;
    break;
  } catch (error) {
    if (attempt === 39) throw error;
    await sleep(500);
  }
}
assert.ok(ready, 'API nao iniciou');
console.log('[OK] GET /ping');

const products = await json('/products');
assert.ok(Array.isArray(products) && products.length >= 5);
console.log('[OK] GET /products (' + products.length + ' resultados)');

const banners = await json('/banners');
assert.ok(Array.isArray(banners) && banners.length >= 2);
console.log('[OK] GET /banners (' + banners.length + ' resultados)');

const notFound = await json('/products/99999999', 404);
assert.equal(notFound.error, 'Product not found');
console.log('[OK] GET /products/:id (404 esperado)');

console.log('SUCESSO: container Docker respondeu a testes HTTP com dados do PostgreSQL');
