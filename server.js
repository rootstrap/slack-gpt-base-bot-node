require('dotenv').config();

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const openaiChatModel = process.env.OPENAI_CHAT_MODEL;

const { App } = require('@slack/bolt');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

const functions = require('./functions');

var history = [];

async function getOpenAiResponse() {
  const payload = {
    model: openaiChatModel,
    messages: [
      {
        role: 'system', content: 'You are a chat assistant that helps people with their to-do list.',
      },
      ...history,
    ],
    functions: functions.map((func) => func.schema),
  };

  const result = await openai.createChatCompletion(payload);
  return result.data.choices.shift().message;
}

function callFunction(function_call) {
  const func = functions.find((func) => func.schema.name === function_call.name);
  const args = JSON.parse(function_call.arguments);
  return func.function(args);
}

app.message(async ({ message, say, ack, client }) => {
  if (!message.type === 'message' || message.subtype) {
    return;
  }

  history.push({ role: "user", content: message.text });

  let responseText = "";
  const response = await getOpenAiResponse();
  if (response.function_call) {
    responseText = callFunction(response.function_call);
    history.push({ role: "function", name: response.function_call.name, content: responseText });
  } else {
    responseText = response.content;
    history.push({ role: "assistant", content: responseText });
  }

  await say(responseText);
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Slack bot server is running!');
})();
