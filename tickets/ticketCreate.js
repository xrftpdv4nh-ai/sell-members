const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../config");

module.exports = async (interaction, client) => {
  const guild = interaction.guild;
  const member = interaction.member;

  // منع فتح أكتر من تكت
  if (guild.channels.cache.find(c => c.name === `ticket-${member.user.username}`)) {
    return interaction.reply({ content: "❌ عندك تكت مفتوح بالفعل", ephemeral: true });
  }

  const channel = await guild.channels.create(`ticket-${member.user.username}`, {
    type: "GUILD_TEXT",
    parent: config.ticketCategoryId,
    permissionOverwrites: [
      { id: guild.id, deny: ["VIEW_CHANNEL"] },
      { id: member.id, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] },
      { id: config.supportRoleId, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] }
    ]
  });

  const embed = new MessageEmbed()
    .setColor("#0f172a")
    .setTitle("🎟️ تذكرة شراء أعضاء")
    .setDescription(
`👋 أهلاً بك في نظام التذاكر  

📌 **تفاصيل الخدمة:**  
• شراء أعضاء متواجدين  
• نسبة دخول عالية  
• التسليم تلقائي  

📝 **اكتب الكمية المطلوبة وانتظر الرد**`
    );

  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("close_ticket")
      .setLabel("إغلاق التذكرة")
      .setStyle("DANGER")
      .setEmoji("❌")
  );

  await channel.send({
    content: `<@${member.id}>`,
    embeds: [embed],
    components: [row]
  });

  interaction.reply({ content: "✅ تم إنشاء التذكرة", ephemeral: true });
};
