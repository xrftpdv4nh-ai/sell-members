const config = require("../config");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {

    // لازم يكون ProBot
    if (message.author.id !== config.probot.id) return;

    // لازم Embed
    if (!message.embeds.length) return;
    const embed = message.embeds[0];
    if (!embed.description) return;

    // نطلع المبلغ
    const amountMatch = embed.description.match(/\$(\d+)/);
    if (!amountMatch) return;

    const credits = parseInt(amountMatch[1]);
    if (!credits || credits <= 0) return;

    // نجيب صاحب التكت (أول شخص مش بوت)
    const messages = await message.channel.messages.fetch({ limit: 20 });
    const ticketOwner = messages.find(
      m => !m.author.bot && m.content
    )?.author;

    if (!ticketOwner) return;

    const data = global.getData();
    if (!data.coinPrice || data.coinPrice <= 0) return;

    // نحسب الكوينز (حتى مع الضريبة)
    const coins = Math.round(credits / data.coinPrice);
    if (coins <= 0) return;

    if (!data.users[ticketOwner.id]) {
      data.users[ticketOwner.id] = { coins: 0 };
    }

    data.users[ticketOwner.id].coins += coins;
    global.saveData(data);

    message.channel.send(
`✅ **تم استلام التحويل بنجاح**

👤 ${ticketOwner}
💰 ${credits} كريدت
🪙 تمت إضافة **${coins} كوين**

📦 رصيدك الحالي:
**${data.users[ticketOwner.id].coins} كوين**`
    );
  });
};
