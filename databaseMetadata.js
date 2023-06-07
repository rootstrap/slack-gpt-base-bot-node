const { Client } = require('pg');

async function databaseMetadata() {
  const client = new Client({
    host: 'localhost',
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  await client.connect();

  const res = await client.query(
    `SELECT relname FROM pg_class WHERE relkind='r' AND relname !~ '^(pg_|sql_)';`
  );
  return res.rows.map((row) => row.relname);
}

module.exports = databaseMetadata;
