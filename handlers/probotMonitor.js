const config = require("../config");

module.exports = async (client, message) => {
  try {
    if (message.author.id !== config.probot.id) return;
    if (!message.content.includes("has transferred")) return;

    const pending = global.pendingPurchases.get(message.channel.id);
    if (!pending) return;

    const data = global.getData();

    if (!data.users[pending.userId]) {
      data.users[pending.userId] = { coins: 0 };
    }

    data.users[pending.userId].coins += pending.coins;
    global.saveData(data);

    global.pendingPurchases.delete(message.channel.id);

    await message.channel.send(
`✅ **تم تأكيد الدفع**

👤 <@${pending.userId}>
🪙 تمت إضافة **${pending.coins} كوين**
📦 رصيدك الحالي:
**${data.users[pending.userId].coins} كوين**`
    );

  } catch (err) {
    console.error("❌ ProBot Monitor Error:", err);
  }
};
