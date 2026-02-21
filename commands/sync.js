const OAuthUser = require("../database/User");
const checkToken = require("../utils/checkToken");
const config = require("../config");

module.exports = {
  name: "sync",
  async run(client, message) {
    await message.reply("🔄 جاري مزامنة مستخدمي OAuth...");

    const users = await OAuthUser.find();
    const totalBefore = users.length;

    let removed = 0;
    let valid = 0;

    for (const user of users) {
      const isValid = await checkToken(user.accessToken);

      if (!isValid) {
        await OAuthUser.deleteOne({ discordId: user.discordId });
        removed++;

        // log revoked
        try {
          const ch = await client.channels.fetch(config.logs.revoked);
          if (ch) {
            ch.send(
              `❌ **OAuth Revoked**\n👤 ${user.username}\n🆔 ${user.discordId}`
            );
          }
        } catch {}
      } else {
        valid++;
      }
    }

    const totalAfter = await OAuthUser.countDocuments();

    return message.channel.send(
      `✅ **Sync Finished**
      
👥 قبل: **${totalBefore}**
🟢 صالحين: **${valid}**
🔴 اتحذفوا: **${removed}**
📦 المتبقي: **${totalAfter}**`
    );
  }
};
