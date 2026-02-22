const GuildSettings = require("../database/Settings");

module.exports = {
  name: "setrole",
  async run(client, message, args) {
    if (!message.member.permissions.has("MANAGE_ROLES")) {
      return message.reply("❌ لازم يكون عندك Manage Roles");
    }

    const role = message.mentions.roles.first();
    if (!role) {
      return message.reply("❌ منشن الرول");
    }

    if (role.position >= message.guild.me.roles.highest.position) {
      return message.reply("❌ الرول أعلى من البوت");
    }

    await GuildSettings.findOneAndUpdate(
      { guildId: message.guild.id },
      { verifiedRoleId: role.id },
      { upsert: true }
    );

    message.reply(`✅ تم تعيين رول التوثيق: **${role.name}**`);
  }
};
