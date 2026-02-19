const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("اختبار البوت"),

  async execute(interaction) {
    interaction.reply("🏓 Pong!");
  }
};
