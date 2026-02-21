const User = require("../database/User");
const config = require("../config");

module.exports = (app, passport, client) => {
  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/failed" }),
    async (req, res) => {
      try {
        let user = await User.findOne({ discordId: req.user.id });

        if (!user) {
          user = await User.create({
            discordId: req.user.id,
            username: `${req.user.username}#${req.user.discriminator || "0000"}`,
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken
          });

          console.log("✅ Mongo OAuth Saved:", user.username);

          // لوج ديسكورد
          try {
            const ch = await client.channels.fetch(config.logs.success);
            if (ch) {
              ch.send(
                `✅ **OAuth Success**\n👤 ${user.username}\n🆔 ${user.discordId}`
              );
            }
          } catch {}
        }

        res.send(`
          <h2>✅ OAuth Successful</h2>
          <p>You can close this page.</p>
        `);

      } catch (err) {
        console.error("❌ OAuth Mongo Error:", err);
        res.send("❌ Error saving OAuth");
      }
    }
  );

  app.get("/failed", (req, res) => {
    res.send("❌ OAuth Failed");
  });
};
