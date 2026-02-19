const {
  MessageEmbed,
  MessageActionRow,
  MessageButton
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// مسار قاعدة البيانات
const dbPath = path.join(__dirname, "..", "database", "coins.json");
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

function getCoins() {
  return JSON.parse(fs.readFileSync(dbPath));
}

module.exports = {
  name: "coins",
  run: async (client, message) => {
    const userId = message.author.id;
    const data = getCoins();
    const balance = data[userId] || 0;

    // ===== لو مفيش رصيد =====
    if (balance === 0) {
      const embed = new MessageEmbed()
        .setColor("#2b2d31")
        .setDescription(
          "❌ **ليس لديك أي رصيد حالياً.**\n\n" +
          "إذا كنت ترغب في شراء رصيد، اضغط على الزر أدناه."
        );

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("buy_balance")
          .setLabel("💰 شراء رصيد")
          .setStyle("PRIMARY")
      );

      return message.reply({
        embeds: [embed],
        components: [row]
      });
    }

    // ===== لو عنده رصيد =====
    const embed = new MessageEmbed()
      .setColor("#2ecc71")
      .setDescription(
        `💰 **رصيدك الحالي:** \`${balance}\` Coins`
      );

    message.reply({ embeds: [embed] });
  }
};
