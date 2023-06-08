const { Pool } = require("pg");

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

module.exports = { databaseMetadata, executeQuery };
