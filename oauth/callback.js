const User = require("../database/User");
const GuildSettings = require("../database/Settings");
const config = require("../config");

module.exports = (app, passport, client) => {
  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/failed" }),
    async (req, res) => {
      try {
        // ===== حفظ المستخدم =====
        let user = await User.findOne({ discordId: req.user.id });

        if (!user) {
          user = await User.create({
            discordId: req.user.id,
            username: `${req.user.username}#${req.user.discriminator || "0000"}`,
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken
          });
        } else {
          user.accessToken = req.user.accessToken;
          user.refreshToken = req.user.refreshToken;
          await user.save();
        }

        // ===== إضافة الرول =====
        const guild = await client.guilds.fetch(config.bot.guildId);
        const member = await guild.members.fetch(req.user.id).catch(() => null);

        if (member) {
          const settings = await GuildSettings.findOne({
            guildId: guild.id
          });

          if (settings?.verifiedRole) {
            const role = guild.roles.cache.get(settings.verifiedRole);

            if (role && !member.roles.cache.has(role.id)) {
              await member.roles.add(role.id);
            }
          }
        }

        // ===== لوج =====
        try {
          const ch = await client.channels.fetch(config.logs.success);
          if (ch) {
            ch.send(
              `✅ **OAuth Verified**\n👤 ${user.username}\n🆔 ${user.discordId}`
            );
          }
        } catch {}

        res.send(`
          <h2>✅ تم توثيق حسابك بنجاح</h2>
          <p>ارجع للسيرفر، الرول اتضاف تلقائيًا</p>
        `);

      } catch (err) {
        console.error("OAuth Callback Error:", err);
        res.send("❌ حصل خطأ أثناء التوثيق");
      }
    }
  );

  app.get("/failed", (req, res) => {
    res.send("❌ فشل التوثيق");
  });
};
