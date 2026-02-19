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
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const DiscordOauth2 = require("discord-oauth2");
const Database = require("st.db");

const config = require("./config.js");

/* ================== FOLDERS CHECK ================== */
if (!fs.existsSync(path.join(process.cwd(), "database"))) {
  fs.mkdirSync(path.join(process.cwd(), "database"));
}

if (!fs.existsSync(path.join(process.cwd(), "database", "users.json"))) {
  fs.writeFileSync(
    path.join(process.cwd(), "database", "users.json"),
    JSON.stringify({}, null, 2)
  );
}

/* ================== CLIENT ================== */
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/* ================== EXPRESS ================== */
const app = express();
app.listen(process.env.PORT || 3000, () => {
  console.log("🌍 Website Online");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ================== DATABASE (FIXED) ================== */
const usersdata = new Database({
  path: path.join(process.cwd(), "database", "users.json"),
  databaseInObject: true,
});

/* ================== OAUTH ================== */
const oauth = new DiscordOauth2({
  clientId: config.bot.botID,
  clientSecret: config.bot.clientSECRET,
  redirectUri: config.bot.callbackURL,
});

/* ================== PASSPORT ================== */
passport.use(
  new DiscordStrategy(
    {
      clientID: config.bot.botID,
      clientSecret: config.bot.clientSECRET,
      callbackURL: config.bot.callbackURL,
      scope: ["identify", "email", "guilds", "guilds.join"],
    },
    (accessToken, refreshToken, profile, done) => {
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

/* ================== ROUTES ================== */
app.get("/", (req, res) => {
  res.send("Bot Online 24H ✅");
});

app.get("/login", passport.authenticate("discord", { failureRedirect: "/" }));

/* ================== READY ================== */
client.on("ready", async () => {
  console.log(`🤖 Bot Online: ${client.user.tag}`);

  await client.application.commands.set([
    {
      name: "stock",
      description: "عرض عدد الأعضاء المتاحين",
    },
    {
      name: "panel",
      description: "فتح لوحة شراء الأعضاء",
    },
  ]);
});

/* ================== PREFIX COMMANDS ================== */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "+send") {
    if (!config.bot.owners.includes(message.author.id)) return;

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("أثبت نفسك")
        .setStyle("LINK")
        .setURL(config.bot.verifylink)
        .setEmoji("✅")
    );

    message.channel.send({
      content: "اضغط على الزر بالأسفل 👇",
      components: [row],
    });
  }

  if (message.content === "+users") {
    message.reply(`📦 الستوك الحالي: ${usersdata.all().length}`);
  }

  if (message.content === "+help") {
    message.reply("+send\n+users\n/stock\n/panel");
  }
});

/* ================== SLASH COMMANDS ================== */
client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    if (interaction.commandName === "stock") {
      return interaction.reply({
        content: `📦 **الستوك الحالي:** ${usersdata.all().length} عضو`,
        ephemeral: true,
      });
    }

    if (interaction.commandName === "panel") {
      const embed = new MessageEmbed()
        .setTitle("بيع أعضاء حقيقية 👥")
        .setDescription("اضغط على الزر لفتح تذكرة شراء")
        .setColor("#0099ff");

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("open_ticket")
          .setLabel("شراء أعضاء")
          .setEmoji("👥")
          .setStyle("SECONDARY")
      );

      return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
    }
  }

  if (interaction.isButton() && interaction.customId === "open_ticket") {
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
      content: `✅ تم فتح التذكرة <#${ticket.id}>`,
      ephemeral: true,
    });
  }
});

/* ================== ERRORS ================== */
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

/* ================== LOGIN ================== */
client.login(process.env.token);
