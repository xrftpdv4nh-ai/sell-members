const fs = require("fs");
const path = require("path");
const config = require("../config");

const usersPath = path.join(__dirname, "..", "database", "users.json");

module.exports = (app, passport, client) => {

  app.get(
    config.oauth.callbackURL,
    passport.authenticate("discord", {
      failureRedirect: "/verify-failed"
    }),
    async (req, res) => {
      try {
        const user = req.user;

        if (!user || !user.id) {
          return res.send("❌ OAuth failed");
        }

        // اقرأ الداتا
        let users = [];
        if (fs.existsSync(usersPath)) {
          users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
        }

        // تحقق هل المستخدم موجود
        const exists = users.find(u => u.id === user.id);

        if (!exists) {
          users.push({
            id: user.id,
            username: `${user.username}#${user.discriminator}`,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            verifiedAt: new Date().toISOString()
          });

          fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
        }

        // رجّع صفحة نجاح
        res.send(`
          <h2>✅ تم التحقق بنجاح</h2>
          <p>يمكنك الرجوع إلى السيرفر الآن</p>
        `);

      } catch (err) {
        console.error(err);
        res.status(500).send("❌ Internal Error");
      }
    }
  );
};
