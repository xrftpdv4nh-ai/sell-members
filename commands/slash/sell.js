const { SlashCommandBuilder, Permissions } = require("discord.js");
const Database = require("st.db");
const path = require("path");
const config = require("../../config");

const usersdata = new Database(
  path.join(__dirname, "../../database/users.json")
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("بيع أعضاء (Admin فقط)")
    .addIntegerOption(opt =>
      opt.setName("members")
        .setDescription("عدد الأعضاء")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      return interaction.reply({ content: "❌ Admin فقط", ephemeral: true });
    }

    const amount = interaction.options.getInteger("members");
    const stock = usersdata.all().length;
    const price = Number(config.bot.price);

    if (!price) {
      return interaction.reply({ content: "❌ السعر غير محدد", ephemeral: true });
    }

    if (amount > stock) {
      return interaction.reply({
        content: `❌ الستوك غير كافي، المتاح: ${stock}`,
        ephemeral: true
      });
    }

    const total = amount * price;

    await interaction.reply(
      `🛒 **طلب بيع**\n👥 العدد: ${amount}\n📦 المتاح: ${stock}\n💰 السعر: ${total}`
    );
  }
};
