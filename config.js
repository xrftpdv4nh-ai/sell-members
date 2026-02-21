module.exports = {
  bot: {
    token: process.env.BOT_TOKEN,
    clientId: "1279423025980112988",
    clientSecret: "m9CmE9FRoOFdOGyJRniktK-9E3vfirKq",
    guildId: "1275275223431647355",
    prefix: "+",
    owners: ["1035345058561540127"],

    inviteBotUrl:
      "https://discord.com/oauth2/authorize?client_id=CLIENT_ID_HERE&permissions=8&scope=bot%20applications.commands"
  },

  oauth: {
    loginURL: "/login",
    callbackURL: "/callback",
    scopes: ["identify", "guilds", "guilds.join"]
  },

  logs: {
    success: "1474150012228210868",
    failed: "1474150017810829312"
  },

  members: {
    delay: 5000 // 5 ثواني بين كل عضو
  }
};
