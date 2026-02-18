const { SlashCommandBuilder } = require("@discordjs/builders");
const Database = require("st.db");

const usersdata = new Database("./database/users.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stock")
    .setDescription("عرض عدد الأعضاء المتاحين"),

  async execute(interaction) {
    const stock = usersdata.all().length;
    await interaction.reply(`📦 **Stock الحالي:** ${stock} عضو`);
  }
};
