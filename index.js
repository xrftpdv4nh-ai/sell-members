/* =======================================================
   🔹 1) IMPORTS
======================================================= */

const {
  Client,
  Intents,
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Modal,
  TextInputComponent
} = require("discord.js");

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const Database = require("st.db");
const DiscordOauth2 = require("discord-oauth2");
const fs = require("fs");
const path = require("path");

/* =======================================================
   🔹 2) CONFIG
======================================================= */

const config = require("./config.js");

/* =======================================================
   🔹 3) OAUTH INSTANCE
======================================================= */

const oauth = new DiscordOauth2({
  clientId: config.bot.botID,
  clientSecret: config.bot.clientSECRET,
  redirectUri: config.bot.callbackURL,
});

/* =======================================================
   🔹 4) CLIENT
======================================================= */

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/* =======================================================
   🔹 5) EXPRESS SERVER
======================================================= */

const app = express();

app.listen(process.env.PORT || 3000, () => {
  console.log("🌍 Website is running");
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* =======================================================
   🔹 6) DATABASE
======================================================= */

const usersdata = new Database({
  path: "./database/users.json",
  databaseInObject: true,
});

/* =======================================================
   🔹 7) PASSPORT AUTH
======================================================= */

passport.use(
  new DiscordStrategy(
    {
      clientID: config.bot.botID,
      clientSecret: config.bot.clientSECRET,
      callbackURL: config.bot.callbackURL,
      scope: ["identify", "email", "guilds", "guilds.join"],
    },
    (accessToken, refreshToken, profile, done) => {
      usersdata.set(profile.id, { accessToken, refreshToken });
      return done(null, profile);
    }
  )
);

passport.serializeUser((u, d) => d(null, u));
passport.deserializeUser((u, d) => d(null, u));

app.use(
  session({
    secret: "secret_session",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* =======================================================
   🔹 8) ROUTES
======================================================= */

app.get("/", (req, res) => {
  res.send("Bot is Online 24H ✅");
});

app.get("/login", passport.authenticate("discord", { failureRedirect: "/" }));

/* =======================================================
   🔹 9) MESSAGE COMMANDS
======================================================= */

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  /* ---------- +send ---------- */
  if (message.content === "+send") {
    if (!config.bot.owners.includes(message.author.id)) return;

    if (!config.bot.verifylink) {
      return message.reply("❌ لينك التحقق غير موجود");
    }

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("أثبت نفسك")
        .setStyle("LINK")
        .setURL(config.bot.verifylink)
        .setEmoji("✅")
    );

    return message.channel.send({
      content: "اضغط على الزر بالأسفل لإثبات نفسك 👇",
      components: [row],
    });
  }

  /* ---------- +users ---------- */
  if (message.content === "+users") {
    return message.reply(`يوجد حالياً ${usersdata.all().length} مستخدم`);
  }

  /* ---------- +panel ---------- */
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

    return message.channel.send({ embeds: [embed], components: [row] });
  }
});

/* =======================================================
   🔹 10) INTERACTIONS (Buttons + Modal)
======================================================= */

client.on("interactionCreate", async (interaction) => {
  try {

    /* ---------- BUTTONS ---------- */
    if (interaction.isButton()) {

      /* Open Ticket */
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

        await interaction.reply({
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

        return ticket.send({ embeds: [embed], components: [row] });
      }

      /* Show Modal */
      if (interaction.customId === "buy") {
        const modal = new Modal()
          .setCustomId("buy_modal")
          .setTitle("شراء أعضاء 👥");

        modal.addComponents(
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("server_id")
              .setLabel("ايدي السيرفر")
              .setStyle("SHORT")
              .setRequired(true)
          ),
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("members_amount")
              .setLabel("عدد الأعضاء")
              .setStyle("SHORT")
              .setRequired(true)
          )
        );

        return interaction.showModal(modal);
      }

      /* Close Ticket */
      if (interaction.customId === "close") {
        await interaction.reply({ content: "🔒 يتم إغلاق التذكرة", ephemeral: true });
        return interaction.channel.delete().catch(() => {});
      }
    }

    /* ---------- MODAL SUBMIT ---------- */
    if (interaction.isModalSubmit() && interaction.customId === "buy_modal") {

      await interaction.deferReply({ ephemeral: true });

      const serverId = interaction.fields.getTextInputValue("server_id");
      const amount = Number(interaction.fields.getTextInputValue("members_amount"));
      const price = Number(config.bot.price);

      if (!serverId || isNaN(amount) || amount <= 0) {
        return interaction.editReply("❌ بيانات غير صحيحة");
      }

      if (!price || price <= 0) {
        return interaction.editReply("❌ السعر غير محدد في الكونفيج");
      }

      const total = price * amount;

      /* 🔹 هنا مكان oauth.addMember منطقيًا */
      oauth.addMember({
        guildId: serverId,
        userId: "exampleUserId",
        accessToken: "exampleAccessToken",
        botToken: client.token,
      });

      return interaction.editReply(
        `✅ تم استلام الطلب\n\n📌 السيرفر: \`${serverId}\`\n👥 العدد: \`${amount}\`\n💰 السعر: \`${total}\``
      );
    }

  } catch (err) {
    console.error("❌ Interaction Error:", err);
    if (!interaction.replied) {
      interaction.reply({ content: "❌ حصل خطأ غير متوقع", ephemeral: true });
    }
  }
});

/* =======================================================
   🔹 11) READY + ERRORS
======================================================= */

client.on("ready", () => {
  console.log(`🤖 Bot is Online: ${client.user.tag}`);
});

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

client.login(process.env.token);
