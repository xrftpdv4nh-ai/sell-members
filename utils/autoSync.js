// utils/autoSync.js
const OAuthUser = require("../database/User");
const checkToken = require("./checkToken");

module.exports = async function autoSync(client, logChannelId) {
  console.log("🔄 Auto Sync Started...");

  const users = await OAuthUser.find();
  let removed = 0;

  for (const user of users) {
    const valid = await checkToken(user.accessToken);

    if (!valid) {
      await OAuthUser.deleteOne({ discordId: user.discordId });
      removed++;

      // Log
      if (logChannelId) {
        const ch = await client.channels.fetch(logChannelId).catch(() => null);
        if (ch) {
          ch.send(
            `❌ **OAuth Revoked**\n👤 ${user.username}\n🆔 ${user.discordId}`
          );
        }
      }
    }
  }

  console.log(`🧹 Auto Sync Done | Removed: ${removed}`);
};
