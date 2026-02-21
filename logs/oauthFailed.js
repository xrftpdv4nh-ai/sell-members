module.exports = (client, user) => {
  client.channels.cache
    .get(process.env.OAUTH_FAILED)
    ?.send(`❌ OAuth Failed: ${user}`);
};
