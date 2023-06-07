const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);
const openaiChatModel = process.env.OPENAI_CHAT_MODEL;
const systemPrompt = fs.readFileSync("./forecast.txt", "utf8");

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
  const result = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: "I want to know the top 10 people that had more work hours.",
      },
      //   {
      //     role: "assistant",
      //     content:
      //       "Sure! Here are the table definitions for the database:\n\n```\nCREATE TABLE Artist (\n    artist_id SERIAL PRIMARY KEY,\n    name VARCHAR(255) UNIQUE\n);\n\nCREATE TABLE Album (\n    album_id SERIAL PRIMARY KEY,\n    title VARCHAR(255),\n    artist_id INTEGER REFERENCES Artist (artist_id)\n);\n\nCREATE TABLE Genre (\n    genre_id SERIAL PRIMARY KEY,\n    name VARCHAR(255)\n);\n\nCREATE TABLE MediaType (\n    media_type_id SERIAL PRIMARY KEY,\n    name VARCHAR(255)\n);\n\nCREATE TABLE Track (\n    track_id SERIAL PRIMARY KEY,\n    name VARCHAR(255),\n    album_id INTEGER REFERENCES Album (album_id),\n    genre_id INTEGER REFERENCES Genre (genre_id),\n    media_type_id INTEGER REFERENCES MediaType (media_type_id),\n    unit_price DECIMAL(10, 2)\n);\n\nCREATE TABLE Playlist (\n    playlist_id SERIAL PRIMARY KEY,\n    name VARCHAR(255)\n);\n\nCREATE TABLE PlaylistTrack (\n    playlist_id INTEGER REFERENCES Playlist (playlist_id),\n    track_id INTEGER REFERENCES Track (track_id),\n    PRIMARY KEY (playlist_id, track_id)\n);\n\nCREATE TABLE Employee (\n    employee_id SERIAL PRIMARY KEY,\n    first_name VARCHAR(255),\n    last_name VARCHAR(255),\n    address VARCHAR(255),\n    email VARCHAR(255),\n    city VARCHAR(255),\n    state VARCHAR(255),\n    phone VARCHAR(255),\n    reports_to INTEGER REFERENCES Employee (employee_id)\n);\n\nCREATE TABLE Customer (\n    customer_id SERIAL PRIMARY KEY,\n    first_name VARCHAR(255),\n    last_name VARCHAR(255),\n    phone VARCHAR(255),\n    email VARCHAR(255)\n);\n\nCREATE TABLE Invoice (\n    invoice_id SERIAL PRIMARY KEY,\n    billing_address VARCHAR(255),\n    total DECIMAL(10, 2),\n    customer_id INTEGER REFERENCES Customer (customer_id)\n);\n\nCREATE TABLE InvoiceLine (\n    invoice_line_id SERIAL PRIMARY KEY,\n    unit_price DECIMAL(10, 2),\n    quantity INTEGER,\n    track_id INTEGER REFERENCES Track (track_id),\n    invoice_id INTEGER REFERENCES Invoice (invoice_id)\n);\n```\n\nLet me know if you need further explanations!",
      //   },
      //   {
      //     role: "user",
      //     content:
      //       "I want to know the first name and lastname of the client who bought the most tracks, also how much he spent. Please write the Postgres SQL query",
      //   },
    ],
  });

  const response = result.data.choices.shift().message.content;
  console.log(response);
  res.send(response);
});
