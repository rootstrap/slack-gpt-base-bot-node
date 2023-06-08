const { Client } = require("pg");

async function databaseMetadata() {
  const client = new Client({
    host: "localhost",
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

async function getTableDefinition(tableNames) {
  const tables = tableNames.replaceAll("'", "").split(",");
  console.log(
    "🚀 ~ file: databaseMetadata.js:22 ~ getTableDefinition ~ tables:",
    tables
  );

  const client = new Client({
    host: "localhost",
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  await client.connect();
  const query = `
        SELECT table_name, column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name IN (${tableNames});
    `;
  const results = await client.query(query);
  const result = tables.reduce((previousValues, tableName) => {
    console.log(
      "🚀 ~ file: databaseMetadata.js:43 ~ result ~ tableName:",
      tableName
    );
    const fields = results.rows.filter((row) => row.table_name == tableName);
    console.log(
      "🚀 ~ file: databaseMetadata.js:44 ~ result ~ results.rows:",
      results.rows
    );
    console.log(
      "🚀 ~ file: databaseMetadata.js:52 ~ getTableDefinition ~ results:",
      fields
    );

    const fieldsResult = fields.reduce(
      (previousString, row) =>
        previousString.concat(`${row.column_name}: ${row.data_type}\n`),
      ""
    );
    return previousValues.concat(`\n${tableName}\n\n ${fieldsResult}`);
  }, "");
  console.log("🚀 ~ file: databaseMetadata.js:59 ~ result ~ result:", result);
}

module.exports = [databaseMetadata, getTableDefinition];
