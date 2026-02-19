const config = require("../config");

module.exports = {
  name: "help",
  run: async (client, message) => {
    message.reply(
      `📖 **قائمة الأوامر:**\n\n` +
      `\`${config.prefix}ping\` ➜ اختبار البوت\n` +
      `\`${config.prefix}panel\` ➜ لوحة شراء الأعضاء\n` +
      `\`${config.prefix}help\` ➜ عرض الأوامر`
    );
  }
};
