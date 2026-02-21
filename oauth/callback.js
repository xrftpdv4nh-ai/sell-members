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
        const dbDir = path.join(__dirname, "..", "database");
        const dbPath = path.join(dbDir, "users.json");

        // ✅ تأكيد وجود فولدر database
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }

        // ✅ تأكيد وجود ملف users.json
        if (!fs.existsSync(dbPath)) {
          fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
        }

        // ✅ قراءة المستخدمين
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

          // ✅ كتابة المستخدم
          fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

          console.log(
            `✅ OAuth SAVED -> ${newUser.username} (${newUser.id}) | Total: ${users.length}`
          );

          // ✅ إرسال لوج في ديسكورد (fetch عشان الـ cache)
          try {
            const logChannel = await client.channels.fetch(
              config.logs.success
            );

            if (logChannel) {
              await logChannel.send(
                `✅ **OAuth Success**\n` +
                `👤 ${newUser.username}\n` +
                `🆔 ${newUser.id}\n` +
                `📦 Total Stored: ${users.length}`
              );
            }
          } catch (e) {
            console.log("⚠️ Log channel not reachable or bot missing perms");
          }
        } else {
          console.log(
            `ℹ️ OAuth already exists -> ${req.user.username} (${req.user.id})`
          );
        }

        // ✅ صفحة نجاح واضحة
        res.send(`
          <html>
            <body style="font-family: Arial; text-align:center; margin-top:50px;">
              <h2>✅ OAuth Successful</h2>
              <p>You can now close this page.</p>
              <p>Total stored users (runtime): <b>${users.length}</b></p>
            </body>
          </html>
        `);
      } catch (err) {
        console.error("❌ OAuth callback error:", err);
        res.status(500).send("❌ Error during OAuth callback");
      }
    }
  );

  app.get("/failed", (req, res) => {
    res.send("❌ OAuth Failed");
  });
};
