const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../config");

module.exports = async (interaction, client) => {
  const guild = interaction.guild;
  const user = interaction.user;

  // منع تكتين لنفس الشخص
  const existing = guild.channels.cache.find(
    c => c.name === `ticket-${user.id}`
  );
  if (existing) {
    return interaction.reply({
      content: "❌ لديك تذكرة مفتوحة بالفعل",
      ephemeral: true
    });
  }

  const channel = await guild.channels.create(`ticket-${user.username}`, {
    type: "GUILD_TEXT",
    parent: config.ticket.categoryId,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: ["VIEW_CHANNEL"]
      },
      {
        id: user.id,
        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
      },
      {
        id: config.ticket.supportRoleId,
        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
      }
    ]
  });

  const embed = new MessageEmbed()
    .setColor("#00b894")
    .setTitle("🎫 تذكرة شراء أعضاء")
    .setDescription(
      `مرحبًا ${user}\n\n` +
      "اكتب الكمية المطلوبة وانتظر رد الدعم.\n\n" +
      "⛔ يمنع السبام"
    );

  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("close_ticket")
      .setLabel("❌ غلق التذكرة")
      .setStyle("DANGER")
  );

  channel.send({
    content: `${user}`,
    embeds: [embed],
    components: [row]
  });

  interaction.reply({
    content: `✅ تم فتح التذكرة ${channel}`,
    ephemeral: true
  });
};
