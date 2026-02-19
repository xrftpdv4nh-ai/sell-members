const { Client, Intents, MessageActionRow, MessageButton } = require("discord.js");
const config = require("./config");
const fs = require("fs");

// ✅ التوكن من Environment Variable
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is not defined");
  process.exit(1);
}

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
});

client.commands = new Map();

// تحميل الأوامر
fs.readdirSync("./commands").forEach(file => {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.name, cmd);
});

// ================= PREFIX =================
client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const cmd = client.commands.get(command);
  if (cmd) cmd.run(client, message, args);
});

// ================= BUTTONS =================
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "open_ticket") {
    require("./tickets/ticketCreate")(interaction, client);
  }

  if (interaction.customId === "close_ticket") {
    require("./tickets/ticketClose")(interaction);
  }
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// 🔐 تسجيل الدخول
client.login(BOT_TOKEN);
