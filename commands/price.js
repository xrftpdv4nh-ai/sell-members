module.exports = {
  name: "price",

  run: async (client, message, args) => {
    // أدمن فقط
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply("❌ الأمر ده للأدمن فقط");
    }

    const amount = Number(args[0]);

    if (!amount || amount <= 0) {
      return message.reply("❌ استخدم الأمر كده:\n`+price 5`");
    }

    const data = global.getData();
    data.coinPrice = amount;
    global.saveData(data);

    message.reply(
      `✅ تم تحديد سعر الكوين\n💰 **1 Coin = ${amount} Credit**`
    );
  }
};
