const DiscordStrategy = require("passport-discord").Strategy;
const config = require("../config");

module.exports = passport => {
  passport.use(
    new DiscordStrategy(
      {
        clientID: config.bot.clientId,
        clientSecret: config.bot.clientSecret,
        callbackURL: `${process.env.DOMAIN}/callback`,
        scope: config.oauth.scopes
      },
      (accessToken, refreshToken, profile, done) => {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));
};
