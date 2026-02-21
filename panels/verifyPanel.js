const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
  run: async (client, message) => {
    const embed = new MessageEmbed()
      .setColor("#5865F2")
      .setTitle("🔐 نظام التوثيق")
      .setDescription(
        "• اضغط **اثبت نفسك** لتسجيل حسابك\n" +
        "• اضغط **المخزون** لمعرفة العدد\n" +
        "• Refresh لتحديث العدد"
      );

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("✅ اثبت نفسك")
        .setStyle("LINK")
        .setURL(`${process.env.DOMAIN}/login`),

      new MessageButton()
        .setCustomId("stock")
        .setLabel("📦 المخزون")
        .setStyle("SECONDARY"),

      new MessageButton()
        .setCustomId("refresh")
        .setLabel("🔄 Refresh")
        .setStyle("PRIMARY")
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
};
