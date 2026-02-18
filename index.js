const {
  Client,
  Intents,
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Modal,
  TextInputComponent
} = require("discord.js");

const fs = require("fs");
const path = require("path");

/* ================= CLIENT ================= */

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/* ================= EXPRESS ================= */

const express = require("express");
const app = express();

app.listen(process.env.PORT || 3000, () => {
  console.log("🌍 Website is running");
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ================= DATABASE ================= */

const Database = require("st.db");
const usersdata = new Database({
  path: "./database/users.json",
  databaseInObject: true,
});

/* ================= CONFIG ================= */

const config = require("./config.js");

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

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  res.send("Bot is Online 24H ✅");
});

app.get("/login", passport.authenticate("discord", { failureRedirect: "/" }));

/* ================= COMMANDS ================= */

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

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

  if (message.content === "+users") {
    return message.reply(`يوجد حالياً ${usersdata.all().length} مستخدم`);
  }

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

/* ================= INTERACTIONS ================= */

client.on("interactionCreate", async (interaction) => {
  try {
    /* ---------- BUTTONS ---------- */
    if (interaction.isButton()) {

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

      if (interaction.customId === "close") {
        await interaction.reply({ content: "🔒 يتم إغلاق التذكرة", ephemeral: true });
        return interaction.channel.delete().catch(() => {});
      }
    }

    /* ---------- MODAL ---------- */
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

/* ================= READY ================= */

client.on("ready", () => {
  console.log(`🤖 Bot is Online: ${client.user.tag}`);
});

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

client.login(process.env.token);
