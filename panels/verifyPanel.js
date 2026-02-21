const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'verify',

  async run(client, message) {
    const embed = new MessageEmbed()
      .setColor('#5865F2')
      .setTitle('🔐 إثبات الحساب')
      .setDescription(
        'اضغط على الزر بالأسفل لتأكيد حسابك عبر Discord OAuth\n\n' +
        '⚠️ تأكد إنك مسجل دخول بحسابك الصحيح'
      );

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setStyle('LINK')
        .setLabel('✅ اثبت نفسك')
        .setURL(String(config.bot.TheLinkVerfy)) // ← إجبار String
    );

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};
