require('dotenv').config();
const http = require('http');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const openaiChatModel = process.env.OPENAI_CHAT_MODEL;
const systemPrompt = fs.readFileSync('./agent.txt', 'utf8');

const { App } = require('@slack/bolt');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

function messageRole(message) {
  if (!message.bot_id) {
    return 'user';
  } else {
    return 'assistant';
  }
};


async function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('db.db', (err) => {
      if (err) {
        reject(err);
      }
    });

    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      }

      let result = '';
      if (rows === undefined) {
        result = 'No results';
      } else if (rows.length > 0) {
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

    db.close();
  });
}


async function getConversationHistory(channel, ts, slackClient) {
  const result = await slackClient.conversations.history({
    channel,
    latest: ts,
    inclusive: true,
  });

  return result.messages.reverse();
}

async function getOpenAiResponse(conversationHistory) {
  const messages = getOpenAiPayload(conversationHistory);

  const result = await openai.createChatCompletion({
    model: openaiChatModel,
    messages: messages,
    temperature: 0.1,
  });

  return result.data.choices.shift().message.content;
}

function getOpenAiPayload(conversationHistory) {
  return [
    {
      role: 'system', content: systemPrompt,
    },
    ...conversationHistory.map((message) => ({ role: messageRole(message), content: message.text })).slice(-1),
  ];
}

app.message(async ({ message, say, ack, client }) => {
  if (!message.type === 'message' || message.subtype) {
    return;
  }

  const conversationHistory = await getConversationHistory(message.channel, message.ts, client);

  let query = (await getOpenAiResponse(conversationHistory)).split("```").join('').split("sql\n").join('');
  console.log(query);
  let result = await executeQuery(query);
  console.log(result)
  await say(`Query\n\`\`\`${query}\`\`\`\nOutput\n\`\`\`${result}\`\`\``);
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Slack bot server is running!');
})();
