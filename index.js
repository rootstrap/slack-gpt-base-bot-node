const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const { Pool } = require('pg');
const path = require('path');

const databaseMetadata = require('./databaseMetadata');

require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log('SERVER IS UP ON PORT:', PORT);
});

async function executeQuery(query) {
  return new Promise((resolve, reject) => {
    // Create a new connection pool
    const pool = new Pool({
      user: process.env.DB_USER,
      host: 'localhost',
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query', error);
        reject(err);
      }

      let result = '';

      if (results === undefined) {
        result = 'No results';
      } else if (results.rowCount > 0) {
        const { rows } = results;
        const columns = Object.keys(rows[0]);
        result = `${columns.join(', ')}\n`;
        for (const row of rows) {
          result += `${Object.values(row).join(', ')}\n`;
        }
      } else {
        result = 'No results';
      }

      resolve(result);
    });

    // Close the connection pool when finished
    pool.end();
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', '/index.html'));
});

app.post('/', async (req, res) => {
  const queryText = req.body.userQuery;
  const tables = await databaseMetadata();

  const completion = await openai.createChatCompletion({
    temperature: 0.1,
    model: process.env.OPENAI_CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant that knows a lot about SQL language and manages a database.
          You are using Postgres 12.
          The database tables are: ${tables}
          Please answer with each name between the char \` .
          Answer only with a comma separated list of tables, without any explanation. Example response: "`users`, `products`"
          If you think there is a table name that can be used but you aren't sure, please include it anyways.
        `,
      },
      {
        role: 'user',
        content: `Tell me which tables from the list of tables you would use to make this query:
        ${queryText}`
        `,
      },
    ],
  });

  const answer = completion.data.choices[0].message.content;
  console.log('answer', answer);
  // pick up from here to get the query from OpenAI

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
    temperature: 0.1,
    model: process.env.OPENAI_CHAT_MODEL,
    messages: [
      {
        role: 'system',
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
  console.log('QUERY');
  console.log(query);
  console.log('');
  console.log('----------------');

  console.log('DB RESPONSE');
  console.log(dbResponse);
  console.log('');
  console.log('----------------');

  console.log('AI RESULT');
  console.log(response);

  res.send(response);
});
