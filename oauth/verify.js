module.exports = (app, passport) => {
  app.get("/login", passport.authenticate("discord"));
};
