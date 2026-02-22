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
        // 🔴 تأكيد إن Passport رجّع user
        if (!req.user || !req.user.id) {
          return res.status(400).send("❌ Invalid OAuth data");
        }

        // 🔎 شوف المستخدم موجود ولا لأ
        let user = await User.findOne({ discordId: req.user.id });

        if (!user) {
          user = await User.create({
            discordId: req.user.id,
            username: `${req.user.username}#${req.user.discriminator || "0000"}`,
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken
          });
        } else {
          // تحديث التوكن لو المستخدم موجود
          user.accessToken = req.user.accessToken;
          user.refreshToken = req.user.refreshToken;
          await user.save();
        }

        // ✅ Log نجاح (من غير كراش)
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

        // ✅ صفحة نجاح بسيطة
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
