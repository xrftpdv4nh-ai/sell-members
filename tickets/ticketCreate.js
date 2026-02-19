const {
  MessageEmbed,
  MessageActionRow,
  MessageButton
} = require("discord.js");
const config = require("../config");

module.exports = async (interaction, client) => {
  const guild = interaction.guild;
  const user = interaction.user;

  // ✅ منع أكتر من تكت لنفس الشخص (بالـ userId)
  const existing = guild.channels.cache.find(c =>
    c.parentId === config.ticket.categoryId &&
    c.topic === `ticket-user:${user.id}`
  );

  if (existing) {
    return interaction.reply({
      content: `❌ عندك تذكرة مفتوحة بالفعل: ${existing}`,
      ephemeral: true
    });
  }

  // ✅ إنشاء التكت + حفظ userId في topic
  const channel = await guild.channels.create(
    `ticket-${user.username}`,
    {
      type: "GUILD_TEXT",
      parent: config.ticket.categoryId,
      topic: `ticket-user:${user.id}`, // 🔥 أهم سطر
      permissionOverwrites: [
        {
          id: guild.id,
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
    }
  );

  // ====== الإيمبيد ======
  const embed = new MessageEmbed()
    .setColor("#0f172a")
    .setTitle("🎫 تذكرة شراء أعضاء")
    .setDescription(
      `مرحباً ${user}\n\n` +
      "**تفاصيل الخدمة:**\n" +
      "🤝 شراء أعضاء السوق بنسبة **70%**\n" +
      "💳 التعامل بالكريدت فقط\n" +
      "⚡ العملية تلقائية 100%\n" +
      "🚫 لا يمكن دخول السوق كامل\n\n" +
      "**معلومات التذكرة:**\n" +
      "🌿 شراء رصيد من الزر بالأسفل\n" +
      "👥 إدخال أعضاء من الزر المخصص\n\n" +
      "**مهم:**\n" +
      "🎮 أدخل البوتين لضمان أفضل نتيجة\n" +
      "💚 لا تنسى الصلاة على النبي"
    )
    .setFooter({ text: "Support System" });

  // ====== الأزرار ======
  const row1 = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("buy_balance")
      .setLabel("💳 شراء رصيد")
      .setStyle("SUCCESS"),
    new MessageButton()
      .setCustomId("check_server")
      .setLabel("🔍 فحص الخادم")
      .setStyle("SECONDARY")
  );

  const row2 = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("buy_members")
      .setLabel("👥 إدخال الأعضاء")
      .setStyle("PRIMARY"),
    new MessageButton()
      .setLabel("🤖 إضافة البوت")
      .setStyle("LINK")
      .setURL("https://discord.com/oauth2/authorize")
  );

  const row3 = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("close_ticket")
      .setLabel("❌ غلق التذكرة")
      .setStyle("DANGER")
  );

  // إرسال الإيمبيد
  await channel.send({
    content: `${user}`,
    embeds: [embed],
    components: [row1, row2, row3]
  });

  // المسدچ الإضافي
  await channel.send({
    content:
`• لمعرفة رصيدك اكتب **+coins**

• لتسهيل الشراء أدخل بوت الفحص  
• طرد أي بوت أثناء الإدخال يوقف العملية تلقائياً`
  });

  await interaction.reply({
    content: `✅ تم فتح تذكرتك: ${channel}`,
    ephemeral: true
  });
};
