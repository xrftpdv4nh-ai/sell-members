module.exports = {
  name: "verifymsg",
  async run(client, message) {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply("❌ الأمر ده للأدمن فقط");
    }

    const msg = await message.channel.send(
      "🔐 **توثيق الحساب**\n\n" +
      "1️⃣ اضغط على زر (اثبت نفسك)\n" +
      "2️⃣ بعد ما تخلص، اضغط على ✅ هنا\n\n" +
      "⚠️ أي شخص مش موثّق مش هياخد الرول"
    );

    await msg.react("✅");

    message.reply("✅ تم إنشاء رسالة التوثيق");
  }
};
