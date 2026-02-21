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
    // ⚠️ GUILD_MEMBERS مش مطلوب للبوت OAuth
  ]
});

// ===== EXPRESS APP =====
const app = express();

// ===== WEB SERVER (RAILWAY REQUIRED) =====
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("OAuth Bot Running");
});

app.listen(PORT, () => {
  console.log("🌐 Web server running on port", PORT);
});

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

// ===== LOAD OAUTH MODULES =====
require("./oauth/passport")(passport);
require("./oauth/verify")(app, passport);
require("./oauth/callback")(app, passport, client);

// ===== DATABASE =====
const dbPath = path.join(__dirname, "database", "users.json");

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
}

// ===== COMMANDS =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.bot.prefix)) return;
  if (!config.bot.owners.includes(message.author.id)) return;

  const args = message.content.slice(config.bot.prefix.length).trim().split(/ +/);
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
