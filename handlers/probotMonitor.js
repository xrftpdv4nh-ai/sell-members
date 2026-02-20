const config = require("../config");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {

    // لازم يكون ProBot
    if (message.author.id !== config.probot.id) return;

    // لازم Embed
    if (!message.embeds || !message.embeds.length) return;

    const embed = message.embeds[0];
    if (!embed.description) return;

    // مثال:
    // 💰 | kg_j, has transferred $9 to @Lamiaa.

    // المبلغ
    const amountMatch = embed.description.match(/\$(\d+)/);
    if (!amountMatch) return;

    const credits = parseInt(amountMatch[1]);
    if (!credits || credits <= 0) return;

    // المنشن (المستلم)
    const mentionMatch = embed.description.match(/<@!?(\d+)>/);
    if (!mentionMatch) return;

    const userId = mentionMatch[1];
    const member = await message.guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    const data = global.getData();
    if (!data.coinPrice || data.coinPrice <= 0) return;

    // نحسب الكوينز (حتى لو في ضريبة)
    const coins = Math.round(credits / data.coinPrice);
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
