module.exports = (client) => {
  client.slashCommands = new Map();

  const fs = require("fs");
  const path = require("path");

  const commandsPath = path.join(__dirname, "../commands/slash");
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const command = require(`${commandsPath}/${file}`);
    client.slashCommands.set(command.data.name, command);
  }

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);
      interaction.reply({ content: "❌ حصل خطأ", ephemeral: true });
    }
  });
};
