require("dotenv").config();

const { Client, Intents } = require("discord.js");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const DiscordOauth2 = require("discord-oauth2");
const Database = require("st.db");

/* ================= CONFIG ================= */
const config = require("./config.js");

/* ================= CLIENT ================= */
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/* ================= DATABASE ================= */
const usersdata = new Database({
  path: "./database/users.json",
  databaseInObject: true,
});

/* ================= EXPRESS ================= */
const app = express();
app.listen(process.env.PORT || 3000, () => {
  console.log("🌍 Website running");
});

app.use(
  session({
    secret: "oauth_session",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

/* ================= PASSPORT (OAUTH) ================= */
passport.use(
  new DiscordStrategy(
    {
      clientID: config.bot.botID,
      clientSecret: config.bot.clientSECRET,
      callbackURL: config.bot.callbackURL,
      scope: ["identify", "guilds", "guilds.join"],
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

passport.serializeUser((u, d) => d(null, u));
passport.deserializeUser((u, d) => d(null, u));

/* ================= ROUTES ================= */
app.get("/", (req, res) => {
  res.send("Bot + OAuth Online ✅");
});

app.get("/login", passport.authenticate("discord"));

/* ================= OAUTH CLIENT ================= */
const oauth = new DiscordOauth2({
  clientId: config.bot.botID,
  clientSecret: config.bot.clientSECRET,
  redirectUri: config.bot.callbackURL,
});

/* ================= SLASH COMMAND (بيع) ================= */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  // /sell members:<number>
  if (interaction.commandName === "sell") {
    if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
      return interaction.reply({ content: "❌ Admin only", ephemeral: true });
    }

    const amount = interaction.options.getInteger("members");
    const price = Number(config.bot.price || 0);
    const stock = usersdata.all().length;

    if (!amount || amount <= 0) {
      return interaction.reply({ content: "❌ عدد غير صحيح", ephemeral: true });
    }
    if (!price) {
      return interaction.reply({ content: "❌ السعر غير مُعد", ephemeral: true });
    }
    if (amount > stock) {
      return interaction.reply({
        content: `❌ الستوك غير كافي. المتاح: ${stock}`,
        ephemeral: true,
      });
    }

    const total = amount * price;
    return interaction.reply(
      `🛒 **طلب بيع**\n\n👥 العدد: ${amount}\n📦 الستوك: ${stock}\n💰 الإجمالي: ${total}\n\n⚠️ (التنفيذ الآلي في الخطوة التالية)`
    );
  }
});

/* ================= READY ================= */
client.once("ready", async () => {
  console.log(`🤖 Bot Online: ${client.user.tag}`);
});

/* ================= LOGIN ================= */
client.login(process.env.token);
