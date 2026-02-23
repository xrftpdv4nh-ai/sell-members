module.exports = {
  name: "deleteallchannels",
  async run(client, message) {
    // أمان: Owners فقط
    if (!message.guild) return;
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply("❌ لازم تكون Admin");
    }

    await message.reply("⚠️ **جاري حذف جميع القنوات...**");

    const channels = message.guild.channels.cache;

    let deleted = 0;
    let failed = 0;

    for (const channel of channels.values()) {
      try {
        await channel.delete("Delete all channels command");
        deleted++;
      } catch (err) {
        failed++;
      }
    }

    // لو مفيش ولا قناة يرد فيها
    try {
      await message.author.send(
        `✅ تم حذف القنوات\n🗑️ المحذوف: ${deleted}\n❌ فشل: ${failed}`
      );
    } catch {}
  }
};
