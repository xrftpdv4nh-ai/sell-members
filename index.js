// ===== REQUIRE =====
const { Client, Intents } = require("discord.js");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const config = require("./config");

const OAuthUser = require("./database/User");
const checkToken = require("./utils/checkToken");
const addMember = require("./utils/addMember");

// ===== DISCORD CLIENT =====
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

// ===== EXPRESS APP =====
const app = express();
app.disable("x-powered-by");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ===== SESSION =====
app.use(
  session({
    name: "oauth.sid",
    secret: process.env.SESSION_SECRET || "TEMP_SECRET",
    resave: false,
    saveUninitialized: false
  })
);

// ===== PASSPORT =====
app.use(passport.initialize());
app.use(passport.session());

// ===== MONGODB =====
(async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🟢 MongoDB Connected");
  } catch (err) {
    console.error("🔴 MongoDB Error:", err.message);
  }
})();

// ===== WEB SERVER =====
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ OAuth Bot Running"));
app.listen(PORT, () =>
  console.log("🌐 Web server running on port", PORT)
);

// ===== LOAD OAUTH =====
require("./oauth/passport")(passport);
require("./oauth/verify")(app, passport);
require("./oauth/callback")(app, passport, client);

// ===== AUTO SYNC FUNCTION =====
async function autoSync(log = true) {
  const users = await OAuthUser.find();
  let removed = 0;

  for (const user of users) {
    const valid = await checkToken(user.accessToken);

    if (!valid) {
      await OAuthUser.deleteOne({ discordId: user.discordId });
      removed++;

      if (log) {
        const ch = await client.channels
          .fetch(config.logs.revoked)
          .catch(() => null);

        if (ch) {
          ch.send(
            `❌ **OAuth Revoked**\n👤 ${user.username}\n🆔 ${user.discordId}`
          );
        }
      }
    }
  }

  return removed;
}

// ===== COMMANDS =====
client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.bot.prefix)) return;
  if (!config.bot.owners.includes(message.author.id)) return;

  const args = message.content
    .slice(config.bot.prefix.length)
    .trim()
    .split(/ +/);

  const cmd = args.shift().toLowerCase();

  // ===== VERIFY PANEL =====
  if (cmd === "panel") {
    const panel = require("./panels/verifyPanel");
    return panel.run(client, message);
  }

  // ===== SET VERIFIED ROLE =====
if (cmd === "setrole") {
  const role = message.mentions.roles.first();

  if (!role) {
    return message.reply("❌ منشن الرول صح\nمثال: `+setrole @Verified`");
  }

  // حفظ الرول (في runtime – نقدر نخزنه DB بعدين)
  config.bot.verifiedRoleId = role.id;

  return message.channel.send(
    `✅ تم تعيين رول التوثيق: **${role.name}**`
  );
}
// ===== SYNC OAUTH USERS =====
if (cmd === "sync") {
  await message.channel.send("🔄 **جاري مزامنة مستخدمي OAuth...**");

  const users = await OAuthUser.find();
  const totalBefore = users.length;

  let removed = 0;
  let valid = 0;

  for (const user of users) {
    const isValid = await checkToken(user.accessToken);

    if (!isValid) {
      await OAuthUser.deleteOne({ discordId: user.discordId });
      removed++;

      // لوج الخروج
      try {
        const ch = await client.channels.fetch(config.logs.revoked);
        if (ch) {
          ch.send(
            `❌ **OAuth Revoked**\n👤 ${user.username}\n🆔 ${user.discordId}`
          );
        }
      } catch {}
    } else {
      valid++;
    }
  }

  const totalAfter = await OAuthUser.countDocuments();

  return message.channel.send(
    `✅ **Sync Finished Successfully**
    
👥 قبل المزامنة: **${totalBefore}**
🟢 مستخدمين صالحين: **${valid}**
🔴 تم حذفهم: **${removed}**
📦 المتبقي في الداتا: **${totalAfter}**`
  );
}

  // ===== ADD MEMBERS WITH DELAY =====
  if (cmd === "addall") {
    const guildId = args[0];
    if (!guildId) {
      return message.reply("❌ حط ID السيرفر");
    }

    const users = await OAuthUser.find();
    let added = 0;

    message.reply(`⏳ Adding ${users.length} users (slow mode)...`);

    for (const user of users) {
      const ok = await addMember(
        guildId,
        user,
        process.env.BOT_TOKEN
      );

      if (ok) added++;

      // ⏱️ Delay 5 ثواني (آمن)
      await new Promise(res => setTimeout(res, 5000));
    }

    message.reply(`✅ Added ${added}/${users.length} members`);
  }
});

// ===== READY =====
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  // ⏱️ Auto Sync كل 15 دقيقة
  setInterval(() => {
    autoSync(true);
  }, 1000 * 60 * 15);
});

// ===== LOGIN =====
client.login(process.env.BOT_TOKEN);
