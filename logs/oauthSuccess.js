module.exports = (client, user) => {
  client.channels.cache
    .get(process.env.OAUTH_SUCCESS)
    ?.send(`✅ OAuth Success: ${user}`);
};
