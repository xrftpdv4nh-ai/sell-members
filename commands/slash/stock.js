const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stock")
    .setDescription("عرض الستوك"),

  async execute(interaction) {
    interaction.reply(`📦 الستوك الحالي: ${config.stock}`);
  }
};
