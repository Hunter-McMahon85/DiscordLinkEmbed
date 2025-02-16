import dotenv from "dotenv";
dotenv.config();

import pkg from "discord.js";
const { Client, GatewayIntentBits, EmbedBuilder } = pkg;

const c = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

c.login(process.env.DISCORD_TOKEN)

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

      for (let j = 0; j < subtokens.length; j++) {
        if (!(subtokens[j] in links)) continue;
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
      // create webhook

      let webhook = await msg.channel.createWebhook({
        name: `${msg.author.id} Forwarded by Link Embed Fixer `,
        avatar: c.user.displayAvatarURL(),
      });

      // Send the replacement message using the webhook
      const reply = await webhook.send({
        content: "user: " + msg.author.id + "\nSends: " + NewMSG,
        username: msg.author.username,
        avatarURL: msg.author.displayAvatarURL(),
      });

      await reply.react("❌");
      await msg.delete();
      await webhook.delete();
    } catch (error) {
      console.error("Error replacing message:", error);
    }
  }
}

// Event listeners to trigger our bot logic
c.on("messageCreate", async (msg) => {
  // for messages sent
  HandleMSG(msg);
});

c.on("messageUpdate", async (oldMessage, newMessage) => {
  // for messages sent with an link that embeds after send
  // discord secretly "edits" these messages so the client sees these as "edited"/"updated messages"
  HandleMSG(newMessage);
});

c.on("messageReactionAdd", async (reaction, user) => {
  // this will be how users can delete their own messages forwarded by the bot
  try {
    if (user.bot) return;
    // Fetch the full reaction message if it's partial (for cached message support)
    if (reaction.message.partial) await reaction.message.fetch();

    if (reaction.message.content.includes(user.id)) {
      reaction.message.delete();
    }
  } catch (error) {
    console.error("Error handling reaction:", error);
  }
});
