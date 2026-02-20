const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Modal,
  TextInputComponent
} = require("discord.js");
const config = require("../config");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {

    /* ================= BUTTONS ================= */
    if (interaction.isButton()) {

      /* ===== OPEN TICKET ===== */
      if (interaction.customId === "open_ticket") {

        const existing = interaction.guild.channels.cache.find(
          c =>
            c.parentId === config.ticket.categoryId &&
            c.topic === `ticket-user:${interaction.user.id}`
        );

        if (existing) {
          return interaction.reply({
            content: `❗ لديك تذكرة مفتوحة بالفعل: ${existing}`,
            ephemeral: true
          });
        }

        const channel = await interaction.guild.channels.create(
          `ticket-${interaction.user.username}`,
          {
            type: "GUILD_TEXT",
            parent: config.ticket.categoryId,
            topic: `ticket-user:${interaction.user.id}`,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: ["VIEW_CHANNEL"],
              },
              {
                id: interaction.user.id,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
              },
              {
                id: config.ticket.supportRoleId,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
              }
            ],
          }
        );

        const embed = new MessageEmbed()
          .setTitle("🎟️ تذكرة شراء")
          .setDescription(
            "اختر العملية من الأزرار بالأسفل\n\n" +
            "💳 شراء رصيد"
          )
          .setColor("#22c55e");

        const row = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("buy_balance")
            .setLabel("💳 شراء رصيد")
            .setStyle("SUCCESS"),

          new MessageButton()
            .setCustomId("close_ticket")
            .setLabel("❌ إغلاق التذكرة")
            .setStyle("DANGER")
        );

        await channel.send({
          content: `<@${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        return interaction.reply({
          content: `✅ تم فتح التذكرة: ${channel}`,
          ephemeral: true
        });
      }

      /* ===== BUY BALANCE ===== */
      if (interaction.customId === "buy_balance") {
        const modal = new Modal()
          .setCustomId("buy_balance_modal")
          .setTitle("شراء رصيد");

        const amountInput = new TextInputComponent()
          .setCustomId("amount")
          .setLabel("عدد الكوينز")
          .setStyle("SHORT")
          .setPlaceholder("مثال: 10")
          .setRequired(true);

        modal.addComponents(
          new MessageActionRow().addComponents(amountInput)
        );

        return interaction.showModal(modal);
      }

      /* ===== CLOSE TICKET ===== */
      if (interaction.customId === "close_ticket") {
        await interaction.reply("🗑️ سيتم غلق التذكرة...");
        return setTimeout(() => {
          interaction.channel.delete().catch(() => {});
        }, 3000);
      }
    }

    /* ================= MODAL ================= */
    if (interaction.isModalSubmit()) {
      if (interaction.customId !== "buy_balance_modal") return;

      const amount = parseInt(
        interaction.fields.getTextInputValue("amount")
      );

      if (!amount || amount <= 0) {
        return interaction.reply({
          content: "❌ الكمية غير صحيحة",
          ephemeral: true
        });
      }

      const data = global.getData();

      if (!data.coinPrice || data.coinPrice <= 0) {
        return interaction.reply({
          content: "❌ سعر الكوين غير محدد بعد",
          ephemeral: true
        });
      }

      const total = amount * data.coinPrice;

      /* ✅ أهم سطر في النظام كله */
      global.pendingPurchases.set(interaction.user.id, {
        coins: amount,
        price: total,
        channelId: interaction.channel.id
      });

      return interaction.reply({
        embeds: [{
          color: 0xfacc15,
          description:
`💳 **إكمال شراء الرصيد**

🪙 الكمية: **${amount} كوين**
💰 الإجمالي: **${total} كريدت**

📩 الرجاء التحويل:
\`\`\`
#credit ${config.probot.creditAccountId} ${total}
\`\`\`

⏱️ لديك **5 دقائق** لإتمام التحويل`
        }]
      });
    }
  });
};
