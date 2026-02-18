const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions } = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../config.js");

/* حفظ الكونفيج */
function saveConfig(newConfig) {
  fs.writeFileSync(
    configPath,
    "module.exports = " + JSON.stringify(newConfig, null, 2)
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("إعدادات البوت (Admin فقط)")
    .setDefaultMemberPermissions(Permissions.FLAGS.ADMINISTRATOR)

    /* ===== CATEGORY ===== */
    .addSubcommand(cmd =>
      cmd
        .setName("category")
        .setDescription("تحديد كاتيجوري التيكت")
        .addChannelOption(opt =>
          opt
            .setName("channel")
            .setDescription("Category")
            .setRequired(true)
        )
    )

    /* ===== LOGS ===== */
    .addSubcommand(cmd =>
      cmd
        .setName("logs")
        .setDescription("تحديد روم اللوجز")
        .addChannelOption(opt =>
          opt
            .setName("channel")
            .setDescription("Logs channel")
            .setRequired(true)
        )
    )

    /* ===== PRICE ===== */
    .addSubcommand(cmd =>
      cmd
        .setName("price")
        .setDescription("تحديد سعر العضو")
        .addIntegerOption(opt =>
          opt
            .setName("amount")
            .setDescription("سعر العضو الواحد")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    // نعمل require جوه علشان الكاش يتحدث
    delete require.cache[require.resolve("../../config")];
    const config = require("../../config");

    const sub = interaction.options.getSubcommand();

    if (sub === "category") {
      config.bot.category = interaction.options.getChannel("channel").id;
    }

    if (sub === "logs") {
      config.bot.logs = interaction.options.getChannel("channel").id;
    }

    if (sub === "price") {
      config.bot.price = interaction.options.getInteger("amount");
    }

    saveConfig(config);

    await interaction.reply({
      content: "✅ تم حفظ الإعداد بنجاح",
      ephemeral: true
    });
  }
};
