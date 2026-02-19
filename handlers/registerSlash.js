const { REST } = require("discord.js");
const { Routes } = require("discord-api-types/v9");
const config = require("../config");

module.exports = (client) => {
  client.once("ready", async () => {
    try {
      const commands = [
        {
          name: "stock",
          description: "عرض عدد الأعضاء المتاحين",
        },
        {
          name: "panel",
          description: "فتح لوحة شراء الأعضاء",
        },
      ];

      const rest = new REST({ version: "9" }).setToken(process.env.token);

      await rest.put(
        Routes.applicationCommands(config.bot.botID),
        { body: commands }
      );

      console.log("✅ Slash commands registered");
    } catch (error) {
      console.error("❌ Slash register error:", error);
    }
  });
};
