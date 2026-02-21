const User = require("../database/User");
const config = require("../config");

module.exports = (app, passport, client) => {
  app.get(
    "/callback",
    passport.authenticate("discord", {
      failureRedirect: "/failed",
      session: true
    }),
    async (req, res) => {
      // حماية لو req.user مش موجود
      if (!req.user || !req.user.id) {
        return res.status(400).send("❌ Invalid OAuth session");
      }

      try {
        // ===== FIND OR CREATE USER =====
        let user = await User.findOne({ discordId: req.user.id });

        if (!user) {
          user = await User.create({
            discordId: req.user.id,
            username: `${req.user.username}#${req.user.discriminator || "0000"}`,
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken
          });

          console.log("✅ Mongo OAuth Saved:", user.username);

          // ===== DISCORD LOG (SAFE) =====
          try {
            if (client.isReady()) {
              const logChannel = await client.channels.fetch(
                config.logs.success
              ).catch(() => null);

              if (logChannel) {
                await logChannel.send(
                  `✅ **OAuth Success**\n👤 ${user.username}\n🆔 ${user.discordId}`
                );
              }
            }
          } catch (logErr) {
            console.log("⚠️ OAuth log failed (ignored)");
          }

        } else {
          console.log("ℹ️ OAuth already exists:", user.username);
        }

        // ===== SUCCESS PAGE =====
        return res.status(200).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>OAuth Success</title>
            <meta charset="utf-8"/>
          </head>
          <body style="font-family:Arial;text-align:center;margin-top:50px">
            <h2>✅ OAuth Successful</h2>
            <p>You can safely close this page.</p>
          </body>
          </html>
        `);

      } catch (err) {
        console.error("❌ OAuth Mongo Error:", err);

        return res.status(500).send(`
          <h2>❌ Error</h2>
          <p>Something went wrong while saving OAuth.</p>
        `);
      }
    }
  );

  // ===== FAILED =====
  app.get("/failed", (req, res) => {
    res.status(401).send("❌ OAuth Failed");
  });
};
