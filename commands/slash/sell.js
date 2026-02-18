const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Database = require("st.db");
const config = require("../../config");

const usersdata = new Database("./database/users.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("بيع أعضاء (Admin فقط)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption(opt =>
      opt.setName("members")
        .setDescription("عدد الأعضاء")
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("members");
    const stock = usersdata.all().length;
    const price = Number(config.bot.price);

    if (!price || price <= 0) {
      return interaction.reply({
        content: "❌ السعر غير مُحدد من /setup",
        ephemeral: true
      });
    }

    if (amount > stock) {
      return interaction.reply({
        content: `❌ الستوك غير كافي، المتاح: ${stock}`,
        ephemeral: true
      });
    }

    const total = amount * price;

    await interaction.reply({
      content:
        `🛒 **طلب بيع**\n\n` +
        `👥 العدد: ${amount}\n` +
        `📦 الستوك: ${stock}\n` +
        `💰 السعر: ${total}`
    });
  }
};
