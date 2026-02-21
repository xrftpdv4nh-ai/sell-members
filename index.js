const { Client, Intents } = require("discord.js");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const fs = require("fs");
const config = require("./config");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS
  ]
});

const app = express();

/* ===== WEB SERVER (REQUIRED FOR RAILWAY) ===== */
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("OAuth Bot Running");
});

app.listen(PORT, () => {
  console.log("Web server running on port", PORT);
});

/* ===== SESSION ===== */
app.use(
  session({
    secret: "oauth-secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ===== LOAD OAUTH ===== */
require("./oauth/passport")(passport);
require("./oauth/verify")(app, passport);
require("./oauth/callback")(app, passport, client);

/* ===== DATABASE ===== */
if (!fs.existsSync("./database/users.json")) {
  fs.writeFileSync("./database/users.json", JSON.stringify([], null, 2));
}

/* ===== COMMANDS ===== */
client.on("messageCreate", async message => {
  if (!message.content.startsWith(config.bot.prefix)) return;
  if (!config.bot.owners.includes(message.author.id)) return;

  const cmd = message.content.slice(1).toLowerCase();

  if (cmd === "panel") {
    const panel = require("./panels/verifyPanel");
    panel.run(client, message);
  }
});

client.login(process.env.BOT_TOKEN);
