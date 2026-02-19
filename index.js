const {
  Client,
  Intents,
  MessageActionRow,
  MessageButton,
  Modal,
  TextInputComponent
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

// ===== DATABASE =====
const dbPath = path.join(__dirname, "database", "data.json");

if (!fs.existsSync("database")) fs.mkdirSync("database");
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(
    dbPath,
    JSON.stringify({ coinPrice: 0, users: {} }, null, 2)
  );
}

function getData() {
  return JSON.parse(fs.readFileSync(dbPath));
}
function saveData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

global.getData = getData;
global.saveData = saveData;

// ===== LOAD COMMANDS =====
const commandsPath = path.join(__dirname, "commands");
fs.readdirSync(commandsPath)
  .filter(f => f.endsWith(".js"))
  .forEach(file => {
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.name, cmd);
    console.log(`✅ Loaded command: ${cmd.name}`);
  });

// ===== PREFIX COMMANDS =====
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  // ===== أمر price (أدمن فقط) =====
  if (message.content.startsWith("price")) {
    if (message.author.id !== config.adminId)
      return message.reply("❌ الأمر ده للأدمن فقط");

    const args = message.content.split(" ");
    const price = parseInt(args[1]);
    if (!price || price <= 0)
      return message.reply("❌ استخدم: price 100");

    const data = getData();
    data.coinPrice = price;
    saveData(data);

    return message.reply(`✅ تم تحديد سعر الكوين = **${price}**`);
  }

  // ===== أوامر بريفكس =====
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
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

// ===== INTERACTIONS =====
client.on("interactionCreate", async interaction => {

  // ===== BUTTON =====
  if (interaction.isButton()) {

    if (interaction.customId === "open_ticket") {
      return require("./tickets/ticketCreate")(interaction, client);
    }

    if (interaction.customId === "close_ticket") {
      return require("./tickets/ticketClose")(interaction);
    }

    // ===== شراء رصيد =====
    if (interaction.customId === "buy_balance") {
      const modal = new Modal()
        .setCustomId("buy_balance_modal")
        .setTitle("شراء رصيد");

      const amountInput = new TextInputComponent()
        .setCustomId("amount")
        .setLabel("الكمية")
        .setStyle("SHORT")
        .setPlaceholder("مثال: 100")
        .setRequired(true);

      modal.addComponents(
        new MessageActionRow().addComponents(amountInput)
      );

      return interaction.showModal(modal);
    }
  }

  // ===== MODAL =====
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "buy_balance_modal") {
      const amount = parseInt(
        interaction.fields.getTextInputValue("amount")
      );

      if (!amount || amount <= 0)
        return interaction.reply({
          content: "❌ الكمية غير صحيحة",
          ephemeral: true
        });

      const data = getData();
      if (!data.coinPrice || data.coinPrice <= 0)
        return interaction.reply({
          content: "❌ سعر الكوين لم يتم تحديده بعد",
          ephemeral: true
        });

      const total = amount * data.coinPrice;

      return interaction.reply({
        embeds: [{
          color: 0xfacc15,
          description:
`💳 **إكمال عملية شراء الرصيد**

🔢 الكمية: **${amount} كوين**
💰 السعر الإجمالي: **${total} كريدت**

📩 الرجاء التحويل:
\`\`\`
#credit ${config.creditAccountId} ${total}
\`\`\`

⏱️ لديك **5 دقائق** لإتمام التحويل  
📌 التحويل يتم داخل نفس التكت`
        }]
      });
    }
  }
});

// ===== READY =====
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== LOGIN =====
client.login(BOT_TOKEN);
