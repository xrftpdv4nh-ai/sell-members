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

const config = require("./config");

/* ================= DATABASE ================= */
const dbPath = path.join(__dirname, "database", "users.json");
if (!fs.existsSync("database")) fs.mkdirSync("database");
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, "{}");

const getUsers = () => JSON.parse(fs.readFileSync(dbPath));
const setUser = (id, data) => {
  const users = getUsers();
  users[id] = data;
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
};

/* ================= CLIENT ================= */
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/* ================= EXPRESS ================= */
const app = express();
app.get("/", (req, res) => res.send("Bot Online ✅"));
app.listen(process.env.PORT || 3000);

/* ================= READY ================= */
client.once("ready", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  await client.application.commands.set([
    {
      name: "stock",
      description: "عرض عدد الأعضاء المتاحين"
    },
    {
      name: "panel",
      description: "فتح لوحة شراء الأعضاء"
    }
  ]);

  console.log("✅ Slash Commands Registered");
});

/* ================= PREFIX COMMANDS ================= */
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  if (message.content === "+users") {
    return message.reply(`📦 الستوك الحالي: ${Object.keys(getUsers()).length}`);
  }

  if (message.content === "+send") {
    if (!config.bot.owners.includes(message.author.id)) return;

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("أثبت نفسك")
        .setStyle("LINK")
        .setURL(config.bot.verifyLink)
        .setEmoji("✅")
    );

    return message.channel.send({
      content: "اضغط على الزر 👇",
      components: [row]
    });
  }

  if (message.content === "+help") {
    return message.reply("+users\n+send\n/stock\n/panel");
  }
});

/* ================= SLASH ================= */
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "stock") {
    return interaction.reply({
      content: `📦 الستوك الحالي: ${Object.keys(getUsers()).length}`,
      ephemeral: true
    });
  }

  if (interaction.commandName === "panel") {
    const embed = new MessageEmbed()
      .setTitle("بيع أعضاء حقيقية 👥")
      .setDescription("اضغط على الزر لفتح تذكرة شراء")
      .setColor("#2f3136");

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("open_ticket")
        .setLabel("شراء أعضاء")
        .setStyle("SECONDARY")
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
});

/* ================= BUTTON ================= */
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "open_ticket") {
    const channel = await interaction.guild.channels.create(
      `ticket-${interaction.user.username}`,
      {
        type: "GUILD_TEXT",
        parent: config.bot.categoryId,
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ["VIEW_CHANNEL"]
          }
        ]
      }
    );

    return interaction.reply({
      content: `✅ تم فتح التذكرة <#${channel.id}>`,
      ephemeral: true
    });
  }
});

/* ================= LOGIN ================= */
client.login(config.bot.token);
