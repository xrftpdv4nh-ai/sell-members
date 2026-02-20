const { Client, Intents } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config");

/* ========== CLIENT ========== */
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
});

/* ========== COMMANDS MAP (مهم جداً) ========== */
client.commands = new Map();

/* ========== DATABASE ========== */
const dbDir = path.join(__dirname, "database");
const dbPath = path.join(dbDir, "data.json");

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ coinPrice: 0, users: {} }, null, 2));
}

function getData() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}
function saveData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

global.getData = getData;
global.saveData = saveData;

/* ========== LOAD COMMANDS ========== */
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
  fs.readdirSync(commandsPath)
    .filter(f => f.endsWith(".js"))
    .forEach(file => {
      const cmd = require(`./commands/${file}`);
      if (cmd.name && typeof cmd.run === "function") {
        client.commands.set(cmd.name, cmd);
        console.log(`✅ Loaded command: ${cmd.name}`);
      }
    });
}

/* ========== READY ========== */
client.once("ready", () => {
  console.log(`✅ Bot Online: ${client.user.tag}`);
});

/* ========== MESSAGE COMMANDS ========== */
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  /* ADMIN price */
  if (message.content.startsWith("price")) {
    if (message.author.id !== config.adminId)
      return message.reply("❌ الأمر ده للأدمن فقط");

    const price = parseInt(message.content.split(" ")[1]);
    if (!price) return message.reply("❌ استخدم: price 100");

    const data = getData();
    data.coinPrice = price;
    saveData(data);

    return message.reply(`✅ 1 Coin = **${price} Credit**`);
  }

  /* PREFIX COMMANDS */
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const name = args.shift().toLowerCase();
  const command = client.commands.get(name);
  if (!command) return;

  try {
    command.run(client, message, args);
  } catch (e) {
    console.error(e);
    message.reply("❌ حصل خطأ");
  }
});

/* ========== INTERACTIONS ========== */
require("./handlers/interactionHandler")(client);

/* ========== PROBOT MONITOR ========== */
require("./handlers/probotMonitor")(client);

/* ========== LOGIN ========== */
client.login(process.env.BOT_TOKEN);
