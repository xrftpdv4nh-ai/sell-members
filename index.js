const { Client, Intents } = require("discord.js");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const fs = require("fs");
const path = require("path");
const config = require("./config");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const app = express();

/* ===== EXPRESS ===== */
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

/* ===== LOAD DATABASE ===== */
if (!fs.existsSync("./database/users.json")) {
  fs.writeFileSync("./database/users.json", JSON.stringify([]));
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

client.login(config.bot.token);
