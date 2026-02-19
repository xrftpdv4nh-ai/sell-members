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
app.listen(3000, () => {
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
client.once("ready", async () => {
  console.log(`🤖 Bot Online: ${client.user.tag}`);

  try {
    await client.application.commands.set([
      {
        name: "stock",
        description: "عرض عدد المستخدمين"
      },
      {
        name: "panel",
        description: "عرض لوحة تجريبية"
      }
    ]);

    console.log("✅ Slash commands registered");
  } catch (err) {
    console.error("❌ Slash register error:", err);
  }
});

/* ================== PREFIX COMMANDS ================== */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    return message.reply("🏓 Pong!");
  }

  if (command === "users") {
    const count = Object.keys(getUsers()).length;
    return message.reply(`📦 عدد المستخدمين: ${count}`);
  }

  if (command === "help") {
    return message.reply(
      `**الأوامر:**\n` +
      `+ping\n` +
      `+users\n` +
      `/stock\n` +
      `/panel`
    );
  }
});

/* ================== SLASH COMMANDS ================== */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "stock") {
    const count = Object.keys(getUsers()).length;
    return interaction.reply({
      content: `📦 **الستوك الحالي:** ${count}`,
      ephemeral: true
    });
  }

  if (interaction.commandName === "panel") {
    const embed = new MessageEmbed()
      .setTitle("لوحة تجريبية 🧪")
      .setDescription("السلاش شغال تمام ✅")
      .setColor("#0099ff");

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("test_button")
        .setLabel("زر تجريبي")
        .setStyle("SECONDARY")
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
});

/* ================== BUTTON ================== */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "test_button") {
    return interaction.reply({
      content: "✅ الزر شغال",
      ephemeral: true
    });
  }
});

/* ================== ERRORS ================== */
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

/* ================== LOGIN ================== */
client.login(process.env.BOT_TOKEN);
