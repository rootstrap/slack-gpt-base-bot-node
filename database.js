const { Pool, Client } = require("pg");

async function databaseMetadata() {
  const pool = new Pool();

  const res = await pool.query(
    `SELECT relname FROM pg_class WHERE relkind='r' AND relname !~ '^(pg_|sql_)';`
  );
  return res.rows.map((row) => row.relname);
}

async function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const pool = new Pool();

    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query", error);
        reject(err);
      }

      let result = "";

      if (results === undefined) {
        result = "No results";
      } else if (results.rowCount > 0) {
        const { rows } = results;
        const columns = Object.keys(rows[0]);
        result = `${columns.join(", ")}\n`;
        for (const row of rows) {
          result += `${Object.values(row).join(", ")}\n`;
        }
      } else {
        result = "No results";
      }

      resolve(result);
    });

    pool.end();
  });
}

async function getTableDefinition(tableNames) {
  const tables = tableNames.replaceAll("'", "").replaceAll(" ", "").split(",");

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
    const fields = results.rows.filter((row) => row.table_name == tableName);

    const fieldsResult = fields.reduce(
      (previousString, row) =>
        previousString.concat(`${row.column_name}: ${row.data_type}\n`),
      ""
    );
    return previousValues.concat(`\n${tableName}\n\n ${fieldsResult}`);
  }, "");
  return result;
}

module.exports = { databaseMetadata, executeQuery, getTableDefinition };
