module.exports = async (message) => {
  if (message.author.bot) return;
  if (message.content !== "حذف") return;

  if (!message.member.permissions.has("ADMINISTRATOR")) {
    return message.reply("❌ الأمر ده للأدمن فقط");
  }

  if (!message.channel.name.startsWith("ticket-")) {
    return message.reply("❌ الأمر ده يشتغل داخل التكت فقط");
  }

  await message.reply("🗑️ سيتم حذف التكت بعد 3 ثواني...");
  setTimeout(() => {
    message.channel.delete().catch(() => {});
  }, 3000);
};
