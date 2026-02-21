const axios = require("axios");

module.exports = async function addMember(guildId, user, botToken) {
  try {
    await axios.put(
      `https://discord.com/api/guilds/${guildId}/members/${user.discordId}`,
      {
        access_token: user.accessToken
      },
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    return true;
  } catch (err) {
    return false;
  }
};
