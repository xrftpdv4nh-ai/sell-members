const { Client, Intents } = require("discord.js");
const express = require("express");
const fs = require("fs");

const config = require("./config");

/* ================= TOKEN ================= */
// 👇👇 حط التوكن هنا فقط
const BOT_TOKEN = process.env.BOT_TOKEN;

/* ================= CLIENT ================= */
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
});

client.commands = new Map();

/* ================= EXPRESS ================= */
const app = express();
app.get("/", (req, res) => res.send("Bot Online"));
app.listen(3000);

/* ================= LOAD HANDLERS ================= */
require("./handlers/commandHandler")(client);
require("./handlers/interactionHandler")(client);

/* ================= READY ================= */
client.once("ready", () => {
  console.log(`🤖 Bot Online: ${client.user.tag}`);
});

/* ================= LOGIN ================= */
client.login(BOT_TOKEN);
