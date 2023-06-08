const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const { Pool } = require("pg");
const path = require("path");

const { databaseMetadata, executeQuery } = require("./database");

require("dotenv").config();

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
  console.log("SERVER IS UP ON PORT:", PORT);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "/index.html"));
});

app.post("/", async (req, res) => {
  const queryText = req.body.userQuery;
  const tables = await databaseMetadata();

  const completion = await openai.createChatCompletion({
    temperature: 0.1,
    model: process.env.OPENAI_CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that knows a lot about SQL language and manages a database.
          You are using Postgres 12.
          The database tables are: ${tables}
          Please answer with each name between the char \` .
          Answer only with a comma separated list of tables, without any explanation. Example response: "\`users\`, \`products\`"
          If you think there is a table name that can be used but you aren't sure, please include it anyways.
        `,
      },
      {
        role: "user",
        content: `Tell me which tables from the list of tables you would use to make this query:
          ${queryText}`,
      },
    ],
  });

  const answer = completion.data.choices[0].message.content;
  console.log("answer", answer);
  // pick up from here to get the query from OpenAI

  const query = "SELECT * FROM people ORDER BY work_hours DESC LIMIT 10;";

  const dbResponse = await executeQuery(query);
  console.log("----------------");
  console.log("DB RESPONSE");
  console.log(dbResponse);
  console.log("");
  console.log("----------------");

  const result = await openai.createChatCompletion({
    temperature: 0.1,
    model: process.env.OPENAI_CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: `You will be given a query and the result of executing the query on a database.
                You should answer with HTML showing the result of the query.
                In your response you should include a text explaining the meaning of the result 
                and then you should include a plot a chart or any other type of visualization using HTML5.
                It should contain animations.
                The preferred type of visualization should be visual (charts) but if the data is not representative using charts, 
                you should write a sentence with the response. Use clean modern design. Be creative.Pretty font.
                Your HTML response will be use in a nodejs server inside a res.send so, be sure that I could show it. 
                Do not return any explanation about how to display or use the HTML, just return the HTML. 
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

  console.log("AI RESULT");
  console.log(response);

  res.send(response);
});
