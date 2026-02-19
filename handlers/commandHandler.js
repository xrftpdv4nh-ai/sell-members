const fs = require("fs");
const config = require("../config");

module.exports = (client) => {
  const commandFiles = fs
    .readdirSync("./commands")
    .filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    client.commands.set(command.name, command);
  }

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content
      .slice(config.prefix.length)
      .trim()
      .split(/ +/);

    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName);

    if (!command) return;

    try {
      command.execute(message, args, client);
    } catch (err) {
      console.error(err);
    }
  });
};
