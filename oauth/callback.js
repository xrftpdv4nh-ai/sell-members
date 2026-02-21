const fs = require("fs");
const path = require("path");
const usersPath = path.join(__dirname, "../database/users.json");

module.exports = (app, passport, client) => {
  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/" }),
    async (req, res) => {
      const user = req.user;

      let users = [];
      if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath));
      }

      const alreadySaved = users.find(u => u.id === user.id);

      if (!alreadySaved) {
        users.push({
          id: user.id,
          username: user.username,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken
        });

        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

        console.log("✅ User saved:", user.username);
      } else {
        console.log("ℹ️ User already exists:", user.username);
      }

      // رد للمستخدم
      res.send("✅ OAuth callback reached successfully");
    }
  );
};
