const User = require("../database/User");
const GuildSettings = require("../database/Settings");
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
        // =============================
        // 1️⃣ تأكيد بيانات OAuth
        // =============================
        if (!req.user || !req.user.id) {
          return res.status(400).send("❌ Invalid OAuth data");
        }

        // =============================
        // 2️⃣ حفظ / تحديث المستخدم
        // =============================
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

        // =============================
        // 3️⃣ إضافة الرول تلقائيًا
        // =============================
        try {
          if (client.isReady()) {
            const guild = await client.guilds
              .fetch(config.bot.guildId)
              .catch(() => null);

            if (guild) {
              const member = await guild.members
                .fetch(req.user.id)
                .catch(() => null);

              if (member) {
                const settings = await GuildSettings.findOne({
                  guildId: guild.id
                });

                if (settings && settings.verifiedRoleId) {
                  if (!member.roles.cache.has(settings.verifiedRoleId)) {
                    await member.roles.add(settings.verifiedRoleId);
                  }
                }
              }
            }
          }
        } catch (e) {
          console.log("⚠️ Role add skipped:", e.message);
        }

        // =============================
        // 4️⃣ لوج النجاح
        // =============================
        if (client.isReady()) {
          const ch = await client.channels
            .fetch(config.logs.success)
            .catch(() => null);

          if (ch) {
            ch.send(
              `✅ **OAuth Success**\n👤 ${user.username}\n🆔 ${user.discordId}`
            );
          }
        }

        // =============================
        // 5️⃣ صفحة نجاح
        // =============================
        return res.send(`
          <html>
            <head>
              <title>Verified</title>
            </head>
            <body style="text-align:center;font-family:sans-serif">
              <h2>✅ تم التوثيق بنجاح</h2>
              <p>ارجع للسيرفر وهتاخد الرول تلقائيًا.</p>
              <script>
                setTimeout(() => window.close(), 3000);
              </script>
            </body>
          </html>
        `);

      } catch (err) {
        console.error("❌ Callback Error:", err);
        return res.status(500).send("❌ Error during verification");
      }
    }
  );

  app.get("/failed", (req, res) => {
    res.status(401).send("❌ OAuth Failed");
  });
};
