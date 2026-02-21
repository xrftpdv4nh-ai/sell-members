// ===== REQUIRE =====
const { Client, Intents } = require("discord.js");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const fs = require("fs");
const path = require("path");
const config = require("./config");

// ===== DISCORD CLIENT =====
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
    // ⚠️ لا نستخدم GUILD_MEMBERS لأن الإضافة بـ OAuth
  ]
});

// ===== EXPRESS APP =====
const app = express();

// ===== MIDDLEWARE =====
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ===== SESSION =====
app.use(
  session({
    secret: "oauth-secret",
    resave: false,
    saveUninitialized: false
  })
);

// ===== PASSPORT =====
app.use(passport.initialize());
app.use(passport.session());

// ===== WEB SERVER (RAILWAY REQUIRED) =====
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ OAuth Bot Running");
});

// ===== TEST LOGIN ROUTE (مهم) =====
app.get("/login", async (req, res) => {
  try {
    // Discord بيرجع code هنا
    if (!req.query.code) {
      return res.send("❌ No OAuth code provided");
    }

    // لو وصل هنا يبقى OAuth شغال
    res.send("✅ OAuth callback reached successfully");
  } catch (err) {
    console.error("OAuth /login error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log("🌐 Web server running on port", PORT);
});

// ===== LOAD OAUTH MODULES =====
require("./oauth/passport")(passport);
require("./oauth/verify")(app, passport);
require("./oauth/callback")(app, passport, client);

// ===== DATABASE =====
const dbDir = path.join(__dirname, "database");
const dbPath = path.join(dbDir, "users.json");

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
}

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
