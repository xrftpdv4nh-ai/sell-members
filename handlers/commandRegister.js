const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const config = require("../config");

module.exports = async (client) => {
  const commands = [];
  const commandsPath = path.join(__dirname, "../commands/slash");
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const command = require(`${commandsPath}/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(process.env.token);

  try {
    await rest.put(
      Routes.applicationCommands(config.bot.botID),
      { body: commands }
    );
    console.log("✅ Slash commands registered automatically");
  } catch (err) {
    console.error("❌ Command register error:", err);
  }
};
