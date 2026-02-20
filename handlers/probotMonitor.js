const config = require("../config");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {

    // لازم يكون بروبوت
    if (message.author.id !== config.probot.id) return;

    // لازم Embed
    if (!message.embeds || message.embeds.length === 0) return;

    const embed = message.embeds[0];
    if (!embed.description) return;

    // لازم يكون تحويل كريدت
    if (!embed.description.includes("Credit")) return;
    if (!embed.description.includes(config.probot.creditAccountId)) return;

    /*
      مثال رسالة بروبوت:
      💸 | Lamiaa has transferred `200` Credit to <@123456>
    */

    const creditMatch = embed.description.match(/`(\d+)`/);
    if (!creditMatch) return;

    const credits = parseInt(creditMatch[1]);
    if (!credits || credits <= 0) return;

    const userMatch = embed.description.match(/\|\s(.+?)\shas transferred/);
    if (!userMatch) return;

    const username = userMatch[1];

    const member = message.guild.members.cache.find(
      m => m.user.username === username
    );
    if (!member) return;

    const data = global.getData();
    if (!data.coinPrice || data.coinPrice <= 0) return;

    const coins = Math.floor(credits / data.coinPrice);
    if (coins <= 0) return;

    if (!data.users[member.id]) {
      data.users[member.id] = { coins: 0 };
    }

    data.users[member.id].coins += coins;
    global.saveData(data);

    message.channel.send(
`✅ **تم استلام التحويل بنجاح**

👤 ${member}
💰 ${credits} كريدت
🪙 تمت إضافة **${coins} كوين**

📦 رصيدك الحالي:
**${data.users[member.id].coins} كوين**`
    );
  });
};
