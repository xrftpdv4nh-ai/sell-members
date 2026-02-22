// oauth/callback.js
const User = require("../database/User");
const config = require("../config");

module.exports = (app, passport, client) => {
  app.get(
    "/callback",
    passport.authenticate("discord", {
      failureRedirect: "/failed",
      session: false
    }),
    async (req, res) => {
      try {
        if (!req.user || !req.user.id) {
          return res.status(400).send("❌ OAuth data invalid");
        }

        // ===== حفظ / تحديث المستخدم =====
        const user = await User.findOneAndUpdate(
          { discordId: req.user.id },
          {
            discordId: req.user.id,
            username: `${req.user.username}#${req.user.discriminator || "0000"}`,
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken
          },
          { upsert: true, new: true }
        );

        // ===== إضافة الرول =====
        const guild = await client.guilds
          .fetch(config.bot.guildId)
          .catch(() => null);

        if (!guild) throw new Error("Guild not found");

        const member = await guild.members
          .fetch(req.user.id)
          .catch(() => null);

        if (!member) throw new Error("User not in guild");

        const roleId = config.bot.verifiedRoleId;
        if (!roleId) throw new Error("Role ID not set");

        if (!member.roles.cache.has(roleId)) {
          await member.roles.add(roleId);
        }

        // ===== Log =====
        if (client.isReady()) {
          const log = await client.channels
            .fetch(config.logs.success)
            .catch(() => null);

          if (log) {
            log.send(
              `✅ **OAuth Verified**
👤 ${user.username}
🆔 ${user.discordId}
🎭 Role Added`
            );
          }
        }

        // ===== Success Page =====
        return res.send(`
          <html>
            <body style="font-family:sans-serif;text-align:center">
              <h2>✅ تم التوثيق بنجاح</h2>
              <p>الرول اتضاف تلقائيًا 🎉</p>
              <script>setTimeout(() => window.close(), 3000)</script>
            </body>
          </html>
        `);

      } catch (err) {
        console.error("OAuth Callback Error:", err.message);
        return res.send("❌ حصل خطأ أثناء التوثيق");
      }
    }
  );

  app.get("/failed", (req, res) => {
    res.send("❌ OAuth Failed");
  });
};
