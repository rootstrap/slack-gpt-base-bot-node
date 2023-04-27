# Slack Bot with OpenAI Integration

This project is a Slack bot that uses OpenAI's chat API to generate responses to user messages. The bot uses the `@slack/bolt` package for interacting with the Slack API and the `openai` package for communicating with OpenAI's API.

## Installation

1. Clone the repository and navigate to the project directory.
   ```sh
   git clone https://github.com/your-username/your-project.git
   cd your-project
   ```
2. Install the dependencies using npm.
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory of the project and add your Slack app and OpenAI API keys. The following environment variables are required:
   ```
   SLACK_SIGNING_SECRET=your_slack_signing_secret
   SLACK_BOT_TOKEN=your_slack_bot_token
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_CHAT_MODEL=your_openai_chat_model
   ```
4. Create a `agent.txt` file in the root directory of the project and add the prompt for the OpenAI chat model. This prompt will be sent as the first message to the chat API for each conversation.
   ```
   The prompt for your OpenAI chat model.
   ```

## Usage

To start the Slack bot server, run the following command:
```sh
npm start
```

Once the server is running, you can add the bot to your Slack workspace and start chatting with it. The bot will respond to any messages sent to it in the channel it was added to.

## How it Works

The bot listens for messages sent to it in a Slack channel and retrieves the conversation history for the channel using the Slack API. It then sends the conversation history along with the system prompt to the OpenAI chat API to generate a response. The response is sent back to the Slack channel as a message from the bot.

The conversation history sent to the OpenAI chat API includes both user messages and bot messages, so the model can take into account the context of the conversation when generating a response.
