const {
  Discord,
  MessageEmbed,
  Client,
  Intents,
  GuildScheduledEvent,
  Permissions,
  MessageButton,
  MessageActionRow,
  Modal,
  TextInputComponent,
  MessageCollector
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/* ================= EXPRESS ================= */

const express = require("express");
const app = express();

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ================= DATABASE ================= */

const Database = require("st.db");
const usersdata = new Database({
  path: "./database/users.json",
  databaseInObject: true,
});

/* ================= CONFIG ================= */

const config = require("./config.js");
global.config = config;

/* ================= PASSPORT ================= */

const passport = require("passport");
const session = require("express-session");
const DiscordStrategy = require("passport-discord").Strategy;

passport.use(
  new DiscordStrategy(
    {
      clientID: config.bot.botID,
      clientSecret: config.bot.clientSECRET,
      callbackURL: config.bot.callbackURL,
      scope: ["identify", "email", "guilds", "guilds.join"],
    },
    function (accessToken, refreshToken, profile, done) {
      usersdata.set(profile.id, {
        accessToken,
        refreshToken,
      });
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(
  session({
    secret: "secret_session",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ================= OAUTH ================= */

const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2({
  clientId: config.bot.botID,
  clientSecret: config.bot.clientSECRET,
  redirectUri: config.bot.callbackURL,
});

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  res.send("Bot is Online 24H ✅");
});

app.get(
  "/login",
  passport.authenticate("discord", { failureRedirect: "/" })
);

/* ================= COMMANDS ================= */

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("+send")) {
    if (!config.bot.owners.includes(message.author.id)) return;

    let button = new MessageButton()
      .setLabel("أثبت نفسك")
      .setStyle("LINK")
      .setURL(config.bot.verifylink)
      .setEmoji("✅");

    let row = new MessageActionRow().addComponents(button);
    message.channel.send({ components: [row] });
  }

  if (message.content.startsWith("+check")) {
    if (!config.bot.owners.includes(message.author.id)) return;

    let member = message.mentions.members.first();
    if (!member) return message.reply("منشن شخص صحيح");

    let data = usersdata.get(member.id);
    if (data) return message.reply("موثق بالفعل ✅");
    else return message.reply("غير موثق ❌");
  }

  if (message.content.startsWith("+users")) {
    let alld = usersdata.all();
    message.reply(`يوجد حالياً ${alld.length} مستخدم`);
  }

  if (message.content.startsWith("+help")) {
    message.reply(`
+join
+refresh
+users
+check
+send
+panel
    `);
  }
});

/* ================= PANEL ================= */

client.on("messageCreate", async (message) => {
  if (message.content === "+panel") {
    const embed = new MessageEmbed()
      .setTitle("بيع أعضاء حقيقية 👥")
      .setDescription("اضغط على زر شراء أعضاء لفتح تذكرة")
      .setColor("#0099ff");

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("open_ticket")
        .setLabel("شراء أعضاء")
        .setEmoji("👥")
        .setStyle("SECONDARY")
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

/* ================= TICKETS ================= */

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "open_ticket") {
    const ticket = await interaction.guild.channels.create(
      `ticket-${interaction.user.username}`,
      {
        type: "GUILD_TEXT",
        parent: config.bot.category,
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ["VIEW_CHANNEL"],
          },
        ],
      }
    );

    interaction.reply({
      content: `تم فتح التذكرة بنجاح ✅ <#${ticket.id}>`,
      ephemeral: true,
    });

    const embed = new MessageEmbed()
      .setTitle("شراء أعضاء 👥")
      .setDescription("اضغط شراء لإكمال العملية")
      .setColor("#00cc66");

    const row = new MessageActionRow().addComponents(
      new MessageButton().setCustomId("buy").setLabel("شراء").setStyle("SUCCESS"),
      new MessageButton().setCustomId("close").setLabel("قفل").setStyle("DANGER")
    );

    ticket.send({ embeds: [embed], components: [row] });
  }

  if (interaction.customId === "close") {
    interaction.channel.delete().catch(() => {});
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "buy") {
    const modal = new Modal()
      .setCustomId("buy_modal")
      .setTitle("شراء أعضاء 👥");

    const serverIdInput = new TextInputComponent()
      .setCustomId("server_id")
      .setLabel("ايدي السيرفر")
      .setStyle("SHORT")
      .setRequired(true);

    const amountInput = new TextInputComponent()
      .setCustomId("members_amount")
      .setLabel("عدد الأعضاء")
      .setStyle("SHORT")
      .setRequired(true);

    const row1 = new MessageActionRow().addComponents(serverIdInput);
    const row2 = new MessageActionRow().addComponents(amountInput);

    modal.addComponents(row1, row2);

    await interaction.showModal(modal);
  }
});
/* ================= READY ================= */

client.on("ready", () => {
  console.log(`Bot is Online ✅ ${client.user.tag}`);
});

/* ================= ERRORS ================= */

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

client.login(process.env.token);
