const { SlashCommandBuilder } = require("@discordjs/builders");
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
    .setDescription("إعدادات البوت (Admin فقط)")
    .addSubcommand(cmd =>
      cmd
        .setName("price")
        .setDescription("تحديد سعر العضو")
        .addIntegerOption(opt =>
          opt.setName("amount").setDescription("السعر").setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
      return interaction.reply({ content: "❌ Admin فقط", ephemeral: true });
    }

    const config = require("../../config");
    const price = interaction.options.getInteger("amount");
    config.bot.price = price;
    saveConfig(config);

    await interaction.reply({ content: "✅ تم حفظ السعر", ephemeral: true });
  }
};
