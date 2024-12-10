import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits } from "discord.js";

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

function AdjustLink(inputMSG) {
    
}

c.on("messageCreate", async (msg) => {
  // You can view the msg object here with console.log(msg)
  console.log(msg);
  /*
    if (msg.embeds != [] ) {
        AdjustLink(imputMSG);
    }*/
  if (msg.content === "YES") {
    msg.reply(`LOOK AT ME I LOVE MANULS ${msg.author.username}`);
  }
});
