const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const config = require("../config");

module.exports = async (client) => {
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

  try {
    console.log("⏳ Registering slash commands...");
    await rest.put(
      Routes.applicationCommands(config.bot.botID),
      { body: commands }
    );
    console.log("✅ Slash commands registered");
  } catch (error) {
    console.error(error);
  }
};
