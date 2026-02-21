const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = (app, passport, client) => {
  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/failed" }),
    async (req, res) => {
      const users = JSON.parse(
        fs.readFileSync("./database/users.json", "utf8")
      );

      if (users.find(u => u.id === req.user.id)) {
        client.channels.cache
          .get(config.logs.failed)
          ?.send(`❌ تكرار OAuth: ${req.user.username}`);
        return res.send("Already verified");
      }

      users.push({
        id: req.user.id,
        accessToken: req.user.accessToken,
        refreshToken: req.user.refreshToken
      });

      fs.writeFileSync("./database/users.json", JSON.stringify(users, null, 2));

      client.channels.cache
        .get(config.logs.success)
        ?.send(`✅ OAuth جديد: <@${req.user.id}>`);

      res.send("Verified Successfully");
    }
  );
};
