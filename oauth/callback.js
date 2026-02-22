const User = require("../database/User");
const config = require("../config");

module.exports = (app, passport, client) => {
  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/failed" }),
    async (req, res) => {
      try {
        if (!client.isReady()) {
          return res.send("⏳ Bot is starting, try again in a few seconds");
        }

        // حفظ المستخدم
        let user = await User.findOneAndUpdate(
          { discordId: req.user.id },
          {
            discordId: req.user.id,
            username: `${req.user.username}#${req.user.discriminator || "0000"}`,
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken
          },
          { upsert: true, new: true }
        );

        // إضافة الرول
        const guild = await client.guilds.fetch(config.bot.mainGuild);
        const member = await guild.members.fetch(req.user.id);

        if (config.bot.verifiedRoleId) {
          await member.roles.add(config.bot.verifiedRoleId);
        }

        res.send(`
          <h2>✅ تم التوثيق بنجاح</h2>
          <p>ارجع للسيرفر، الرول اتضاف.</p>
        `);

      } catch (err) {
        console.error("❌ CALLBACK ERROR:", err);
        res.send("❌ Error during verification");
      }
    }
  );

  app.get("/failed", (req, res) => {
    res.send("❌ OAuth Failed");
  });
};
