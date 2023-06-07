const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const openaiChatModel = process.env.OPENAI_CHAT_MODEL;
const { Pool } = require("pg");

// Create a new connection pool
const pool = new Pool({
  user: "your_user",
  host: "localhost",
  database: "your_database",
  password: "your_password",
  port: 5430, // or your PostgreSQL port number
});

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log("SERVER IS UP ON PORT:", PORT);
});

async function executeQuery(query) {
  return new Promise((resolve, reject) => {
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

    // Close the connection pool when finished
    pool.end();
  });
}

app.get("/", async (req, res) => {
  const query = `SELECT
  people.id,
  people.first_name || ' ' || people.last_name AS full_name,
  departments.name AS department,
  locations.city || ', ' || locations.country AS location,
  time_offs.start_date,
  time_offs.end_date,
  time_offs.time_type
FROM
  people
  JOIN time_offs ON people.id = time_offs.person_id
  JOIN departments ON people.department_id = departments.id
  JOIN locations ON people.location_id = locations.id
WHERE
  time_offs.start_date >= '2023-06-11'
  AND time_offs.start_date <= '2023-06-17'
  AND time_offs.status = 'approved'
  AND people.ignored = false
  AND people.discarded_at IS NULL
ORDER BY
  people.first_name,
  people.last_name,
  time_offs.start_date;`;

  const dbResponse = await executeQuery(query);

  const result = await openai.createChatCompletion({
    temperature: 1.2,
    model: openaiChatModel,
    messages: [
      {
        role: "system",
        content: `You will receive a query and the result of executing the query on a database.
                  You should answer with the result of the query.
                  You should only answer with the response, without explanation.
                  The preferred type of visualization should be visual (charts) but if the data is not representative using charts,
                  you should write a text with the response.
                  For showing the result I want a nice HTML with colors and style. If the result has many rows, I want a table with style and nice colours.
                  Also, if you could make a chart with the result, do it in order to show it in a web page.
                  -----------------------------------------
                  Query: ${query}
                  -----------------------------------------
                  Result: ${dbResponse}
                  `,
      },
    ],
  });

  const response = result.data.choices.shift().message.content;
  console.log("QUERY");
  console.log(query);
  console.log("");
  console.log("----------------");

  console.log("DB RESPONSE");
  console.log(dbResponse);
  console.log("");
  console.log("----------------");

  console.log("AI RESULT");
  console.log(response);

  res.send(response);
});
