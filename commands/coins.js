const coins = require("../utils/coins");

module.exports = {
  name: "coins",
  run(client, message) {

    const balance = coins.get(message.author.id);

    message.reply(
      `💰 **محفظتك الحالية**\n` +
      `رصيدك: **${balance} coins$**`
    );
  }
};
