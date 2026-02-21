// ===== REQUIRE =====
const { Client, Intents } = require("discord.js");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const fs = require("fs");

const config = require("./config");
const OAuthUser = require("./database/User");
const checkToken = require("./utils/checkToken");
const addMember = require("./utils/addMember");

// ===== DISCORD CLIENT =====
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS // 🔴 مهم لإضافة الرول
  ]
});

// ===== EXPRESS APP =====
const app = express();
app.disable("x-powered-by");

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
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

// ===== PASSPORT =====
app.use(passport.initialize());
app.use(passport.session());

// ===== MONGODB =====
(async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🟢 MongoDB Connected");
  } catch (err) {
    console.error("🔴 MongoDB Error:", err.message);
  }
})();

// ===== WEB SERVER =====
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ OAuth Bot Running");
});

app.listen(PORT, () => {
  console.log("🌐 Web server running on port", PORT);
});

// ===== LOAD OAUTH =====
require("./oauth/passport")(passport);
require("./oauth/verify")(app, passport);
require("./oauth/callback")(app, passport, client);

// ===== LOAD COMMANDS =====
client.commands = new Map();

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// ===== AUTO SYNC FUNCTION =====
async function autoSync(log = true) {
  const users = await OAuthUser.find();
  let removed = 0;

  for (const user of users) {
    const valid = await checkToken(user.accessToken);

    if (!valid) {
      await OAuthUser.deleteOne({ discordId: user.discordId });
      removed++;

      if (log) {
        try {
          const ch = await client.channels.fetch(config.logs.revoked);
          if (ch) {
            ch.send(
              `❌ **OAuth Revoked**\n👤 ${user.username}\n🆔 ${user.discordId}`
            );
          }
        } catch {}
      }
    }
  }

  return removed;
}

// ===== COMMAND HANDLER =====
client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.bot.prefix)) return;
  if (!config.bot.owners.includes(message.author.id)) return;

  const args = message.content
    .slice(config.bot.prefix.length)
    .trim()
    .split(/ +/);

  const cmd = args.shift().toLowerCase();
  const command = client.commands.get(cmd);
  if (!command) return;

  try {
    await command.run(client, message, args);
  } catch (err) {
    console.error(err);
    message.reply("❌ حصل خطأ أثناء تنفيذ الأمر");
  }
});

// ===== READY =====
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  // ⏱️ Auto Sync كل 15 دقيقة
  setInterval(() => {
    autoSync(true);
  }, 1000 * 60 * 15);
});

// ===== LOGIN =====
client.login(process.env.BOT_TOKEN);
