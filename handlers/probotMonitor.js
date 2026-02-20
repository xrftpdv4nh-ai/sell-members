module.exports = async (message, config, getData, saveData) => {
  try {
    // نتأكد إن الرسالة من ProBot
    if (message.author.id !== config.probot.id) return;

    // صيغة تحويل ProBot
    // Example:
    // 💸 | Ahmed, has transferred `100` credits to <@ID>
    if (!message.content.includes("has transferred")) return;
    if (!message.content.includes(config.probot.creditAccountId)) return;

    // استخراج عدد الكريدت
    const creditMatch = message.content.match(/`(\d+)`/);
    if (!creditMatch) return;

    const credits = parseInt(creditMatch[1]);
    if (credits <= 0) return;

    // استخراج اسم الشخص
    const userMatch = message.content.match(/\| (.*?), has transferred/);
    if (!userMatch) return;

    const username = userMatch[1].trim();

    const member = message.guild.members.cache.find(
      m => m.user.username === username
    );
    if (!member) return;

    const data = getData();
    if (!data.coinPrice || data.coinPrice <= 0) return;

    const coins = Math.floor(credits / data.coinPrice);
    if (coins <= 0) return;

    if (!data.users[member.id]) {
      data.users[member.id] = { coins: 0 };
    }

    data.users[member.id].coins += coins;
    saveData(data);

    message.channel.send(
`✅ **تم استلام التحويل بنجاح**

👤 ${member}
💰 ${credits} كريدت
🪙 ${coins} كوين

📦 رصيدك الحالي:
**${data.users[member.id].coins} كوين**`
    );

  } catch (err) {
    console.error("❌ ProBot Monitor Error:", err);
  }
};
