const axios = require("axios");

module.exports = async function checkToken(accessToken) {
  try {
    await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return true;
  } catch {
    return false;
  }
};
