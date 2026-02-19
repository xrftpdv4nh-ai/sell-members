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
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const DiscordOauth2 = require("discord-oauth2");

const config = require("./config");

/* ================= FILE DB ================= */
const dbPath = path.join(process.cwd(), "database", "users.json");

if (!fs.existsSync("database")) fs.mkdirSync("database");
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

function getUsers() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function setUser(id, data) {
  const users = getUsers();
  users[id] = data;
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

/* ================= CLIENT ================= */
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/* ================= EXPRESS ================= */
const app = express();
app.listen(process.env.PORT || 3000, () => {
  console.log("🌍 Website Online");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ================= OAUTH ================= */
const oauth = new DiscordOauth2({
  clientId: config.bot.botID,
  clientSecret: config.bot.clientSECRET,
  redirectUri: config.bot.callbackURL,
});

/* ================= PASSPORT ================= */
passport.use(
  new DiscordStrategy(
    {
      clientID: config.bot.botID,
      clientSecret: config.bot.clientSECRET,
      callbackURL: config.bot.callbackURL,
      scope: ["identify", "email", "guilds", "guilds.join"],
    },
    (accessToken, refreshToken, profile, done) => {
      setUser(profile.id, { accessToken, refreshToken });
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
  res.send("Bot Online 24H ✅");
});

app.get("/login", passport.authenticate("discord", { failureRedirect: "/" }));

/* ================= READY ================= */
client.on("ready", async () => {
  console.log(`🤖 Bot Online: ${client.user.tag}`);

  await client.application.commands.set([
    { name: "stock", description: "عرض عدد الأعضاء" },
    { name: "panel", description: "شراء أعضاء" },
  ]);
});

/* ================= PREFIX ================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "+users") {
    const users = Object.keys(getUsers()).length;
    message.reply(`📦 الستوك الحالي: ${users}`);
  }
});

/* ================= SLASH ================= */
client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    if (interaction.commandName === "stock") {
      const users = Object.keys(getUsers()).length;
      return interaction.reply({
        content: `📦 الستوك الحالي: ${users}`,
        ephemeral: true,
      });
    }

    if (interaction.commandName === "panel") {
      const embed = new MessageEmbed()
        .setTitle("شراء أعضاء 👥")
        .setDescription("اضغط لفتح تذكرة")
        .setColor("#0099ff");

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("open_ticket")
          .setLabel("شراء أعضاء")
          .setStyle("SECONDARY")
      );

      interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
  }
});

/* ================= LOGIN ================= */
client.login(process.env.token);
