// utils/checkToken.js
const axios = require("axios");

module.exports = async function checkToken(accessToken) {
  try {
    const res = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return res.status === 200;
  } catch (err) {
    return false;
  }
};
