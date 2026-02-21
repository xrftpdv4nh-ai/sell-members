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
        }

        // ===== إضافة رول تلقائي =====
        try {
          const guild = await client.guilds.fetch(config.bot.guildId);
          const member = await guild.members.fetch(req.user.id);

          const settings = await GuildSettings.findOne({
            guildId: guild.id
          });

          if (settings?.verifiedRole) {
            const role = guild.roles.cache.get(settings.verifiedRole);

            if (role && member && !member.roles.cache.has(role.id)) {
              await member.roles.add(role);
            }
          }
        } catch (e) {
          console.log("⚠️ Role add skipped:", e.message);
        }

        // ===== لوج نجاح =====
        try {
          const ch = await client.channels.fetch(config.logs.success);
          if (ch) {
            ch.send(
              `✅ **OAuth Verified**
👤 ${user.username}
🆔 ${user.discordId}`
            );
          }
        } catch {}

        res.send(`
          <h2>✅ تم التوثيق بنجاح</h2>
          <p>تقدر تقفل الصفحة.</p>
        `);

      } catch (err) {
        console.error("❌ OAuth Error:", err);
        res.send("❌ Error during OAuth");
      }
    }
  );

  app.get("/failed", (req, res) => {
    res.send("❌ OAuth Failed");
  });
};
