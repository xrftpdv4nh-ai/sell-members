const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "panel",

  execute(message) {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply("❌ الأمر ده للأدمن فقط");
    }

    const embed = new MessageEmbed()
      .setTitle("شراء أعضاء 👥")
      .setDescription("اضغط الزر بالأسفل لفتح تذكرة شراء")
      .setColor("#2f3136");

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("open_ticket")
        .setLabel("🛒 شراء أعضاء")
        .setStyle("SUCCESS")
    );

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};
