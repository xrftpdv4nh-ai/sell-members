const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  const commands = [];
  const commandsPath = path.join(__dirname, "../commands/slash");
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const command = require(`${commandsPath}/${file}`);
    commands.push(command.data.toJSON());
  }

  client.once("ready", async () => {
    try {
      await client.application.commands.set(commands);
      console.log("✅ Slash commands registered (v13)");
    } catch (err) {
      console.error("❌ Failed to register slash commands:", err);
    }
  });
};
