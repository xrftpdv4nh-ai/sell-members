const delay = require("./limiter");
const fs = require("fs");

module.exports = async (client, guildId) => {
  const users = JSON.parse(fs.readFileSync("./database/users.json"));

  for (const user of users) {
    try {
      await client.guilds.cache
        .get(guildId)
        ?.members.add(user.id, { accessToken: user.accessToken });

      await delay(5000);
    } catch (err) {}
  }
};
