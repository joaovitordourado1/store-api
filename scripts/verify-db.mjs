import assert from 'node:assert/strict';
import pg from 'pg';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL nao definida');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const requiredTables = [
    'User', 'UserAddress', 'Banner', 'Product', 'ProductImage',
    'ProductMetaData', 'Category', 'CategoryMetadata', 'MetaDataValue',
    'Order', 'orderProduct', '_prisma_migrations'
  ];
  const { rows: tables } = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
  );
  const existing = new Set(tables.map(row => row.table_name));
  for (const name of requiredTables) assert.ok(existing.has(name), 'Tabela ausente: ' + name);
  console.log('[OK] ' + requiredTables.length + ' tabelas presentes');

  const requiredColumns = {
    User: ['id', 'email', 'name', 'password'],
    Product: ['id', 'label', 'price', 'categoryId'],
    Category: ['id', 'slug', 'name'],
    Order: ['id', 'userId', 'totalPrice', 'status'],
    orderProduct: ['id', 'orderId', 'productId', 'quantity']
  };
  const { rows: columns } = await pool.query(
    "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'"
  );
  const columnSet = new Set(columns.map(row => row.table_name + '.' + row.column_name));
  for (const [table, names] of Object.entries(requiredColumns)) {
    for (const column of names) assert.ok(columnSet.has(table + '.' + column), 'Coluna ausente: ' + table + '.' + column);
  }
  console.log('[OK] Colunas principais do schema presentes');

  const { rows: foreignKeys } = await pool.query(
    "SELECT COUNT(*)::int AS total FROM pg_constraint WHERE contype = 'f' AND connamespace = 'public'::regnamespace"
  );
  assert.ok(foreignKeys[0].total >= 9, 'Chaves estrangeiras ausentes');
  const { rows: indexes } = await pool.query(
    "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public'"
  );
  const indexSet = new Set(indexes.map(row => row.tablename + '.' + row.indexname));
  assert.ok(indexSet.has('User.User_email_key'), 'Indice unico de email ausente');
  assert.ok(indexSet.has('Category.Category_slug_key'), 'Indice unico de slug ausente');
  console.log('[OK] Chaves estrangeiras e indices de unicidade');

  const { rows: migrations } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL'
  );
  assert.ok(migrations[0].total >= 1, 'Nenhuma migration aplicada');
  console.log('[OK] Migration registrada no banco');

  for (const [table, minimum] of [
    ['User', 2], ['Category', 3], ['Product', 5], ['Banner', 2],
    ['MetaDataValue', 6], ['Order', 2], ['orderProduct', 3]
  ]) {
    // Nomes de tabela estaticos definidos neste teste, nao recebidos do usuario.
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM "' + table + '"');
    assert.ok(rows[0].total >= minimum, table + ': registros insuficientes');
    console.log('[OK] ' + table + ': ' + rows[0].total + ' registros');
  }

  const { rows: user } = await pool.query(
    'SELECT id FROM "User" WHERE email = $1', ['joao@email.com']
  );
  assert.equal(user.length, 1, 'Usuario inserido pelo seed nao encontrado');

  const { rows: products } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM "Product" p JOIN "Category" c ON p."categoryId" = c.id'
  );
  assert.ok(products[0].total >= 5, 'Produtos nao possuem categorias relacionadas');

  const { rows: orderItems } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM "orderProduct" op JOIN "Order" o ON op."orderId" = o.id JOIN "Product" p ON op."productId" = p.id'
  );
  assert.ok(orderItems[0].total >= 3, 'Itens de pedido sem relacoes validas');
  console.log('[OK] Seed e relacionamentos validados');
}

try {
  await main();
  console.log('SUCESSO: migrations (estrutura) e seed (dados) verificados.');
} catch (error) {
  console.error('FALHA:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
