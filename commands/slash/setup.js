const { SlashCommandBuilder, Permissions } = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../config.js");

function saveConfig(cfg) {
  fs.writeFileSync(
    configPath,
    "module.exports = " + JSON.stringify(cfg, null, 2)
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("إعدادات البوت (Admin)")
    .addSubcommand(cmd =>
      cmd.setName("price")
        .setDescription("تحديد سعر العضو")
        .addIntegerOption(opt =>
          opt.setName("amount")
            .setDescription("السعر")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      return interaction.reply({ content: "❌ Admin فقط", ephemeral: true });
    }

    const config = require("../../config");
    config.bot.price = interaction.options.getInteger("amount");

    saveConfig(config);

    interaction.reply({ content: "✅ تم الحفظ", ephemeral: true });
  }
};
