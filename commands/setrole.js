const GuildSettings = require("../database/Settings");

module.exports = {
  name: "setrole",
  async run(client, message, args) {
    if (!message.member.permissions.has("MANAGE_ROLES")) {
      return message.reply("❌ لازم تكون Admin أو Manage Roles");
    }

    const role =
      message.mentions.roles.first() ||
      message.guild.roles.cache.get(args[0]);

    if (!role) {
      return message.reply("❌ منشن الرول أو حط الـ ID");
    }

    // تأكد إن البوت أعلى من الرول
    if (role.position >= message.guild.me.roles.highest.position) {
      return message.reply("❌ الرول أعلى من البوت");
    }

    await GuildSettings.findOneAndUpdate(
      { guildId: message.guild.id },
      { verifiedRole: role.id },
      { upsert: true }
    );

    message.reply(`✅ تم تعيين رول التوثيق: **${role.name}**`);
  }
};
