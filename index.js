// ===== REQUIRE =====
const { Client, Intents } = require("discord.js");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const config = require("./config");

// ===== DISCORD CLIENT =====
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

// ===== EXPRESS APP =====
const app = express();

// ===== BASIC SECURITY =====
app.disable("x-powered-by");

// ===== MIDDLEWARE =====
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ===== SESSION =====
app.use(
  session({
    name: "oauth.sid",
    secret: process.env.SESSION_SECRET || "TEMP_SECRET_CHANGE_ME",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 // 24h
    }
  })
);

// ===== PASSPORT =====
app.use(passport.initialize());
app.use(passport.session());

// ===== MONGODB CONNECTION =====
(async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🟢 MongoDB Connected Successfully");
  } catch (err) {
    console.error("🔴 MongoDB Connection Error:", err.message);
  }
})();
// ===== WEB SERVER =====
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).send("✅ OAuth Bot Running");
});

// ===== OAUTH LOGIN CALLBACK CHECK =====
app.get("/login", (req, res) => {
  if (!req.query.code) {
    return res.status(400).send("❌ No OAuth code provided");
  }
  res.send("✅ OAuth code received");
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log("🌐 Web server running on port", PORT);
});

// ===== LOAD OAUTH MODULES =====
require("./oauth/passport")(passport);
require("./oauth/verify")(app, passport);
require("./oauth/callback")(app, passport, client);

// ===== COMMANDS =====
client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.bot.prefix)) return;
  if (!config.bot.owners.includes(message.author.id)) return;

  const args = message.content
    .slice(config.bot.prefix.length)
    .trim()
    .split(/ +/);

  const cmd = args.shift().toLowerCase();

  if (cmd === "panel") {
    const panel = require("./panels/verifyPanel");
    panel.run(client, message);
  }
});

// ===== READY =====
client.once("ready", () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
});

// ===== LOGIN =====
client.login(process.env.BOT_TOKEN);
