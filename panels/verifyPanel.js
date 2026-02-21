const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../config");

module.exports.run = async (client, message) => {
  const embed = new MessageEmbed()
    .setColor("#5865F2")
    .setTitle("🔐 نظام التوثيق")
    .setDescription(
      "اضغط على زر **اثبت نفسك** لتوثيق حسابك عبر Discord OAuth.\n\n" +
      "بعد التوثيق سيتم تسجيل حسابك في النظام."
    );

  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setStyle("LINK")
      .setLabel("✅ اثبت نفسك")
      .setURL(config.TheLinkVerfy) // لازم يكون https://
  );

  await message.channel.send({
    embeds: [embed],
    components: [row]
  });
};
