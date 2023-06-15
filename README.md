# Slack Bot with OpenAI Integration

This project is a base Node.js server, and is a Slack bot that uses OpenAI's chat API to generate responses to user messages. The bot uses the `@slack/bolt` package for interacting with the Slack API and the `openai` package for communicating with OpenAI's API.


## How it Works

The bot listens for messages sent to it in a Slack channel and retrieves the conversation history for the channel using the Slack API. It then sends the conversation history along with the system prompt to the OpenAI chat API to generate a response. The response is sent back to the Slack channel as a message from the bot.

The conversation history sent to the OpenAI chat API includes both user messages and bot messages, so the model can take into account the context of the conversation when generating a response.

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

## Usage

To start the Slack bot server, run the following command:
```sh
npm start
```

Once the server is running, you can add the bot to your Slack workspace and start chatting with it. The bot will respond to any messages sent to it in the channel it was added to.

## Configuration

To set up the Slack bot on your Slack developer account, follow these steps:

1. Navigate to the [Slack API website](https://api.slack.com/) and sign in with your Slack account.

2. Click on the "Your Apps" button in the top-right corner of the page and then click on the "Create New App" button.

3. Give your app a name and select the workspace where you want to install the bot.

4. In the "Add features and functionality" section, click on the "Bots" feature and then click on the "Add a Bot User" button. Follow the prompts to give your bot a display name and default username.

5. In the "OAuth & Permissions" section, add the following bot token scopes:
   - `chat:write`
   - `conversations:history`

6. Click on the "Install App" button and follow the prompts to authorize the app in your workspace.

7. Once the app is installed, copy the "Bot User OAuth Access Token" from the "OAuth & Permissions" section and add it to your `.env` file as the `SLACK_BOT_TOKEN`.

To point the Slack bot to your local server, you can use a tool like [ngrok](https://ngrok.com/) to expose your server to the internet. Follow these steps:

1. Install ngrok by downloading the appropriate binary for your operating system from the [ngrok website](https://ngrok.com/download).

2. Start your Node.js server on your local machine by running the following command in your project directory:
   ```sh
   npm start
   ```

3. Start ngrok by running the following command in a separate terminal window:
   ```sh
   ngrok http 3000
   ```

4. Copy the HTTPS forwarding URL from the ngrok console (e.g., `https://abcd1234.ngrok.io`) and add it to the "Event Subscriptions" section of your Slack app configuration. The URL should be in the following format:
   ```
   https://<ngrok-subdomain>.ngrok.io/slack/events
   ```

5. Enable the "Enable Events" toggle and add the following event subscription:
   ```
   message.channels
   ```

6. Save your changes and your Slack bot should now be connected to your local Node.js server.
