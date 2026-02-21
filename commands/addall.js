const OAuthUser = require("../database/User");
const addMember = require("../utils/addMember");

module.exports = {
  name: "addall",
  async run(client, message, args) {
    const guildId = args[0];
    if (!guildId) {
      return message.reply("❌ استخدم: `+addall SERVER_ID`");
    }

    const users = await OAuthUser.find();
    let added = 0;

    await message.reply(
      `⏳ جاري إضافة ${users.length} عضو (Slow Mode آمن)...`
    );

    for (const user of users) {
      const ok = await addMember(
        guildId,
        user,
        process.env.BOT_TOKEN
      );

      if (ok) added++;

      // ⏱️ Delay 5 ثواني (مهم لتجنب البان)
      await new Promise(res => setTimeout(res, 5000));
    }

    return message.channel.send(
      `✅ تم إدخال **${added}/${users.length}** عضو`
    );
  }
};
