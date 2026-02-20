const config = require("../config");

module.exports = client => {
  client.on("messageCreate", async message => {
    if (message.author.id !== config.probot.id) return;
    if (!message.content.includes("has transferred")) return;

    const credit = message.content.match(/`(\d+)`/);
    if (!credit) return;

    const credits = parseInt(credit[1]);
    const data = global.getData();

    const coins = Math.floor(credits / data.coinPrice);
    if (coins <= 0) return;

    const user = message.mentions.users.first();
    if (!user) return;

    if (!data.users[user.id]) data.users[user.id] = { coins: 0 };
    data.users[user.id].coins += coins;

    global.saveData(data);

    message.channel.send(`✅ ${user} تمت إضافة **${coins} كوين**`);
  });
};
