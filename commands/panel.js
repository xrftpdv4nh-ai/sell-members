const {
  MessageEmbed,
  MessageActionRow,
  MessageButton
} = require("discord.js");

const config = require("../config");

module.exports = {
  name: "panel",
  run: async (client, message) => {

    // لو حابب تخليه للإدارة فقط
    if (
      config.owners &&
      !config.owners.includes(message.author.id)
    ) {
      return message.reply("❌ الأمر ده للإدارة فقط");
    }

    const embed = new MessageEmbed()
      .setTitle("🛒 شراء أعضاء حقيقية")
      .setDescription(
        "اضغط على الزر بالأسفل لفتح تذكرة شراء أعضاء\n\n" +
        "⚠️ يمنع السبام – تذكرة واحدة فقط لكل شخص"
      )
      .setColor("#0099ff")
      .setFooter({ text: "Support Team" });

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("open_ticket")
        .setLabel("📩 فتح تذكرة")
        .setStyle("PRIMARY")
    );

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });

    message.delete().catch(() => {});
  }
};
