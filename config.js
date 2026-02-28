module.exports = {
  bot: {
    // ===== BOT =====
    token: process.env.BOT_TOKEN, // ⬅️ توكن البوت من Railway
    clientId: "1279423025980112988",
    clientSecret: "m9CmE9FRoOFdOGyJRniktK-9E3vfirKq", // ⚠️ يفضل تخليه ENV بعدين

    prefix: "+",
    owners: ["1390605342043406446"],

    // ===== السيرفر الأساسي =====
    guildId: "1291946536019693599", // ✅ ID السيرفر اللي الرول هيتضاف فيه

    // ===== رول التوثيق =====
    verifiedRoleId: "1474906180047601917",
    // ⬅️ هيتحدد بالأمر: +setrole @Verified

    // ===== زر إدخال البوت =====
    inviteBotUrl:
      "https://discord.com/oauth2/authorize?client_id=1279423025980112988&permissions=8&scope=bot%20applications.commands",

    // ===== زر اثبت نفسك (OAuth Verify) =====
    TheLinkVerfy:
      "https://discord.com/oauth2/authorize?client_id=1279423025980112988&response_type=code&redirect_uri=https%3A%2F%2Fsell-members-production.up.railway.app%2Fcallback&scope=identify+guilds+guilds.join"
  },

  // ===== OAUTH =====
  oauth: {
    loginURL: "/login",
    callbackURL: "https://sell-members-production.up.railway.app/callback",
    scopes: ["identify", "guilds", "guilds.join"]
  },

  // ===== LOG CHANNELS =====
  logs: {
    success: "1474150012228210868", // oauth success
    failed: "1474150017810829312",  // oauth failed
  },

  // ===== MEMBERS SETTINGS =====
  members: {
    delay: 5000 // 5 ثواني بين كل عضو
  }
};
