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

/* ================= TOKEN ================= */
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is not defined");
  process.exit(1);
}

/* ================= CLIENT ================= */
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
});

/* ================= DATABASE ================= */
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

/* ================= READY ================= */
client.once("ready", () => {
  console.log(`✅ Bot Online: ${client.user.tag}`);
});

/* ================= MESSAGE COMMANDS ================= */
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  /* ===== ADMIN: price ===== */
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

  /* ===== +coins ===== */
  if (message.content === `${config.prefix}coins`) {
    const data = getData();
    const coins = data.users[message.author.id]?.coins || 0;

    return message.reply(
      `🪙 **رصيدك الحالي:** ${coins} كوين`
    );
  }

  /* ===== حذف روم بدون بريفكس (أدمن) ===== */
  if (message.content === "حذف") {
    if (!message.member.permissions.has("ADMINISTRATOR"))
      return message.reply("❌ الأمر للأدمن فقط");

    if (!message.channel.name.startsWith("ticket-"))
      return message.reply("❌ الأمر ده يشتغل داخل تكت فقط");

    await message.reply("🗑️ سيتم حذف التكت بعد 3 ثواني...");
    setTimeout(() => {
      message.channel.delete().catch(() => {});
    }, 3000);
  }
});

/* ================= INTERACTIONS ================= */
client.on("interactionCreate", async interaction => {

  /* ===== BUTTONS ===== */
  if (interaction.isButton()) {

    /* شراء رصيد */
    if (interaction.customId === "buy_balance") {
      const modal = new Modal()
        .setCustomId("buy_balance_modal")
        .setTitle("شراء رصيد");

      const amountInput = new TextInputComponent()
        .setCustomId("amount")
        .setLabel("عدد الكوينز")
        .setStyle("SHORT")
        .setPlaceholder("مثال: 10")
        .setRequired(true);

      modal.addComponents(
        new MessageActionRow().addComponents(amountInput)
      );

      return interaction.showModal(modal);
    }

    /* غلق تكت */
    if (interaction.customId === "close_ticket") {
      await interaction.reply("🗑️ سيتم غلق التذكرة...");
      return setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 3000);
    }
  }

  /* ===== MODAL SUBMIT ===== */
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
          content: "❌ سعر الكوين غير محدد",
          ephemeral: true
        });

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
\`\`\`

⏱️ لديك **5 دقائق** لإتمام التحويل`
        }]
      });
    }
  }
});

/* ================= PROBOT MONITOR ================= */
client.on("messageCreate", async message => {
  try {
    if (message.author.id !== config.probot.id) return;
    if (!message.content.includes("has transferred")) return;
    if (!message.content.includes(config.probot.creditAccountId)) return;

    const creditMatch = message.content.match(/`(\d+)`/);
    if (!creditMatch) return;

    const credits = parseInt(creditMatch[1]);

    const userMatch = message.content.match(/\| (.*?), has transferred/);
    if (!userMatch) return;

    const username = userMatch[1];
    const member = message.guild.members.cache.find(
      m => m.user.username === username
    );
    if (!member) return;

    const data = getData();
    const coins = Math.floor(credits / data.coinPrice);
    if (coins <= 0) return;

    if (!data.users[member.id]) {
      data.users[member.id] = { coins: 0 };
    }

    data.users[member.id].coins += coins;
    saveData(data);

    message.channel.send(
`✅ **تم استلام التحويل**

👤 ${member}
💰 ${credits} كريدت
🪙 ${coins} كوين

📦 رصيدك الحالي:
**${data.users[member.id].coins} كوين**`
    );

  } catch (err) {
    console.error("❌ ProBot Monitor Error:", err);
  }
});

/* ================= LOGIN ================= */
client.login(BOT_TOKEN);
