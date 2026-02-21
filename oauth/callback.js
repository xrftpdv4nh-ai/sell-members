const User = require("../database/User");
const config = require("../config");

module.exports = (app, passport, client) => {
  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/failed" }),
    async (req, res) => {
      try {
        // ===============================
        // 1) حفظ المستخدم في MongoDB
        // ===============================
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

        // ===============================
        // 2) إضافة الرول مباشرة
        // ===============================
        const guild = await client.guilds.fetch(config.bot.mainGuild);
        const member = await guild.members.fetch(req.user.id);

        const roleId = config.bot.verifiedRoleId;
        if (!roleId) {
          console.log("❌ verifiedRoleId غير متعيّن");
        } else {
          if (!member.roles.cache.has(roleId)) {
            await member.roles.add(roleId);
            console.log("✅ Role added to", member.user.tag);
          }
        }

        // ===============================
        // 3) لوج
        // ===============================
        try {
          const ch = await client.channels.fetch(config.logs.success);
          if (ch) {
            ch.send(
              `✅ **Verified Successfully**\n👤 ${user.username}\n🆔 ${user.discordId}`
            );
          }
        } catch {}

        // ===============================
        // 4) رد للمستخدم
        // ===============================
        res.send(`
          <h2>✅ تم التوثيق بنجاح</h2>
          <p>ارجع للسيرفر، الرول اتضاف تلقائيًا.</p>
        `);

      } catch (err) {
        console.error("❌ CALLBACK ERROR:", err);
        res.send("❌ Error during verification");
      }
    }
  );

  app.get("/failed", (req, res) => {
    res.send("❌ OAuth Failed");
  });
};
