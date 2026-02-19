const {
  Client,
  Intents,
  MessageEmbed,
  MessageButton,
  MessageActionRow
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const express = require("express");

/* ================== CONFIG ================== */
const PREFIX = "+";
const BOT_TOKEN = process.env.BOT_TOKEN; 
// 👆 التوكن يتحط في Railway Variables باسم BOT_TOKEN

/* ================== CLIENT ================== */
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
});

/* ================== EXPRESS (UPTIME) ================== */
const app = express();
app.get("/", (req, res) => {
  res.send("Bot Online 24/7 ✅");
});
app.listen(process.env.PORT || 3000, () => {
  console.log("🌍 Website Online");
});

/* ================== FILE DATABASE ================== */
const dbPath = path.join(__dirname, "database", "users.json");

if (!fs.existsSync("database")) fs.mkdirSync("database");
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

function getUsers() {
  return JSON.parse(fs.readFileSync(dbPath));
}

/* ================== READY ================== */
client.once("ready", () => {
  console.log(`🤖 Bot Online: ${client.user.tag}`);
});

/* ================== PREFIX COMMANDS ================== */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  /* +ping */
  if (command === "ping") {
    return message.reply("🏓 Pong!");
  }

  /* +users / +stock */
  if (command === "users" || command === "stock") {
    const count = Object.keys(getUsers()).length;
    return message.reply(`📦 عدد المستخدمين الحالي: ${count}`);
  }

  /* +panel */
  if (command === "panel") {
    const embed = new MessageEmbed()
      .setTitle("لوحة التحكم 🧩")
      .setDescription("دي لوحة تجريبية بنظام Prefix فقط")
      .setColor("#0099ff");

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("test_button")
        .setLabel("زر تجريبي")
        .setStyle("SECONDARY")
    );

    return message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }

  /* +help */
  if (command === "help") {
    return message.reply(
      `**الأوامر المتاحة:**\n` +
      `+ping\n` +
      `+users\n` +
      `+stock\n` +
      `+panel`
    );
  }
});

/* ================== BUTTON ================== */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "test_button") {
    return interaction.reply({
      content: "✅ الزر شغال تمام",
      ephemeral: true
    });
  }
});

/* ================== ERRORS ================== */
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

/* ================== LOGIN ================== */
client.login(BOT_TOKEN);
