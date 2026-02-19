const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const config = require("../config");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    /* ===== OPEN TICKET ===== */
    if (interaction.customId === "open_ticket") {
      const existing = interaction.guild.channels.cache.find(
        c => c.name === `ticket-${interaction.user.id}`
      );

      if (existing) {
        return interaction.reply({
          content: `❗ لديك تذكرة مفتوحة بالفعل: ${existing}`,
          ephemeral: true
        });
      }

      const channel = await interaction.guild.channels.create(
        `ticket-${interaction.user.id}`,
        {
          type: "GUILD_TEXT",
          parent: config.ticketCategory,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: ["VIEW_CHANNEL"],
            },
            {
              id: interaction.user.id,
              allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
            },
          ],
        }
      );

      const embed = new MessageEmbed()
        .setTitle("🎟️ تذكرة شراء أعضاء")
        .setDescription("اكتب الكمية المطلوبة وانتظر الرد")
        .setColor("GREEN");

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("close_ticket")
          .setLabel("❌ إغلاق التذكرة")
          .setStyle("DANGER")
      );

      channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [row]
      });

      interaction.reply({
        content: `✅ تم فتح التذكرة: ${channel}`,
        ephemeral: true
      });
    }

    /* ===== CLOSE TICKET ===== */
    if (interaction.customId === "close_ticket") {
      interaction.channel.delete();
    }
  });
};
