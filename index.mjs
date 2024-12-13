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

const links = {
  "x.com": "fxtwitter.com",
  "twitter.com": "fxtwitter.com",
  "www.instagram.com": "ddinstagram.com",
  "www.tiktok.com": "www.vxtiktok.com",
  "www.reddit.com": "www.rxddit.com",
};

function AdjustMSGLink(inputMSG) {
  return new Promise((resolve) => {
    // find the link and url in the message Tokenize and search
    let tokens = inputMSG.split(" ");

    // replace the link with its approprate social media service
    for (let i = 0; i < tokens.length; i++) {
      if (!isValidURL(tokens[i])) continue;
      let subtokens = tokens[i].split("/");
      console.log(subtokens)

      for (let j = 0; j < subtokens.length; j++) {
        if (!(subtokens[j] in links)) continue;
        console.log(subtokens[j])
        tokens[i] = tokens[i].replace(subtokens[j], links[subtokens[j]]);
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

      await msg.delete();
      await webhook.delete();
    } catch (error) {
      console.error("Error replacing message:", error);
    }
  }
}

// Event listeners to trigger our bot logic
c.on("messageCreate", async (msg) => {
  // for messages sent with an embded
  HandleMSG(msg);
  console.log("msg")
});

c.on("messageUpdate", async (oldMessage, newMessage) => {
  // for messages sent with an link that embed after send
  // discord secretly "edits" these messages so they show to listeners as an update
  HandleMSG(newMessage);
  console.log("msg")
});
