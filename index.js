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

// ===== DATABASE =====
const dbPath = path.join(__dirname, "database", "data.json");
if (!fs.existsSync("database")) fs.mkdirSync("database");
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ coinPrice: 0, users: {} }, null, 2));
}

function getData() {
  return JSON.parse(fs.readFileSync(dbPath));
}
function saveData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// ===== READY =====
client.once("ready", () => {
  console.log(`✅ Bot Online: ${client.user.tag}`);
});

// ===== MESSAGE HANDLER (واحد فقط) =====
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const data = getData();

  /* ===== ADMIN price ===== */
  if (message.content.startsWith("price")) {
    if (message.author.id !== config.adminId)
      return message.reply("❌ الأمر ده للأدمن فقط");

    const price = parseInt(message.content.split(" ")[1]);
    if (!price || price <= 0)
      return message.reply("❌ استخدم: price 100");

    data.coinPrice = price;
    saveData(data);
    return message.reply(`✅ سعر الكوين = **${price} كريدت**`);
  }

  /* ===== +coins ===== */
  if (message.content === `${config.prefix}coins`) {
    const coins = data.users[message.author.id]?.coins || 0;
    return message.reply(`🪙 **رصيدك الحالي:** ${coins} كوين`);
  }

  /// ===== PROBOT MONITOR (SAFE) =====
client.on("messageCreate", async message => {
  try {
    // تأكد إنه بروبوت
    if (message.author.id !== config.probot.id) return;

    // لازم Embed
    if (!message.embeds || message.embeds.length === 0) return;

    const embed = message.embeds[0];
    if (!embed.description) return;

    // لازم يكون تحويل كريدت
    if (!embed.description.includes("has transferred")) return;
    if (!embed.description.includes(config.probot.creditAccountId)) return;

    // استخراج ID المستخدم
    const userIdMatch = embed.description.match(/<@!?(\d+)>/);
    if (!userIdMatch) return;

    const userId = userIdMatch[1];

    // استخراج عدد الكريدت
    const creditMatch = embed.description.match(/(\d+)\s*credits?/i);
    if (!creditMatch) return;

    const credits = parseInt(creditMatch[1]);
    if (credits <= 0) return;

    const data = getData();
    if (!data.coinPrice || data.coinPrice <= 0) return;

    const coins = Math.floor(credits / data.coinPrice);
    if (coins <= 0) return;

    if (!data.users[userId]) {
      data.users[userId] = { coins: 0 };
    }

    data.users[userId].coins += coins;
    saveData(data);

    message.channel.send(
`✅ **تم استلام التحويل بنجاح**

👤 <@${userId}>
💰 ${credits} كريدت
🪙 ${coins} كوين

📦 رصيدك الحالي:
**${data.users[userId].coins} كوين**`
    );

  } catch (err) {
    console.error("❌ ProBot Monitor Error:", err);
  }
});

// ===== INTERACTIONS =====
client.on("interactionCreate", async interaction => {

  /* ===== BUTTONS ===== */
  if (interaction.isButton()) {

    if (interaction.customId === "buy_balance") {
      const modal = new Modal()
        .setCustomId("buy_balance_modal")
        .setTitle("شراء رصيد");

      const input = new TextInputComponent()
        .setCustomId("amount")
        .setLabel("عدد الكوينز")
        .setStyle("SHORT")
        .setRequired(true);

      modal.addComponents(new MessageActionRow().addComponents(input));
      return interaction.showModal(modal);
    }

    if (interaction.customId === "close_ticket") {
      await interaction.reply("🗑️ سيتم غلق التذكرة...");
      return setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 3000);
    }
  }

  /* ===== MODAL ===== */
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "buy_balance_modal") {
      const amount = parseInt(interaction.fields.getTextInputValue("amount"));
      if (!amount || amount <= 0)
        return interaction.reply({ content: "❌ كمية غير صحيحة", ephemeral: true });

      const data = getData();
      if (!data.coinPrice)
        return interaction.reply({ content: "❌ سعر الكوين غير محدد", ephemeral: true });

      const total = amount * data.coinPrice;

      return interaction.reply({
        embeds: [{
          color: 0xfacc15,
          description:
`💳 **إكمال شراء الرصيد**
🪙 ${amount} كوين
💰 ${total} كريدت

\`\`\`
#credit ${config.creditAccountId} ${total}
\`\`\`

⏱️ لديك 5 دقائق للتحويل`
        }]
      });
    }
  }
});

// ===== LOGIN =====
client.login(BOT_TOKEN);
