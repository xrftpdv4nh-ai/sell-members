require("dotenv").config();

const { Client, Intents } = require("discord.js");
const config = require("./config");

/* ================= CLIENT ================= */
const client = new Client({
  intents: [Intents.FLAGS.GUILDS],
});

/* ================= HANDLERS ================= */
require("./handlers/slashHandler")(client);
require("./handlers/commandRegister")(client);

/* ================= READY ================= */
client.once("ready", () => {
  console.log(`🤖 Bot Online: ${client.user.tag}`);
});

/* ================= LOGIN ================= */
client.login(process.env.token);
