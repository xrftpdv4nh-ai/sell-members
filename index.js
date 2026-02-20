const {
  Client,
  Intents,
  MessageActionRow,
  MessageButton,
  Modal,
  TextInputComponent
} = require("discord.js");

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

// ================= LOAD COMMANDS =================
client.commands = new Map();
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

// ================= READY =================
client.once("ready", () => {
  console.log(`✅ Bot Online: ${client.user.tag}`);
});

// ================= MESSAGE CREATE =================
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  // ----- ADMIN price -----
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

    return message.reply(
      `✅ تم تحديد السعر\n💰 **1 Coin = ${price} Credit**`
    );
  }

  // ----- prefix commands -----
  if (message.content.startsWith(config.prefix)) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (command) {
      try {
        command.run(client, message, args);
      } catch (err) {
        console.error(err);
        message.reply("❌ حصل خطأ");
      }
    }
  }

  // ----- delete ticket -----
  require("./handlers/deleteTicket")(message);

  // ----- ProBot monitor -----
  require("./handlers/probotMonitor")(message, config, getData, saveData);
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async interaction => {

  if (interaction.isButton()) {

    if (interaction.customId === "open_ticket") {
      return require("./tickets/ticketCreate")(interaction, client);
    }

    if (interaction.customId === "close_ticket") {
      await interaction.reply("🗑️ سيتم غلق التذكرة...");
      return setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 3000);
    }

    if (interaction.customId === "buy_balance") {
      const modal = new Modal()
        .setCustomId("buy_balance_modal")
        .setTitle("شراء رصيد");

      const amountInput = new TextInputComponent()
        .setCustomId("amount")
        .setLabel("عدد الكوينز")
        .setStyle("SHORT")
        .setRequired(true);

      modal.addComponents(
        new MessageActionRow().addComponents(amountInput)
      );

      return interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "buy_balance_modal") {
      const amount = parseInt(
        interaction.fields.getTextInputValue("amount")
      );

      if (!amount || amount <= 0)
        return interaction.reply({ content: "❌ الكمية غير صحيحة", ephemeral: true });

      const data = getData();
      if (!data.coinPrice || data.coinPrice <= 0)
        return interaction.reply({ content: "❌ سعر الكوين غير محدد", ephemeral: true });

      const total = amount * data.coinPrice;

      return interaction.reply({
        embeds: [{
          color: 0xfacc15,
          description:
`💳 **إكمال شراء الرصيد**

🪙 الكمية: **${amount} كوين**
💰 الإجمالي: **${total} كريدت**

📩 الرجاء التحويل:
\`\`\`
#credit ${config.probot.creditAccountId} ${total}
\`\`\``
        }]
      });
    }
  }
});

// ================= LOGIN =================
client.login(BOT_TOKEN);
