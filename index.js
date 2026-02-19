const {
  Client,
  Intents,
  MessageActionRow,
  MessageButton
} = require("discord.js");

const config = require("./config");
const fs = require("fs");
const path = require("path");

// ===== TOKEN =====
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is not defined");
  process.exit(1);
}

// ===== CLIENT =====
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
});

client.commands = new Map();

// ===== DATABASE (coins + price) =====
const dbPath = path.join(__dirname, "database", "data.json");

if (!fs.existsSync("database")) fs.mkdirSync("database");
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({
    coinPrice: 0,
    users: {}
  }, null, 2));
}

function getData() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// نخليهم جلوبال عشان نستخدمهم في أي ملف
global.getData = getData;
global.saveData = saveData;

// ===== LOAD COMMANDS =====
const commandsPath = path.join(__dirname, "commands");

fs.readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"))
  .forEach(file => {
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.name, cmd);
    console.log(`✅ Loaded command: ${cmd.name}`);
  });

// ===== PREFIX HANDLER =====
client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/);

  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    command.run(client, message, args);
  } catch (err) {
    console.error(err);
    message.reply("❌ حصل خطأ");
  }
});

// ===== BUTTONS =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "open_ticket") {
    require("./tickets/ticketCreate")(interaction, client);
  }

  if (interaction.customId === "close_ticket") {
    require("./tickets/ticketClose")(interaction);
  }

  if (interaction.customId === "buy_balance") {
    interaction.reply({
      content: "💳 شراء الرصيد سيتم تفعيله قريبًا",
      ephemeral: true
    });
  }
});

// ===== READY =====
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== LOGIN =====
client.login(BOT_TOKEN);
