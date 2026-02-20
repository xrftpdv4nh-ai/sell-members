module.exports = async (client, message) => {
  try {
    // نتأكد إنها رسالة ProBot
    if (message.author.id !== "282859044593598464") return;
    if (!message.content.includes("has transferred")) return;

    // مفيش طلبات شراء معلقة
    if (global.pendingPurchases.size === 0) return;

    // نجيب آخر عملية شراء
    const [userId, purchase] = Array.from(global.pendingPurchases.entries()).pop();

    const { coins, price } = purchase;

    // نضيف الكوينز
    const data = global.getData();

    if (!data.users[userId]) {
      data.users[userId] = { coins: 0 };
    }

    data.users[userId].coins += coins;
    global.saveData(data);

    // نجيب العضو
    const member = await message.guild.members.fetch(userId).catch(() => null);

    // نأكد العملية
    message.channel.send(
`✅ **تم تأكيد عملية الشراء**

👤 ${member ? member : `<@${userId}>`}
🪙 تمت إضافة **${coins} كوين**
💰 المبلغ المدفوع: **${price} كريدت**

📦 رصيدك الحالي:
**${data.users[userId].coins} كوين**`
    );

    // نمسح العملية
    global.pendingPurchases.delete(userId);

  } catch (err) {
    console.error("❌ ProBot Monitor Error:", err);
  }
};
