const DiscordStrategy = require("passport-discord").Strategy;
const config = require("../config");

module.exports = passport => {
  passport.use(
    new DiscordStrategy(
      {
        clientID: config.bot.clientId,
        clientSecret: config.bot.clientSecret,
        callbackURL: config.oauth.callbackURL, // ✅ هنا التعديل المهم
        scope: config.oauth.scopes
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, {
          id: profile.id,
          username: profile.username,
          discriminator: profile.discriminator,
          accessToken,
          refreshToken
        });
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));
};
