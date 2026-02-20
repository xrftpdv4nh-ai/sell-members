const { Client, Intents } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config");

// ================= TOKEN =================
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is not defined");
  process.exit(1);
}

// ================= CLIENT =================
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS
  ],
});

// ================= DATABASE =================
const dbDir = path.join(__dirname, "database");
const dbPath = path.join(dbDir, "data.json");

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(
    dbPath,
    JSON.stringify({ coinPrice: 0, users: {} }, null, 2)
  );
}

function getData() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}
function saveData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// ================= READY =================
client.once("ready", () => {
  console.log(`✅ Bot Online: ${client.user.tag}`);
});

// ================= HANDLERS =================
const commandHandler = require("./handlers/commandHandler");
const interactionHandler = require("./handlers/interactionHandler");
const deleteTicket = require("./handlers/deleteTicket");
const probotMonitor = require("./handlers/probotMonitor");

// ================= MESSAGE CREATE =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // أوامر البريفكس
  commandHandler(client, message, getData, saveData);

  // حذف التكت
  deleteTicket(message);

  // مراقبة بروبوت
  probotMonitor(message, config, getData, saveData);
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {
  interactionHandler(interaction, client, getData, saveData);
});

// ================= LOGIN =================
client.login(BOT_TOKEN);
