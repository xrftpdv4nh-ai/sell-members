const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
  name: "panel",
  run: async (client, message) => {

    const embed = new MessageEmbed()
      .setColor("#0f172a")
      .setTitle("شراء أعضاء")
      .setDescription(
`🎮 الرجاء إدخال البوتين لضمان أفضل نسبة دخول  
🤝 لا تنسى الصلاة على النبي قبل الشراء 💚`
      )
      .setImage("PUT_IMAGE_LINK");

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("open_ticket")
        .setLabel("شراء أعضاء")
        .setStyle("SUCCESS")
        .setEmoji("👥")
    );

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};
