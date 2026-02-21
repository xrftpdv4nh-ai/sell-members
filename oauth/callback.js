const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = (app, passport, client) => {
  app.get(
    "/callback",
    passport.authenticate("discord", {
      failureRedirect: "/failed"
    }),
    (req, res) => {
      try {
        const dbPath = path.join(__dirname, "..", "database", "users.json");

        let users = [];
        if (fs.existsSync(dbPath)) {
          users = JSON.parse(fs.readFileSync(dbPath));
        }

        const exists = users.find(u => u.id === req.user.id);
        if (!exists) {
          users.push({
            id: req.user.id,
            username: req.user.username,
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken,
            date: Date.now()
          });

          fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

          console.log(`✅ OAuth saved: ${req.user.username} (${req.user.id})`);

          const logChannel = client.channels.cache.get(config.logs.success);
          if (logChannel) {
            logChannel.send(
              `✅ **OAuth Success**\n👤 ${req.user.username}\n🆔 ${req.user.id}`
            );
          }
        } else {
          console.log(`ℹ️ OAuth already exists: ${req.user.username}`);
        }

        res.send("✅ OAuth callback reached successfully");
      } catch (err) {
        console.error("❌ OAuth callback error:", err);
        res.send("❌ Error during OAuth");
      }
    }
  );

  app.get("/failed", (req, res) => {
    res.send("❌ OAuth Failed");
  });
};
