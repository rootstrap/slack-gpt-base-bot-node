require('dotenv').config();
const http = require('http');
const fs = require('fs');
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
  });

  return result.data.choices.shift().message.content;
}

function getOpenAiPayload(conversationHistory) {
  return [
    {
      role: 'system', content: systemPrompt,
    },
    ...conversationHistory.map((message) => ({ role: messageRole(message), content: message.text })),
  ];
}

app.message(async ({ message, say, ack, client }) => {
  if (!message.type === 'message' || message.subtype) {
    return;
  }

  const conversationHistory = await getConversationHistory(message.channel, message.ts, client);

  responseText = await getOpenAiResponse(conversationHistory);
  await say(responseText);
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Slack bot server is running!');
})();
