module.exports = {
  name: "help",
  execute(message) {
    message.reply(
      `**الأوامر المتاحة:**\n` +
      `+panel\n` +
      `+ping\n` +
      `+help`
    );
  }
};
