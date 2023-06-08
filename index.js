require("dotenv").config();
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const { Client } = require("pg");

const postgresClient = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

postgresClient.connect();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const systemPrompt = fs.readFileSync("./forecast.txt", "utf8");
const openaiConfig = {
  model: process.env.OPENAI_CHAT_MODEL,
  temperature: 0.1,
};

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

app.get("/", async (req, res) => {
  try {
    const getQuery = await openai.createChatCompletion({
      ...openaiConfig,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "I want to know the top 10 people that had more work hours.",
        },
      ],
    });

    const query = getQuery.data.choices.shift().message.content;

    const { rows } = await postgresClient.query(query);

    const getParsedData = await openai.createChatCompletion({
      ...openaiConfig,
      messages: [
        {
          role: "user",
          content: `You will receive a query and the result of executing the query on a database. You should answer with the result of the query. The output should be a representative bar chart using ascii characters and colors and should use all the fields of Data. The chart should be easy to read. Query: ${query}. Data: ${JSON.stringify(
            rows
          )}`,
        },
      ],
    });
    const parsedData = getParsedData.data.choices.shift().message.content;
    console.log("parsedData: ", parsedData);
    res.send(query);
  } catch (err) {
    console.log(`error: ${err.message}`);
    res.send(JSON.stringify(err));
  }
});
