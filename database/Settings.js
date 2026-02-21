const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  guildId: { type: String, unique: true },
  verifiedRole: { type: String, default: null }
});

module.exports = mongoose.model("GuildSettings", settingsSchema);
