const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: { type: String, unique: true },
  verifiedRole: String
});

module.exports = mongoose.model("GuildSettings", schema);
