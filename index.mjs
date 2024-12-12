import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits, WebhookClient } from "discord.js";

const c = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildIntegrations,
  ],
});

c.login(process.env.DISCORD_TOKEN);

// actual logic
function isValidURL(url) {
  // function pulled from https://www.geeksforgeeks.org/how-to-check-if-a-string-contains-a-valid-url-format-in-javascript/
  try {
    const urlObject = new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function AdjustMSGLink(inputMSG) {
  return new Promise((resolve) => {
    // find the link and url in the message Tokenize and search
    let tokens = inputMSG.split(" ");

    // replace the link with its approprate social media service
    for (let i = 0; i < tokens.length; i++) {
      if (isValidURL(tokens[i])) {
        switch (true) {
          case tokens[i].includes("x.com"):
            tokens[i] = tokens[i].replace("x.com", "fxtwitter.com");
            break;
          case tokens[i].includes("twitter.com") & !tokens[i].includes("xtwitter.com"):
            tokens[i] = tokens[i].replace("twitter.com", "fxtwitter.com");
            break;
          case tokens[i].includes("instagram.com"):
            tokens[i] = tokens[i].replace("instagram.com", "ddinstagram.com");
            break;
          case tokens[i].includes("tiktok.com"):
            tokens[i] = tokens[i].replace("tiktok.com", "vxtiktok.com");
            break;
          default:
            break;
        }
      }
    }

    // reconstruct the message
    const NewMSG = tokens.join(" ");

    // return
    resolve(NewMSG);
  });
}

async function HandleMSG(msg) {
  // ensure the message is from a human and has an embed
  if (msg.author.bot) return;
  if (msg.embeds.length == 0) return;

  const NewMSG = await AdjustMSGLink(msg.content);
  if (NewMSG != msg.content) {
    try {
      // Fetch or create a webhook

      let webhook = await msg.channel.createWebhook({
        name: "Fix Link Embed",
        avatar: c.user.displayAvatarURL(),
      });

      // Send the replacement message using the webhook
      await webhook.send({
        content: NewMSG,
        username: msg.author.username,
        avatarURL: msg.author.displayAvatarURL(),
      });
      console.log(webhook);
      await msg.delete();
    } catch (error) {
      console.error("Error replacing message:", error);
    }
  }
}

// Event listeners to trigger our bot logic
c.on("messageCreate", async (msg) => {
  // for messages sent with an embded
  HandleMSG(msg);
});

c.on("messageUpdate", async (oldMessage, newMessage) => {
  // for messages sent with an link that embed after send
  // discord secretly "edits" these messages so they show to listeners as an update
  HandleMSG(newMessage);
});
