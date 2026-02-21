const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = (app, passport, client) => {
  app.get(
    "/callback",
    passport.authenticate("discord", {
      failureRedirect: "/failed"
    }),
    async (req, res) => {
      try {
        const dbPath = path.join(__dirname, "..", "database", "users.json");

        // تأكيد وجود الملف
        if (!fs.existsSync(dbPath)) {
          fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
        }

        // قراءة المستخدمين
        let users = JSON.parse(fs.readFileSync(dbPath, "utf8"));

        const exists = users.find(u => u.id === req.user.id);

        if (!exists) {
          const newUser = {
            id: req.user.id,
            username: `${req.user.username}#${req.user.discriminator || "0000"}`,
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken,
            date: new Date().toISOString()
          };

          users.push(newUser);
          fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

          console.log(`✅ SAVED OAuth: ${newUser.username} (${newUser.id})`);

          // إرسال لوج (بأمان)
          try {
            const logChannel = await client.channels.fetch(config.logs.success);
            if (logChannel) {
              logChannel.send(
                `✅ **OAuth Success**\n👤 ${newUser.username}\n🆔 ${newUser.id}\n📦 Total: ${users.length}`
              );
            }
          } catch (e) {
            console.log("⚠️ Log channel not reachable");
          }

        } else {
          console.log(`ℹ️ OAuth already exists: ${req.user.username}`);
        }

        // صفحة نجاح واضحة
        res.send(`
          <h2>✅ OAuth Successful</h2>
          <p>You can now close this page.</p>
          <p>Total stored users: <b>${users.length}</b></p>
        `);

      } catch (err) {
        console.error("❌ OAuth callback error:", err);
        res.send("❌ Error during OAuth callback");
      }
    }
  );

  app.get("/failed", (req, res) => {
    res.send("❌ OAuth Failed");
  });
};
