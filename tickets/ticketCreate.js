const {
  MessageEmbed,
  MessageActionRow,
  MessageButton
} = require("discord.js");
const config = require("../config");

module.exports = async (interaction, client) => {
  const guild = interaction.guild;
  const user = interaction.user;

  // منع تكتين لنفس الشخص
  const existing = guild.channels.cache.find(
    c => c.name === `ticket-${user.username.toLowerCase()}`
  );

  if (existing) {
    return interaction.reply({
      content: "❌ عندك تذكرة مفتوحة بالفعل",
      ephemeral: true
    });
  }

  // إنشاء التكت باسم اليوزر
  const channel = await guild.channels.create(
    `ticket-${user.username}`,
    {
      type: "GUILD_TEXT",
      parent: config.ticket.categoryId,
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

  // ====== الإيمبيد الكبير (زي الصور) ======
  const embed = new MessageEmbed()
    .setColor("#0f172a")
    .setTitle("تم إنشاء التذكرة 🎉")
    .setDescription(
      `مرحباً ${user}\n\n` +
      "**تفاصيل الخدمة:**\n" +
      "🤝 يمكنك شراء الأعضاء المتواجدين في السوق بنسبة **70%**\n" +
      "💳 التعامل فقط عن طريق **الكريدت**\n" +
      "⚡ العملية تلقائية بنسبة **100%**\n" +
      "🚫 لا يمكن دخول السوق كامل بسبب سياسات ديسكورد\n\n" +
      "**معلومات التذكرة:**\n" +
      "🌿 لشراء رصيد اضغط على الزر بالأسفل\n" +
      "👥 لشراء أعضاء اضغط على زر (شراء أعضاء)\n\n" +
      "**مهم:**\n" +
      "🎮 الرجاء إدخال البوتين لضمان أفضل نتيجة\n" +
      "💚 لا تنسى الصلاة على النبي قبل الشراء"
    )
    .setFooter({ text: "Support System" });

  // ====== الأزرار (زي البوت اللي بتقلده) ======
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
      .setURL("https://discord.com/oauth2/authorize") // عدّلها براحتك
  );

  const row3 = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("close_ticket")
      .setLabel("❌ غلق التذكرة")
      .setStyle("DANGER")
  );

  // إرسال الرسالة داخل التكت
  await channel.send({
    content: `${user}`,
    embeds: [embed],
    components: [row1, row2, row3]
  });

  await interaction.reply({
    content: `✅ تم فتح تذكرتك: ${channel}`,
    ephemeral: true
  });
};
