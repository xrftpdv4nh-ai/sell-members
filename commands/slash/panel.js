const {
  SlashCommandBuilder,
  MessageActionRow,
  MessageButton
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("فتح لوحة الشراء"),

  async execute(interaction) {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("شراء")
        .setStyle("SUCCESS")
        .setCustomId("buy")
    );

    interaction.reply({
      content: "🛒 لوحة الشراء",
      components: [row],
      ephemeral: true
    });
  }
};
