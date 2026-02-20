const { Intents  , Client , MessageActionRow, MessagePayload  , MessageSelectMenu ,Modal , MessageEmbed  ,MessageButton , MessageAttachment, Permissions, TextInputComponent   } = require('discord.js');
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});
const axios = require('axios'); // التأكد من أنك قد قمت بتثبيت axios

var express = require("express");
var app = express();
var path = require("path");
const fs = require("fs");
var bodyParser = require("body-parser");
const Database = require('st.db')
const db = new Database('coinsdb');
const usersdata = new Database({
  path: './database/users.json',
  databaseInObject: true
})
const DiscordStrategy = require('passport-discord').Strategy
  , refresh = require('passport-oauth2-refresh');
const passport = require('passport');
const session = require('express-session');
const wait = require('node:timers/promises').setTimeout;
const { channels, price,bot, website } = require("./config.js");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(__dirname + "assets"))
app.set("view engine", "ejs")
app.use(express.static("public"));
const config = require('./config.js');

const { use } = require("passport");
global.config = config;
import('node-fetch')
const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2({
  clientId: config.bot.botID,
  clientSecret: config.bot.clientSECRET,
  redirectUri: config.bot.callbackURL,
});

require('./slash.js')
app.get('/', function (req, res) {
  res.send('Hello World')
})
const prefix = config.bot.prefix; 
app.listen(3000)
var scopes = ['identify', 'guilds', 'guilds.join'];

passport.use(new DiscordStrategy({
  clientID: config.bot.botID,
  clientSecret: config.bot.clientSECRET,
  callbackURL: config.bot.callbackURL,
  scope: scopes
}, async function (accessToken, refreshToken, profile, done) {
  process.nextTick(async function () {
    usersdata.set(`${profile.id}`, {
      accessToken: accessToken,
      refreshToken: refreshToken,
      email: profile.email
    })
    return done(null, profile);
  });
  await oauth.addMember({
    guildId: `${config.bot.GuildId}`,
    userId: profile.id,
    accessToken: accessToken,
    botToken: client.token
  })
const channel = await client.channels.fetch(config.Log.LogChannelOwners); // استبدل بـ ID القناة التي تريد إرسال الرسالة إليها
  if (channel) {
    const embed = new MessageEmbed()
      .setColor('#7adfdb')
      .setTitle('لقد قام شخص بإثبات نفسه')
      .setDescription(`<@${profile.id}>, لقد تم توثيقك بنجاح`)
      .addField('اسم المستخدم', profile.username, true)
      .addField('ID المستخدم', profile.id, true)
      .setTimestamp();

    channel.send({ embeds: [embed] });
    channel.send({content: `${config.bot.LineIce}`})
  } else {
    console.error('القناة غير موجودة.');
  }

  return done(null, profile);
}));



app.get("/", function (req, res) {
  res.render("index", { client: client, user: req.user, config: config, bot: bot });
});



app.use(session({
  secret: 'some random secret',
  cookie: {
    maxAge: 60000 * 60 * 24
  },
  saveUninitialized: false
}));
app.get("/", (req, res) => {
  res.render("index", { client: client, user: req.user, config: config, bot: bot });
});
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('discord', { failureRedirect: '/' }), function (req, res) {
  var characters = '0123456789';
  let idt = ``
  for (let i = 0; i < 20; i++) {
    idt += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  res.render("login", { client: client, user: req.user.username, config: config, bot: bot });
});




client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `send`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

    
    let button = new MessageButton()
      .setLabel('اثبت نفسك')
      .setStyle('LINK')
      .setURL(`${config.bot.TheLinkVerfy}`)


    let row = new MessageActionRow()
      .setComponents(button)

    // إرسال الرسالة مع الـ Embed والأزرار
    message.channel.send({ components: [row] });
  }
});

let coinsData;


// تحميل أو إنشاء قاعدة بيانات العملات
function loadCoinsData() {
    if (fs.existsSync('./coinsdb.json')) {
        coinsData = JSON.parse(fs.readFileSync('./coinsdb.json', 'utf8'));
    } else {
        coinsData = [];
    }
}
// حفظ التغييرات إلى قاعدة البيانات
function saveCoinsData() {
    fs.writeFileSync('./coinsdb.json', JSON.stringify(coinsData, null, 4));
}

// الحصول على عدد الكوينز للمستخدم
function getCoins(userId) {
    const entry = coinsData.find(([key]) => key === `coins_${userId}`);
    return entry ? entry[1] : 0;
}

// تحديث عدد الكوينز للمستخدم
function setCoins(userId, amount) {
    const index = coinsData.findIndex(([key]) => key === `coins_${userId}`);
    if (index !== -1) {
        coinsData[index][1] = amount;
    } else {
        coinsData.push([`coins_${userId}`, amount]);
    }
    saveCoinsData();
}



client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
    loadCoinsData();
});
client.on('ready', () => {
    client.user.setStatus('streaming'); // تعيين الحالة إلى online

    var statuses = [`Working !`, `New Stock !`];
    var timers = 5;
    var timeing = timers * 1500;
    setInterval(function () {
        var lengthesof = statuses.length;
        var amounter = Math.floor(Math.random() * lengthesof);
        client.user.setPresence({
            activities: [{ name: statuses[amounter] }],
            status: 'streaming'
        });
    }, timeing);
});
// إدارة العمليات النشطة
const activePurchases = new Map();

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix + 'buy-coins')) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    args.shift();

    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      console.log(`❌ | المستخدم ${message.author.username} لم يحدد كمية صالحة.`);
      return message.channel.send(`**❌ | يرجى كتابة الكمية التي تريد شرائها \`${prefix}buy-coins [amount]\` **`);
    }

    if (activePurchases.has(message.author.id)) {
      console.log(`❌ | المستخدم ${message.author.username} لديه عملية شراء جارية بالفعل.`);
      return message.channel.send(`**❌ | لديك عملية شراء جارية بالفعل. يرجى إتمام العملية الحالية أولاً أو إلغائها.**`);
    }

    const pricePerCoin = config.bot.coinprice;
    const totalPriceWithoutTax = amount * pricePerCoin;
    const taxAmount = Math.floor(totalPriceWithoutTax * (20 / 19) + 1);
    const finalAmount = taxAmount;

    console.log(`المستخدم ${message.author.username} طلب شراء ${amount} كوينز. السعر الإجمالي مع الضريبة: ${finalAmount}`);

    activePurchases.set(message.author.id, { amount, finalAmount });

    const cancelButton = new MessageButton()
      .setCustomId('cancel_purchase')
      .setLabel('إلغاء العملية')
      .setStyle('DANGER');

    const buytembed = new MessageEmbed()
      .setDescription(`
\`\`\`#credit ${config.bot.TraId} ${taxAmount}\`\`\` 
`)

    const row = new MessageActionRow().addComponents(cancelButton);

    try {
      const purchaseMessage = await message.channel.send({
        content: `**مرحبا ${message.author} 👋 **\n\n** لشراء \`${amount}\` كوينز 🪙 يجب عليك تحويل المبلغ 👇**
**الرجاء التحويل في غضون 5 دقائق ! ↪️ **`,
        components: [row],
        embeds: [buytembed],
      });
      console.log(`✅ | تم إرسال رسالة الشراء بنجاح للمستخدم ${message.author.username}.`);
    } catch (error) {
      console.error(`❌ | حدث خطأ عند إرسال رسالة الشراء للمستخدم ${message.author.username}: ${error.message}`);
      return message.channel.send(`**❌ | حدث خطأ أثناء إرسال رسالة الشراء. يرجى المحاولة لاحقًا.**`);
    }

    const filter = ({ content, author: { id } }) => {
      return (
        content.startsWith(`**:moneybag: | ${message.author.username}, has transferred `) &&
        content.includes(config.bot.TraId) &&
        id === '282859044593598464'
      );
    };

    const collector = message.channel.createMessageCollector({
      filter,
      max: 1,
      time: 300000,
    });

    // إضافة الكولكتور إلى البيانات النشطة
    activePurchases.get(message.author.id).collector = collector;

    collector.on('collect', async collected => {
      try {
        const transferAmount = Number(collected.content.match(/\$([0-9]+)/)[1]);
        console.log(`تم استلام التحويل: ${transferAmount} كريدت من ${message.author.username}`);

        if (transferAmount === config.bot.coinprice * amount) {
          console.log(`✅ | المبلغ المحول من ${message.author.username} صحيح.`);
          
          try {
            const currentCoins = getCoins(message.author.id);
            setCoins(message.author.id, currentCoins + amount);
            console.log(`✅ | تم إضافة ${amount} كوينز لحساب المستخدم ${message.author.username}.`);

            await message.channel.send(`**✅ | ${message.author} تم تنفيذ العملية بنجاح! لقد تم إضافة \`${amount}\` كوينز إلى حسابك.**`);

            const logChannel = message.guild.channels.cache.get(config.bot.logChannelId);
            if (logChannel) {
              logChannel.send(`**📥 | ${message.author.username} قام بشراء \`${amount}\` كوينز بنجاح!**`);
            }
          } catch (error) {
            console.error(`❌ | حدث خطأ عند إضافة الكوينز لحساب ${message.author.username}: ${error.message}`);
            return message.channel.send(`**❌ | حدث خطأ أثناء إضافة الكوينز لحسابك. يرجى المحاولة لاحقًا.**`);
          }
        } else {
          console.log(`❌ | المبلغ المحول من ${message.author.username} غير مطابق للسعر المطلوب.`);
          await message.channel.send('**❌ | المبلغ المحول غير مطابق للسعر المطلوب.**');
        }
      } catch (error) {
        console.error(`❌ | حدث خطأ أثناء معالجة التحويل من ${message.author.username}: ${error.message}`);
        await message.channel.send('**❌ | حدث خطأ أثناء معالجة التحويل. يرجى المحاولة لاحقًا.**');
      }

      activePurchases.delete(message.author.id);
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time' && collected.size === 0) {
        console.log(`❌ | المستخدم ${message.author.username} لم يقم بالتحويل في الوقت المحدد.`);
        message.channel.send(`**❌ | ${message.author} لقد انتهى الوقت، لا تقم بالتحويل الآن.**`);
      }
      activePurchases.delete(message.author.id);
    });

    // نظام إلغاء محسن
    const buttonFilter = (interaction) => 
      interaction.user.id === message.author.id && 
      interaction.isButton() && 
      interaction.customId === 'cancel_purchase';

    const buttonCollector = message.channel.createMessageComponentCollector({
      filter: buttonFilter,
      time: 300000,
    });

    
    buttonCollector.on('collect', async (interaction) => {
      // إيقاف كولكتور الرسائل أولًا إذا كان موجودًا
      if (activePurchases.has(message.author.id)) {
        const userPurchase = activePurchases.get(message.author.id);
        if (userPurchase.collector) {
          userPurchase.collector.stop('cancelled');
        }
      }

      await interaction.update({
        content: '**تم إلغاء العملية بنجاح ✅**',
        components: [],
      });

      activePurchases.delete(message.author.id);
    });
  }
});











client.on('messageCreate', (message) => {
    if (!message.content.startsWith(config.bot.prefix) || message.author.bot) return;

    const args = message.content.slice(config.bot.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // أمر عرض الكوينز
    if (command === 'coins') {
        let target = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
        const coins = getCoins(target.id);

        message.channel.send(`🪙 | **${target.username}** رصيد حسابه : \`${coins}\``);
    }

    // أمر إعطاء الكوينز
    if (command === 'give') {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

        let target = message.mentions.users.first() || client.users.cache.get(args[0]);
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount) || amount <= 0) {
            return message.reply("Usage: `!give [mention/id] [amount]`");
        }

        const currentCoins = getCoins(target.id);
        setCoins(target.id, currentCoins + amount);

        message.channel.send(`** :white_check_mark:  | تم إعطاء ${amount} لـ <@${target.id}>**`);
    }

    // أمر إزالة الكوينز
    if (command === 'take') {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

        let target = message.mentions.users.first() || client.users.cache.get(args[0]);
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount) || amount <= 0) {
            return message.reply("Usage: `!take [mention/id] [amount]`");
        }

        const currentCoins = getCoins(target.id);
        setCoins(target.id, Math.max(currentCoins - amount, 0));

        message.channel.send(`** :white_check_mark:  | تم إزالة ${amount} من <@${target.id}>**`);
    }
});














client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `invite`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    let button = new MessageButton()
      .setLabel(`ضيفني`)
      .setStyle(`LINK`)
      .setURL(config.bot.inviteBotUrl)
      .setEmoji(`✍️`)

    let row = new MessageActionRow()
      .setComponents(button)
    message.channel.send({ components: [row] })
  }
})
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + 'check')) {
    // التحقق من الصلاحيات
    if (!config.bot.owners.includes(message.author.id)) {
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setColor('#FF0000')
            .setDescription('🔐 **ليس لديك صلاحية استخدام هذا الأمر!**')
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
        ],
        ephemeral: true
      });
    }

    // استخراج العضو المطلوب
    const args = message.content.split(' ').slice(1).join(' ');
    
    // التحقق من وجود منشن أو أيدي
    if (!args) {
      const usageEmbed = new MessageEmbed()
        .setColor('#FFA500')
        .setTitle('ℹ️ طريقة الاستخدام')
        .setDescription(`**استخدم الأمر كالتالي:**\n\`${prefix}check @user\` أو \`${prefix}check userID\``)
        .addField('مثال', `${prefix}check ${message.author}`)
        .setFooter({ text: 'يجب منشن الشخص أو كتابة الأيدي الخاص به' });
      
      return message.channel.send({ embeds: [usageEmbed] });
    }

    // البحث عن العضو
    const member = message.mentions.members.first() || message.guild.members.cache.get(args);
    
    // التحقق من وجود العضو
    if (!member) {
      const errorEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('❌ **لم يتم العثور على العضو**')
        .addField('الأسباب المحتملة', '• العضو غير موجود\n• الأيدي غير صحيح\n• لم يتم منشن الشخص بشكل صحيح')
        .setThumbnail('https://cdn.discordapp.com/emojis/892292745916481546.webp');
      
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // جلب بيانات العضو
    const userData = usersdata.get(member.id);
    
    // إنشاء إمبد النتيجة
    const resultEmbed = new MessageEmbed()
      .setColor(userData ? '#00FF00' : '#FF0000')
      .setAuthor({
        name: `معلومات توثيق ${member.user.username}`,
        iconURL: member.user.displayAvatarURL()
      })
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name: '🆔 الأيدي',
          value: `\`${member.id}\``,
          inline: true
        },
        {
          name: '📅 تاريخ الانضمام',
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`,
          inline: true
        },
        {
          name: '🔍 حالة التوثيق',
          value: userData ? '✅ **موثق**' : '❌ **غير موثق**',
          inline: true
        }
      )
      .setFooter({ 
        text: `طلب بواسطة ${message.author.username}`,
        iconURL: message.author.displayAvatarURL() 
      })
      .setTimestamp();

    // إرسال النتيجة
    await message.channel.send({ embeds: [resultEmbed] });

    // إرسال رسالة إضافية إذا كان موثقاً
    if (userData) {
      const additionalInfo = new MessageEmbed()
        .setColor('#00FF7F')
        .setDescription(`**معلومات إضافية:**\nتم العثور على بيانات التوثيق الخاصة بـ ${member}`)
        .addField('تاريخ التوثيق', userData.date ? `<t:${Math.floor(new Date(userData.date).getTime() / 1000)}:R>` : 'غير معروف', true)
        .addField('نوع الحساب', userData.bot ? '🤖 بوت' : '👤 مستخدم عادي', true);
      
      await message.channel.send({ embeds: [additionalInfo] });
    }
  }
});
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + 'join')) {
    if (!config.bot.owners.includes(message.author.id)) {
      return message.reply({
        embeds: [new MessageEmbed()
          .setColor('#ff0000')
          .setDescription('⛔ **ليس لديك صلاحية لاستخدام هذا الأمر!**')
        ],
        ephemeral: true
      });
    }

    // إيمبد التحميل
    const loadingEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setDescription('<a:loading:123456789012345678> **جاري فحص البيانات...**');

    let msg = await message.channel.send({ embeds: [loadingEmbed] });

    let alld = usersdata.all();
    let args = message.content.split(' ').slice(1);

    // التحقق من المدخلات
    if (!args[0] || !args[1]) {
      const errorEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('❌ خطأ في الإدخال')
        .setDescription('**يجب تحديد:\n\n• أيدي السيرفر\n• عدد الأعضاء المطلوبين**')
        .addField('طريقة الاستخدام', `\`${prefix}join [ServerID] [Amount]\``)
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });

      return msg.edit({ embeds: [errorEmbed], content: null }).catch(() => {
        message.channel.send({ embeds: [errorEmbed] });
      });
    }

    let guild = client.guilds.cache.get(args[0]);
    let amount = parseInt(args[1]);
    let count = 0;

    // التحقق من وجود السيرفر
    if (!guild) {
      const notFoundEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setDescription(`**❌ لم أتمكن من العثور على السيرفر** \`${args[0]}\``)
        .addField('الأسباب المحتملة', '• السيرفر غير موجود\n• البوت غير مضاف للسيرفر\n• الأيدي غير صحيح');

      return msg.edit({ embeds: [notFoundEmbed], content: null }).catch(() => {
        message.channel.send({ embeds: [notFoundEmbed] });
      });
    }

    // التحقق من الكمية
    if (amount > alld.length) {
      const limitEmbed = new MessageEmbed()
        .setColor('#ff9900')
        .setDescription(`**⚠️ العدد المطلوب (${amount}) يتجاوز المخزون المتاح (${alld.length})**`)
        .addField('الحل', '• اختر عدد أقل\n• انتظر حتى يتوفر المزيد من الأعضاء');

      return msg.edit({ embeds: [limitEmbed], content: null }).catch(() => {
        message.channel.send({ embeds: [limitEmbed] });
      });
    }

    // إيمبد التنفيذ
    const processingEmbed = new MessageEmbed()
      .setColor('#ffff00')
      .setDescription('<a:loading:123456789012345678> **جاري إدخال الأعضاء...**')
      .addField('السيرفر', `\`${guild.name}\``, true)
      .addField('العدد المطلوب', `\`${amount}\` عضو`, true);

    await msg.edit({ embeds: [processingEmbed], content: null });

    // تنفيذ العملية
    for (let index = 0; index < amount; index++) {
      await oauth.addMember({
        guildId: guild.id,
        userId: alld[index].ID,
        accessToken: alld[index].data.accessToken,
        botToken: client.token
      }).then(() => count++).catch(() => {});
    }

    // إيمبد النتيجة النهائية
    const resultEmbed = new MessageEmbed()
      .setColor('#00ff00')
      .setTitle('✅ تم تنفيذ الأمر بنجاح')
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: '🟢 تم إدخال', value: `\`${count}\` عضو`, inline: true },
        { name: '🔴 لم يتم إدخال', value: `\`${amount - count}\` عضو`, inline: true },
        { name: '🔵 العدد المطلوب', value: `\`${amount}\` عضو`, inline: true }
      )
      .setFooter({ 
        text: `بواسطة ${message.author.username} | ${new Date().toLocaleString()}`,
        iconURL: message.author.displayAvatarURL() 
      });

    await msg.edit({ embeds: [resultEmbed], content: null }).catch(() => {
      message.channel.send({ embeds: [resultEmbed] });
    });
  }
});
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + 'refresh')) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

    let mm = await message.channel.send({ content: `**يتم الان عمل ريفرش , برجاء انتظار ...**` }).catch(() => {});
    let alld = usersdata.all();
    let count = 0;
    let removedDueToGuilds = 0; // تمت إزالتهم بسبب تجاوز 100 خادم
    let removedDueToNoNitro = 0; // تمت إزالتهم بسبب عدم وجود Nitro
    let removedDueToTokenError = 0; // تمت إزالتهم بسبب فشل الوصول إلى التوكن
    let removedDueToVerification = 0; // تمت إزالتهم بسبب الحاجة إلى تحقق
    let removedDueToOtherErrors = 0; // تمت إزالتهم بسبب أخطاء أخرى
    let totalChecked = 0;

    // عدد الحسابات قبل الحذف
    const stockBefore = alld.length;

    for (let i = 0; i < alld.length; i++) {
      totalChecked++;
      try {
        // تحديث التوكن
        const res = await oauth.tokenRequest({
          'clientId': client.user.id,
          'clientSecret': bot.clientSECRET,
          'grantType': 'refresh_token',
          'refreshToken': alld[i].data.refreshToken
        });

        // تحديث التوكن في قاعدة البيانات
        usersdata.set(`${alld[i].ID}`, {
          accessToken: res.access_token,
          refreshToken: res.refresh_token
        });
        count++;

        // استخدام accessToken للحصول على معلومات العضو
        try {
          const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
              Authorization: `Bearer ${res.access_token}`
            }
          });

          const userData = userResponse.data;

          // التحقق مما إذا كان العضو يمتلك Nitro
          const hasNitro = userData.premium_type === 1 || userData.premium_type === 2;

          // الحصول على قائمة السيرفرات التي ينتمي إليها العضو
          const guildsResponse = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
            headers: {
              Authorization: `Bearer ${res.access_token}`
            }
          });

          const guildCount = guildsResponse.data.length;

          // إذا كان العضو ينتمي إلى 100 سيرفر أو أكثر وليس لديه Nitro، نقوم بحذفه
          if (guildCount >= 100 && !hasNitro) {
          //  console.log(`العضو ${alld[i].ID} ينتمي إلى ${guildCount} سيرفر(s) وليس لديه Nitro، سيتم حذفه.`);
            usersdata.delete(`${alld[i].ID}`);
            removedDueToGuilds++; // زيادة العداد للذين تم حذفهم بسبب تجاوز 100 خادم
          } else {
         //   console.log(`العضو ${alld[i].ID} ينتمي إلى ${guildCount} سيرفر(s) و${hasNitro ? 'لديه Nitro' : 'ليس لديه Nitro'}.`);
          }

        } catch (error) {
          // إذا حدث خطأ 401 (غير مصرح)، نقوم بحذف الحساب
          if (error.response && error.response.status === 401) {
          //  console.log(`التوكن غير صالح للعضو ${alld[i].ID}، سيتم حذفه.`);
            usersdata.delete(`${alld[i].ID}`);
            removedDueToTokenError++; // زيادة العداد للذين تم حذفهم بسبب فشل الوصول إلى التوكن
          }
          // إذا حدث خطأ 403 (ممنوع)، نقوم بحذف الحساب
          else if (error.response && error.response.status === 403) {
        //    console.log(`الحساب ${alld[i].ID} يحتاج إلى تحقق، سيتم حذفه.`);
            usersdata.delete(`${alld[i].ID}`);
            removedDueToVerification++; // زيادة العداد للذين تم حذفهم بسبب الحاجة إلى تحقق
          }
          // إذا حدث أي خطأ آخر، نقوم بحذف الحساب
          else {
         //   console.error(`فشل الحصول على معلومات العضو ${alld[i].ID}:`, error);
            usersdata.delete(`${alld[i].ID}`);
            removedDueToOtherErrors++; // زيادة العداد للذين تم حذفهم بسبب أخطاء أخرى
          }
        }

      } catch (error) {
        // إذا حدث خطأ أثناء تحديث التوكن، نقوم بحذف الحساب
   //     console.log(`فشل تحديث التوكن للعضو ${alld[i].ID}، سيتم حذفه.`, error);
        usersdata.delete(`${alld[i].ID}`);
        removedDueToTokenError++; // زيادة العداد للذين تم حذفهم بسبب فشل الوصول إلى التوكن
      }
    }

    // عدد الحسابات بعد الحذف
    const stockAfter = usersdata.all().length;

    // إنشاء Embed للرسالة النهائية
    const embed = new MessageEmbed()
      .setTitle('📊 **نتائج تحديث التوكنات**')
      .setColor('#4CAF50') // لون الرسالة
      .addFields(
        { name: '🚫 تمت الإزالة بسبب تجاوز 100 خادم:', value: `\`${removedDueToGuilds}\``, inline: true },
        { name: '🚫 تمت الإزالة بسبب عدم وجود Nitro:', value: `\`${removedDueToNoNitro}\``, inline: true },
        { name: '🚫 تمت الإزالة بسبب فشل الوصول إلى التوكن:', value: `\`${removedDueToTokenError}\``, inline: true },
        { name: '🚫 تمت الإزالة بسبب الحاجة إلى تحقق:', value: `\`${removedDueToVerification}\``, inline: true },
        { name: '🚫 تمت الإزالة بسبب أخطاء أخرى:', value: `\`${removedDueToOtherErrors}\``, inline: true },
        { name: '📂 ستوك القديم:', value: `\`${stockBefore}\``, inline: true },
        { name: '📂 ستوك الحالي:', value: `\`${stockAfter}\``, inline: true },
        { name: '✅ تمت الإزالة بشكل إجمالي:', value: `\`${removedDueToGuilds + removedDueToNoNitro + removedDueToTokenError + removedDueToVerification + removedDueToOtherErrors}\``, inline: true }
      )
      .setFooter({ text: '🎉 عملية التحديث اكتملت بنجاح.' })
      .setTimestamp();

    // تعديل الرسالة الأصلية بالـ Embed
    mm.edit({ content: null, embeds: [embed] }).catch(() => {
      message.channel.send({ embeds: [embed] }).catch(() => {});
    });
  }
});
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + 'stock')) {
    // بيانات أساسية
    const guild = message.guild;
    const guildIcon = guild.iconURL({ dynamic: true, size: 1024 });
    const botUser = client.user;
    
    // جلب بيانات المستخدمين
    const membersCount = usersdata.all().length;
    const lastUpdate = new Date().toLocaleString('ar-SA');

    // إنشاء زر التحديث
    const refreshBtn = new MessageButton()
      .setCustomId('refresh_stock')
      .setLabel('تحديث البيانات')
      .setStyle('PRIMARY')
      .setEmoji('🔄');

    // إنشاء الإيمبد المنظم
    const stockEmbed = new MessageEmbed()
      .setColor(config.bot.colorembed || '#0099ff')
      .setAuthor({
        name: `مخزون الأعضاء | ${guild.name}`,
        iconURL: guildIcon
      })
      .setDescription(`
      **🛒 عرض المخزون المتاح حاليًا**
      
      ▬▬▬▬▬▬▬▬▬▬▬▬▬▬
      **📊 العدد الكلي:** \`${membersCount}\` عضو
      **🕒 آخر تحديث:** \`${lastUpdate}\`
      ▬▬▬▬▬▬▬▬▬▬▬▬▬▬
      
      *للتحديث اضغط على الزر بالأسفل*
      `)
      .setImage('https://cdn.discordapp.com/attachments/1278453203792298115/1292033637872697344/image4.png')
      .setThumbnail('https://cdn.discordapp.com/emojis/1025211165183840317.webp')
      .setFooter({
        text: `طلب بواسطة ${message.author.username} | ${botUser.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      });

    // إرسال الرسالة مع الزر
    await message.channel.send({
      embeds: [stockEmbed],
      components: [new MessageActionRow().addComponents(refreshBtn)]
    });
    
    // حذف أمر المستخدم إن أردت
    await message.delete().catch(console.error);
  }
});

// معالجة تحديث المخزون
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton() || interaction.customId !== 'refresh_stock') return;

  // تحديث البيانات
  const updatedCount = usersdata.all().length;
  const newUpdateTime = new Date().toLocaleString('ar-SA');

  // تحديث الإيمبد
  const updatedEmbed = new MessageEmbed(interaction.message.embeds[0])
    .setDescription(`
    **🛒 عرض المخزون المتاح حاليًا**
    
    ▬▬▬▬▬▬▬▬▬▬▬▬▬▬
    **📊 العدد الكلي:** \`${updatedCount}\` عضو
    **🕒 آخر تحديث:** \`${newUpdateTime}\`
    ▬▬▬▬▬▬▬▬▬▬▬▬▬▬
    
    *للتحديث اضغط على الزر بالأسفل*
    `);

  await interaction.update({ embeds: [updatedEmbed] });
});

// الاستماع للتفاعل مع الزر (Interaction)
client.on('interactionCreate', async interaction => {
  // معالجة اختيار القائمة المنسدلة
  if (interaction.isSelectMenu() && interaction.customId === 'service_menu') {
    if (interaction.values[0] === 'show_stock') {
      const guildIcon = interaction.guild.iconURL(); // صورة الخادم
      const botName = client.user.username; // اسم البوت
      const botAvatar = client.user.displayAvatarURL();
      
      // جلب بيانات المستخدمين
      let alld = usersdata.all();

      // إنشاء زر التحديث
      const refreshButton = new MessageButton()
        .setCustomId('refresh_users')
        .setLabel('تحديث المخزون')
        .setStyle('PRIMARY')
        .setEmoji('🔄');

      const actionRow = new MessageActionRow().addComponents(refreshButton);

      // إنشاء الـ Embed
      const stockEmbed = new MessageEmbed()
        .setColor(config.bot.colorembed)
        .setTitle('📊 كمية الأعضاء المتوفرة حالياً')
        .setDescription(`**الكمية المتاحة:** \`${alld.length}\` عضو\n\n**آخر تحديث:** <t:${Math.floor(Date.now()/1000)}:R>`)
        .setImage('https://cdn.discordapp.com/attachments/1278453203792298115/1292033637872697344/image4.png?ex=67024398&is=6700f218&hm=9b50426ec60c7f2f5fa41e60ff734f2918722e601fed25bdd3de6e4f56869bb9&')
        .setThumbnail(guildIcon)
        .setTimestamp()
        .setFooter({ text: botName, iconURL: botAvatar });

      await interaction.reply({ 
        embeds: [stockEmbed], 
        components: [actionRow],
        ephemeral: true 
      });
    }
  }

  // معالجة زر التحديث (يبقى كما هو)
  if (interaction.isButton() && interaction.customId === 'refresh_users') {
    const guildIcon = interaction.guild.iconURL();
    const botName = client.user.username;
    const botAvatar = client.user.displayAvatarURL();
    let alld = usersdata.all();

    const updatedEmbed = new MessageEmbed()
      .setColor(config.bot.colorembed)
      .setTitle('📊 كمية الأعضاء المتوفرة حالياً')
      .setDescription(`**الكمية المتاحة:** \`${alld.length}\` عضو\n\n**آخر تحديث:** <t:${Math.floor(Date.now()/1000)}:R>`)
      .setImage('https://cdn.discordapp.com/attachments/1278453203792298115/1292033637872697344/image4.png?ex=67024398&is=6700f218&hm=9b50426ec60c7f2f5fa41e60ff734f2918722e601fed25bdd3de6e4f56869bb9&')
      .setThumbnail(guildIcon)
      .setTimestamp()
      .setFooter({ text: botName, iconURL: botAvatar });

    await interaction.update({ 
      embeds: [updatedEmbed], 
      components: interaction.message.components 
    });
  }
});




client.on('messageCreate', async (message) => {
  // تحقق من أن الرسالة ليست من البوت
  if (message.author.bot) return;

  // تغيير اسم البوت
  if (message.content.startsWith(`${prefix}setname`)) {
      
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    const newName = message.content.split(' ').slice(1).join(' ');
    if (!newName) return message.reply('يرجى تقديم اسم جديد للبوت.');

    try {
      await client.user.setUsername(newName);
      message.channel.send(`تم تغيير اسم البوت إلى: ${newName}`);
    } catch (error) {
      console.error(error);
      message.channel.send('حدث خطأ أثناء محاولة تغيير اسم البوت.');
    }
  }

  // تغيير صورة البوت
  if (message.content.startsWith(`${prefix}setavatar`)) {
      
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    const newAvatarUrl = message.content.split(' ')[1];
    if (!newAvatarUrl) return message.reply('يرجى تقديم رابط صورة جديد للبوت.');

    try {
      await client.user.setAvatar(newAvatarUrl);
      message.channel.send('تم تغيير صورة البوت بنجاح.');
    } catch (error) {
      console.error(error);
      message.channel.send('حدث خطأ أثناء محاولة تغيير صورة البوت.');
    }
  }
});




client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + 'help')) {
    // التحقق من أن المستخدم لديه الصلاحية للوصول إلى هذه القائمة
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

    // إنشاء Embed لقائمة المساعدة العامة
    const generalEmbed = new MessageEmbed()
      .setColor(config.bot.colorembed)
      .setTitle('📋 قائمة المساعدة - General')
      .setDescription(`
        **[\`${prefix}stock\`]** - عرض عدد المستخدمين
        **[\`${prefix}help\`]** - عرض قائمة المساعدة
        **[\`${prefix}invite\`]** - دعوة البوت
        **[\`${prefix}tax\`]** - حساب ضريبة بروبوت
        **[\`${prefix}coins\`] - لعرض رصيدك او رصيد شخص اخر

`)
      .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

    // إنشاء الأزرار
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('general')
        .setLabel('General')
        .setStyle('SECONDARY'),
      
      new MessageButton()
        .setCustomId('owners')
        .setLabel('Owners')
        .setStyle('SECONDARY'),

      new MessageButton()
        .setLabel('دعوة البوت')
        .setStyle('LINK')
        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${config.bot.ClientId}&permissions=8&scope=bot`)
    );

    // إرسال الرسالة مع الـ Embed والأزرار
    await message.reply({ embeds: [generalEmbed], components: [row] });
  }
});

// الاستماع للتفاعل مع الأزرار (Interaction)
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  // التعامل مع زر General
  if (interaction.customId === 'general') {
    const generalEmbed = new MessageEmbed()
      .setColor(config.bot.colorembed)
      .setTitle('📋 قائمة المساعدة - General')
      .setDescription(`
        **[\`${prefix}stock\`]** - عرض عدد المستخدمين
        **[\`${prefix}help\`]** - عرض قائمة المساعدة
        **[\`${prefix}invite\`]** - دعوة البوت
        **[\`${prefix}tax\`]** - حساب ضريبة بروبوت
        **[\`${prefix}coins\`] - لعرض رصيدك او رصيد شخص اخر
`)
      .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

    await interaction.update({ embeds: [generalEmbed], components: interaction.message.components });
  }

  // التعامل مع زر Owners
  if (interaction.customId === 'owners') {
    if (!config.bot.owners.includes(`${interaction.user.id}`)) {
      // رد مخفي يظهر أن المستخدم ليس لديه الصلاحية
      return interaction.reply({ content: '❌ ليس لديك صلاحية الوصول إلى قائمة الأوامر هذه.', ephemeral: true });
    }

    const ownersEmbed = new MessageEmbed()
      .setColor(config.bot.colorembed)
      .setTitle('🔑 قائمة المساعدة - Owners')
      .setDescription(`

        **[\`${prefix}join {ServerId} {amount}\`]** - الانضمام إلى سيرفر
        **[\`${prefix}refresh\`]** - تحديث المعلومات
        **[\`${prefix}check\`]** - التحقق من حالة معينة
        **[\`${prefix}send\`]** - إرسال رسالة
        **[\`${prefix}price\`]** - وضع سعر اعضاء بلكريديت
       **[\`${prefix}coinprice\`]** - وضع سعر أعضاء بلكوينز
        **[\`${prefix}give\`] - لإعطاء رصيد لشخص
        **[\`${prefix}take\`] - لإزالة رصيد من شخص
`)
      .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

    await interaction.update({ embeds: [ownersEmbed], components: interaction.message.components });
  }
});
var listeners = app.listen(`${config.website.PORT}`, function () {
  console.log("Your app is listening on port " + `${config.website.PORT}`)
});

client.on('ready', () => {
  console.log(`Bot is On! ${client.user.tag}`);
});
client.login(config.bot.TOKEN);
const { AutoKill } = require('autokill')
AutoKill({ Client: client, Time: 5000 })

process.on("uncaughtException" , error => {
return;
})
process.on("unhandledRejection" , error => {
return;
})
process.on("rejectionHandled", error => {
return;
});







client.on('messageCreate', async message => {
  if (!message.content.startsWith(config.bot.prefix) || message.author.bot) return;

  const args = message.content.slice(config.bot.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'setup') {
    if (!config.bot.owners.includes(message.author.id)) {
      return;
    }
    console.log('الأمر setup تم استدعاؤه');

    const channel = message.channel;

    const embed = new MessageEmbed()
      .setTitle('خدمة بيع أعضاء حقيقية')
      .setDescription('* اختر من القائمة أدناه الإجراء الذي تريد تنفيذه')
      .setColor(config.bot.colorembed)
      .setImage('https://cdn.discordapp.com/attachments/1299015547937226762/1309548746467709000/image2.png?ex=6741fbcf&is=6740aa4f&hm=e0d6ca774caacbc425cdf8a75c2782360e8f36a4211d6e03b22525f7c3aa45da&')
      .setThumbnail(message.guild.iconURL())
      .setTimestamp()
      .setFooter({ text: `${message.author.username}`, iconURL: message.author.displayAvatarURL() });

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('service_menu')
        .setPlaceholder('اختر خدمة من القائمة')
        .addOptions([
          {
            label: 'عرض المخزون',
            description: 'عرض عدد الأعضاء المتاحين للبيع',
            value: 'show_stock',
            emoji: '📊'
          },
          {
            label: 'حصول على ايدي السيرفر',
            description: 'الحصول على معرف السيرفر الحالي',
            value: 'get_server_id',
            emoji: '🔍'
          },
          {
            label: 'فتح تذكرة',
            description: 'فتح تذكرة للشراء أو الاستفسار',
            value: 'openticket',
            emoji: '🎟️'
          },
          {
            label: 'رابط دعوة البوت',
            description: 'الحصول على رابط دعوة البوت',
            value: 'bot_invite',
            emoji: '🤖'
          },
          {
            label: 'تحديث القائمة',
            description: 'تحديث رسالة القائمة فقط',
            value: 'refresh_menu',
            emoji: '🔄'
          }
        ])
    );

    try {
      await channel.send({ embeds: [embed], components: [row] });
      console.log('تم إرسال الرسالة بنجاح');
      await message.reply({ content: '**تم إرسال بانل الشراء بنجاح ✅**',ephemeral: true });
    } catch (error) {
      console.error('حدث خطأ أثناء إرسال الرسالة:', error);
      await message.reply({ content: '**حدث خطأ أثناء إرسال الرسالة!**' });
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  
  if (interaction.customId === 'refresh_menu') {
    await interaction.update({}); // تحديث الرسالة نفسها بدون أي تغيير
  }
});
client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return;
  
  if (interaction.values.includes('bot_invite')) {
    const inviteButton = new MessageButton()
      .setLabel('إدخال البوت')
      .setStyle('LINK')
      .setEmoji('🔗')
      .setURL(`https://discord.com/api/oauth2/authorize?client_id=${config.bot.botID}&permissions=8&scope=bot`);
    
    const row = new MessageActionRow().addComponents(inviteButton);
    
    await interaction.reply({ content: 'اضغط على الزر أدناه لإدخال البوت:', components: [row], ephemeral: true });
  }
});

client.on('interactionCreate', async (interaction) => {
  // معالجة اختيار القائمة المنسدلة
  if (interaction.isSelectMenu()) {
    if (interaction.customId === 'service_menu' && interaction.values[0] === 'get_server_id') {
      // إنشاء المودال
      const modal = new Modal()
        .setCustomId('ServerLinkModal')
        .setTitle('أدخل رابط سيرفرك')
        .addComponents(
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId('serverLink')
              .setLabel('أدخل رابط السيرفر')
              .setStyle('SHORT')
              .setPlaceholder('https://discord.gg/example')
              .setRequired(true)
          )
        );

      await interaction.showModal(modal);
    }
  }

  // معالجة إرسال المودال
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'ServerLinkModal') {
      const serverLink = interaction.fields.getTextInputValue('serverLink');
      const inviteCode = serverLink.split('/').pop();

      try {
        const invite = await client.fetchInvite(inviteCode);
        const guild = invite.guild;

        if (guild) {
          return interaction.reply({
            content: `تم استخراج بيانات السيرفر بنجاح:\n\n**🆔 أيدي السيرفر:** \`${guild.id}\`\n**🏷️ اسم السيرفر:** ${guild.name}\n**👥 عدد الأعضاء:** ${guild.memberCount}`,
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error('Error fetching invite:', error);

        const inviteButton = new MessageButton()
          .setStyle('LINK')
          .setLabel('إضافة البوت إلى السيرفر')
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`);

        const actionRow = new MessageActionRow().addComponents(inviteButton);

        return interaction.reply({
          content: '❌ عذرًا، لم أتمكن من العثور على هذا السيرفر.\n\n**الأسباب المحتملة:**\n1. الرابط غير صحيح\n2. ليس لدي صلاحية رؤية السيرفر\n3. السيرفر غير موجود\n\nيرجى إضافة البوت إلى السيرفر المطلوب أولاً:',
          components: [actionRow],
          ephemeral: true,
        });
      }
    }
  }
});



client.on('interactionCreate', async interaction => {
if (!interaction.isButton() && !interaction.isSelectMenu()) return; // التأكد من أن التفاعل زر أو قائمة فقط

  if (interaction.customId === 'openticket' || (interaction.isSelectMenu() && interaction.values.includes('openticket'))) {
  
    // التحقق من أن الفئة (Category) موجودة
    const category = await interaction.guild.channels.cache.get(config.bot.ceatogry);
    if (!category || category.type !== 'GUILD_CATEGORY') {
      return interaction.reply({ content: 'لم يتم العثور على الفئة المحددة.', ephemeral: true });
    }

    const channelSpin = await interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
      type: 'GUILD_TEXT',
      parent: config.bot.ceatogry, // الفئة المحددة
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: ['VIEW_CHANNEL'],
        },
        {
          id: interaction.user.id,
          allow: ['VIEW_CHANNEL'],
        },
      ],
    });

    const ticketEmbed = new MessageEmbed()
      .setTitle('Ticket Buy Members For Your Server')
      .setDescription(`* **${interaction.user} مرحبا بك 👋**\n\n
  **هذه تذكرة شراء الخاصة بك سأوضح لك كيف تشتري**\n\n
  * 1. أولا يجب عليك إضافة البوت من زر \`إضافة البوت\` أسفله \n
  * 2. ثانيا اذهب إلى إعدادات حسابك في خيار \`Advance\` قم بتفعيل \`Developer Mode\` \n
  * 3. قم بنسخ إيدي سيرفرك ثم عد إلى التذكرة و اضغط زر \`شراء أعضاء\` في خانة أولى أدخل الكمية و في خانة ثانية أدخل إيدي سيرفر\n
  ثم اضغط \`Submit\`.\n
  سيقوم البوت بإرسال رسالة لكي تنسخ أمر التحويل وتقوم بالتحويل.\n
  ثم بعد ذلك سيقوم البوت بنظام تلقائي في إدخال الأعضاء إلى خادمك.\n\n
  * **⚠️ ملاحظات مهمة:**\n
  \`-\` يرجى العلم أن التحويل خارج التذكرة يعتبر خطأ ولن يتم تعويضك.\n
  \`-\` التحويل لشخص آخر خطأ منك وأنت تتحمل المسؤولية وليس لنا أي علاقة بك.\n
  \`-\` إذا قمت بالتحويل قبل أن تقوم بإضافة البوت فليس لنا علاقة بك.\n\n
عند انتهائك من الخدمة لا تنسى تقييمنا
فنحن دائمًا نقدم الأفضل 🫡`)
      // .setImage('https://cdn.discordapp.com/attachments/1299015547937226762/1309548746467709000/image2.png?ex=6741fbcf&is=6740aa4f&hm=e0d6ca774caacbc425cdf8a75c2782360e8f36a4211d6e03b22525f7c3aa45da&');

    const ticketRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('buyMembers')
        .setLabel('شراء أعضاء') 
        .setEmoji('👥')
        .setStyle('SECONDARY'),
      new MessageButton()
         .setLabel('شراء أعضاء بالكوينز')
         .setEmoji('🪙')
         .setCustomId('payCoins')
         .setStyle('SECONDARY'),
      new MessageButton()
        .setLabel('إدخال البـوت')
        .setStyle('LINK')
        .setEmoji('🔗')
        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${config.bot.ClientId}&permissions=8&scope=bot`),
      new MessageButton()
        .setCustomId('HOW_BUY')
        .setEmoji('🤔')
        .setStyle('SECONDARY'),
      new MessageButton()
        .setCustomId('closeTicket')
        .setLabel('إغلاق')
        .setEmoji('🗑️')
        .setStyle('SECONDARY')
    );

    // إرسال الرسالة في القناة الجديدة
    await channelSpin.send({
      content: `* ${interaction.user}`,
      embeds: [ticketEmbed],
      components: [ticketRow],
    });

    // تأكيد إنشاء التذكرة
    await interaction.reply({ content: `** تم إنشاء تذكرتك بنجاح : ${channelSpin} ✅ **`, components: [], ephemeral: true });
  }

  
});

// ================================================================

client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu() && !interaction.isButton()) return;

  const isEnglish = interaction.customId === 'english_How' || (interaction.isSelectMenu() && interaction.values.includes('english_How'));

  if (interaction.values?.includes('HOW_BUY') || interaction.customId === 'english_How' || interaction.customId === 'HOW_BUY') {
    const howtoembed = new MessageEmbed()
      .setTitle(isEnglish ? 'How To Buy Real Members 🤔' : 'كيفية شراء أعضاء حقيقية 🤔')
      .setDescription(isEnglish ? 
        `* **Welcome, ${interaction.user} 👋**\n\n
  **This is your purchase ticket. I will guide you on how to make a purchase.**\n\n
  * 1. First, you need to add the bot by clicking the \`Add Bot\` button below. \n
  * 2. Next, go to your account settings in the \`Advanced\` section and enable \`Developer Mode\`. \n
  * 3. Copy your server's ID, then return to the ticket and click the \`Buy Members\` button. In the first field, enter the quantity, and in the second field, enter your server's ID.\n
  Then press \`Submit\`.\n
  The bot will send a message with the transfer command for you to copy and complete the transfer.\n
  After that, the bot will automatically add members to your server.\n\n
  * **⚠️ Important Notes:**\n
  \`-\` Please note that any transfer outside of the ticket will be considered an error and no compensation will be provided.\n
  \`-\` Transferring to someone else is your mistake, and you are responsible for it. We have no involvement.\n
  \`-\` If you make the transfer before adding the bot, we will not be responsible.\n\n
Once you're done with the service, don't forget to rate us.\n
We always provide the best 🫡` 
        :
        `* **${interaction.user} مرحبا بك 👋**\n\n
  ** سأوضح لك كيف تشتري**\n\n
  * 1. أولا يجب عليك إضافة البوت من زر \`إضافة البوت\` أسفله \n
  * 2. ثانيا اذهب إلى إعدادات حسابك في خيار \`Advance\` قم بتفعيل \`Developer Mode\` \n
  * 3. قم بنسخ إيدي سيرفرك ثم عد إلى التذكرة و اضغط زر \`شراء أعضاء\` في خانة أولى أدخل الكمية و في خانة ثانية أدخل إيدي سيرفر\n
  ثم اضغط \`Submit\`.\n
  سيقوم البوت بإرسال رسالة لكي تنسخ أمر التحويل وتقوم بالتحويل.\n
  ثم بعد ذلك سيقوم البوت بنظام تلقائي في إدخال الأعضاء إلى خادمك.\n\n
  * **⚠️ ملاحظات مهمة:**\n
  \`-\` يرجى العلم أن التحويل خارج التذكرة يعتبر خطأ ولن يتم تعويضك.\n
  \`-\` التحويل لشخص آخر خطأ منك وأنت تتحمل المسؤولية وليس لنا أي علاقة بك.\n
  \`-\` إذا قمت بالتحويل قبل أن تقوم بإضافة البوت فليس لنا علاقة بك.\n\n
عند انتهائك من الخدمة لا تنسى تقييمنا
فنحن دائمًا نقدم الأفضل 🫡`
      )
      .setColor('#ffffff')
      .setTimestamp()
      .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

    // زر الترجمة
    const trnrow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(isEnglish ? 'HOW_BUY' : 'english_How') // تبديل اللغة عند الضغط
        .setLabel(isEnglish ? 'العودة للعربية' : 'Translate')
        .setStyle('SECONDARY')
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ embeds: [howtoembed], components: [trnrow] });
     } else {
      await interaction.reply({ embeds: [howtoembed], components: [trnrow], ephemeral: true });
    }
  }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'payCoins') {
            const modal = new Modal()
                .setCustomId('confirmPay')
                .setTitle('شـراء أعضاء حقيقية');

            const countInput = new TextInputComponent()
                .setCustomId('amount2')
                .setLabel("الكمية")
                .setMinLength(1)
                .setMaxLength(5)
                .setStyle('SHORT');

            const serverIdInput = new TextInputComponent()
                .setCustomId('serverid2')
                .setLabel("ايدي سيرفرك")
                .setMinLength(1)
                .setMaxLength(22)
                .setStyle('SHORT');

            const actionRow1 = new MessageActionRow().addComponents(countInput);
            const actionRow2 = new MessageActionRow().addComponents(serverIdInput);
            modal.addComponents(actionRow1, actionRow2);

            await interaction.showModal(modal);
        }
    }

    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'confirmPay') {
        const count = parseInt(interaction.fields.getTextInputValue('amount2')); // عدد الأعضاء
        const serverId = interaction.fields.getTextInputValue('serverid2'); // معرف السيرفر
        const pricePerMember = 1; // سعر كل عضو
        const userId = interaction.user.id; // معرف المستخدم
        const userBalance = getCoins(userId); // جلب رصيد المستخدم
        const totalCost = count * pricePerMember; // التكلفة الإجمالية
        let alld = usersdata.all();

        if (isNaN(count) || count <= 0) {
            return interaction.reply({ content: 'يرجى إدخال كمية صالحة.', ephemeral: true });
        }

        if (!serverId) {
            return interaction.reply({ content: 'يرجى إدخال معرف السيرفر.', ephemeral: true });
        }

        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            return interaction.reply({
                content: `لم يتم العثور على السيرفر. إذا لم يتم إضافة البوت، يمكنك إضافته من هذا الرابط:\n${config.bot.inviteBotUrl}`,
                ephemeral: true
            });
        }
        if (count > alld.length) {
            return interaction.reply({ content: `**هذا العدد لايوجد في المخزون ..**`, ephemeral: true });
        }

        if (userBalance < totalCost) {
            return interaction.reply({
                content: `**:x:, رصيدك الحالي غير كافي : ${userBalance}
رصيد المطلوب : ${totalCost} **`,
                ephemeral: true
            });
        }

        // رسالة تأكيد
        const confirmRow = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('confirmStart')
                .setLabel('تأكيد العملية')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('cancelStart')
                .setLabel('إلغاء العملية')
                .setStyle('DANGER')
        );

        await interaction.reply({
            content: `** هل أنت متأكد من إدخال : ${count} \nعلما أن سعر العضو واحد هو : ${config.bot.coinprice}**`,
            components: [confirmRow],
            ephemeral: true
        });

        // انتظر تفاعل المستخدم مع أزرار التأكيد أو الإلغاء
        const filter = (btnInteraction) =>
            btnInteraction.user.id === userId &&
            (btnInteraction.customId === 'confirmStart' || btnInteraction.customId === 'cancelStart');

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'cancelStart') {
                await btnInteraction.update({
                    content: '❌ **تم إلغاء العملية.**',
                    components: []
                });
                collector.stop();
                return;
            }

            if (btnInteraction.customId === 'confirmStart') {
const message = await btnInteraction.update({
                    content: '🔄 جاري إدخال الأعضاء، يرجى الانتظار...',
                    components: []
                });
                // خصم الرصيد
                setCoins(userId, userBalance - totalCost);

                // متغيرات لتعقب العملية
                let membersAdded = 0;
                let failedCount = 0;

                // تحديث الرسالة إلى "جاري إدخال الأعضاء"
                

                // إدخال الأعضاء
                for (let index = 0; index < count; index++) {
                    try {
                        await oauth.addMember({
                            guildId: guild.id,
                            userId: alld[index].ID, // بيانات الأعضاء
                            accessToken: alld[index].data.accessToken,
                            botToken: client.token
                        });
                        membersAdded++;
                    } catch (err) {
                        failedCount++;
                        console.error(`فشل إدخال العضو رقم ${index + 1}: ${err}`);
                    }
                }
 
                 await interaction.followUp({
                    content: `**✅ تمت العملية بنجاح!**\n**الأعضاء الذين تم إدخالهم:** \`${membersAdded}\`.\n**الأعضاء الذين فشلوا:** \`${failedCount}\`.\n**التكلفة الإجمالية:** \`${totalCost}\` كوين.`,
                ephemeral: true
                });

                // تعويض المستخدم إذا كان هناك فشل
                if (failedCount > 0) {
                    const refundAmount = failedCount * pricePerMember;
                    setCoins(userId, getCoins(userId) + refundAmount);

                    try {
                        await interaction.user.send({
                            content: `**تعويض عن الأعضاء الذين لم يتم إدخالهم:**\n❌ **عدد الأعضاء الفاشلين:** \`${failedCount}\`.\n💰 **تمت إضافة**: \`${refundAmount}\` عملة إلى رصيدك.`
                        });
                    } catch (err) {
                        console.error(`فشل إرسال رسالة خاصة للمستخدم: ${err}`);
                    }
                }
                        collector.stop();
            }
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({
                    content: '⌛ **انتهى وقت التأكيد. لم يتم تنفيذ العملية.**',
                    components: []
                });
            }
        });
    }
});





// ================================================================
client.on(`interactionCreate`,async interaction => {
  if (!interaction.isButton())return ; 
  if (interaction.customId == 'buyMembers'){

    const BuyModal = new Modal()
    .setCustomId('BuyModal')
    .setTitle('شراء اعضاء');
  const Count = new TextInputComponent()
    .setCustomId('Count')
    .setLabel("الكمية")
    .setMinLength(1)
    .setMaxLength(5)
    .setStyle('SHORT'); 
    
    const serverid = new TextInputComponent()
    .setCustomId('serverid')
    .setLabel("ايدي سيرفرك")
    .setMinLength(1)
    .setMaxLength(22)
    .setStyle('SHORT'); 


  const firstActionRow = new MessageActionRow().addComponents(Count);
  const firstActionRow2 = new MessageActionRow().addComponents(serverid);


  BuyModal.addComponents(firstActionRow , firstActionRow2);

  await interaction.showModal(BuyModal);


  } else if (interaction.customId === 'closeTicket') {
      const confirmRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('confirmDelete')
          .setLabel('تأكيد')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('cancelDelete')
          .setLabel('إلغاء')
          .setStyle('DANGER'),
      );

      await interaction.reply({
        content: 'هل أنت متأكد من إغلاق التذكرة؟',
        components: [confirmRow],
        ephemeral: true,
      });

    } else if (interaction.customId === 'confirmDelete') {
      await interaction.update({ content: '**سيتم حذف التذكرة بعد 5 ثواني...**', components: [] });

      setTimeout(async () => {
        const channel = interaction.channel;
        if (channel) await channel.delete();
      }, 5000);

    } else if (interaction.customId === 'cancelDelete') {
      await interaction.update({ content: '** تم إلغاء حذف التذكرة بنجاح **', components: [] });
    }
})



client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId == 'BuyModal') {
    const Count = interaction.fields.getTextInputValue('Count');
    const serverid = interaction.fields.getTextInputValue('serverid');
    const price = config.bot.price;

    const result = Count * price;
    const tax = Math.floor(result * (20 / 19) + 1);

    let alld = usersdata.all();
    let guild = client.guilds.cache.get(serverid);
    let amount = parseInt(Count);

    // التحقق من صحة البيانات
    if (!guild) {
      const errorEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('❌ خطأ في السيرفر')
        .setDescription(`لم يتم العثور على السيرفر \`${serverid}\``)
        .addField('الأسباب المحتملة', '• السيرفر غير موجود\n• البوت غير مضاف للسيرفر\n• الأيدي غير صحيح');
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (amount > alld.length) {
      const limitEmbed = new MessageEmbed()
        .setColor('#FFA500')
        .setTitle('⚠️ حد الطلب تجاوز المخزون')
        .setDescription(`العدد المطلوب (${amount}) أكبر من المتاح (${alld.length})`)
        .addField('الحلول', '• اختر عدد أقل\n• انتظر حتى يتوفر المزيد من الأعضاء');
      
      return interaction.reply({ embeds: [limitEmbed], ephemeral: true });
    }

    // إرسال تفاصيل الدفع
    const paymentEmbed = new MessageEmbed()
      .setColor('#0099FF')
      .setTitle('💳 تفاصيل الدفع')
      .setDescription(`**الرجاء تحويل المبلغ التالي:**`)
      .addFields(
        { name: '🛒 الكمية المطلوبة', value: `${amount} عضو`, inline: true },
        { name: '💰 السعر الإجمالي', value: `${tax} كريدت`, inline: true },
        { name: '📌 رقم التحويل', value: `\`${config.bot.TraId}\``, inline: false }
      )
      .setFooter({ text: 'سيتم إلغاء الطلب تلقائياً بعد 10 دقائق' });

    await interaction.reply({ 
      content: `#credit ${config.bot.TraId} ${tax}`,
      embeds: [paymentEmbed],
      ephemeral: true
    });

    // نظام تتبع الدفع
    const filter = ({ content, author: { id } }) => {
      return (
        content.startsWith(`**:moneybag: | ${interaction.user.username}, has transferred `) &&
        content.includes(config.bot.TraId) &&
        id === "282859044593598464" &&
        (Number(content.slice(content.lastIndexOf("`") - String(tax).length, content.lastIndexOf("`"))) >= result)
      );
    };

    const collector = interaction.channel.createMessageCollector({
      filter,
      max: 1,
      time: 600000 // 10 دقائق
    });

    collector.on('collect', async collected => {
      await interaction.deleteReply().catch(console.error);

      // رسالة التحميل
      const loadingEmbed = new MessageEmbed()
        .setColor('#FFFF00')
        .setDescription('<a:loading:123456789012345678> **جاري معالجة طلبك...**')
        .setFooter({ text: 'قد تستغرق العملية بعض الوقت' });

      const msg = await interaction.channel.send({ embeds: [loadingEmbed] });

      // تنفيذ العملية
      let count = 0;
      for (let index = 0; index < amount; index++) {
        try {
          await oauth.addMember({
            guildId: guild.id,
            userId: alld[index].ID,
            accessToken: alld[index].data.accessToken,
            botToken: client.token
          });
          count++;
        } catch (err) {
          console.error(`Error adding member ${alld[index].ID}:`, err);
        }
      }

      // نتيجة التنفيذ
      const resultEmbed = new MessageEmbed()
        .setColor('#00FF00')
        .setTitle('✅ تمت العملية بنجاح')
        .setDescription(`**تفاصيل الطلب:**`)
        .addFields(
          { name: '🟢 تم إدخال', value: `${count} عضو`, inline: true },
          { name: '🔴 لم يتم إدخال', value: `${amount - count} عضو`, inline: true },
          { name: '🛒 المطلوب أصلاً', value: `${amount} عضو`, inline: true }
        )
        .setFooter({ text: `تمت العملية لـ ${interaction.user.username}` });

      await msg.edit({ embeds: [resultEmbed] });

      // تسجيل في لوغ القناة
      const logEmbed = new MessageEmbed()
        .setColor(config.bot.colorembed || '#2b2d31')
        .setTitle('🛒 عملية شراء جديدة')
        .setDescription(`**تمت عملية شراء أعضاء**`)
        .addFields(
          { name: '👤 العميل', value: interaction.user.tag, inline: true },
          { name: '🆔 الأيدي', value: interaction.user.id, inline: true },
          { name: '🏰 السيرفر', value: guild.name, inline: false },
          { name: '🔢 العدد', value: `${count}/${amount} عضو`, inline: true },
          { name: '💰 القيمة', value: `${tax} كريدت`, inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      const logChannel = client.channels.cache.get(config.bot.channelId);
      if (logChannel) {
        await logChannel.send({ 
          embeds: [logEmbed],
          content: config.bot.LineIce || ''
        });
      }

      // إضافة رتبة للعميل
      if (config.bot.roleId) {
        try {
          const member = await guild.members.fetch(interaction.user.id);
          await member.roles.add(config.bot.roleId);
        } catch (err) {
          console.error('فشل في إضافة الرتبة:', err);
        }
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time' && collected.size === 0) {
        interaction.followUp({
          content: '⏰ انتهى وقت انتظار الدفع، تم إلغاء الطلب تلقائياً',
          ephemeral: true
        }).catch(console.error);
      }
    });
  }
});



client.on('messageCreate', async (message) => {
  if (message.author.bot || !config.bot.taxchannels.includes(message.channelId)) return;

  // التحقق مما إذا كانت الرسالة تحتوي على رقم بصيغة 1k, 1m, 1b, 1B, 1M, 1K
  const regex = /^(\d+)([kKmMbB])?$/;
  const match = message.content.match(regex);

  if (!match) return;

  let number = parseInt(match[1]);
  const suffix = match[2] ? match[2].toLowerCase() : '';

  // تحويل القيم بناءً على اللاحقة
  switch (suffix) {
    case 'k':
      number *= 1000;
      break;
    case 'm':
      number *= 1000000;
      break;
    case 'b':
      number *= 1000000000;
      break;
  }

  try {
    const tax = parseInt(number / 0.95 + 1);
    const tax2 = parseInt(tax / 0.95 + 1);
    const rate = parseInt(number * 0.02);

    const embed = new MessageEmbed()
      .setColor(config.bot.colorembed)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true })) // صورة العضو
      .setDescription(`
        ** 
        > المبلغ كامل : \`${number}\`
        >  المبلغ مع ضريبة بروبوت : \`${tax}\`
        >  المبلغ كامل مع ضريبة الوسيط : \`${tax2}\`
        >  نسبة الوسيط 2% : \`${rate}\`
        >  المبلغ كامل مع ضريبة بروبوت و الوسيط : \`${tax2 + rate}\`
        **`)
      .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }) // اسم العضو وصورته
      .setTimestamp();

    // إرسال الرسالة بالـ embed
    await message.channel.send({ embeds: [embed] });
    await message.channel.send({content:`${config.bot.LineIce}`})

    // مسح الرسالة الأصلية
    await message.delete();

  } catch (error) {
    console.error(error);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // التحقق من أن الرسالة تبدأ بالأمر ${prefix}tax
  if (message.content.startsWith(`${prefix}tax`)) {
    // فصل الأمر عن الرقم
    const args = message.content.split(' ').slice(1).join(' '); // استخراج الرقم بعد ${prefix}tax

    // التحقق من أن المستخدم أدخل رقمًا
    const regex = /^(\d+)([kKmMbB])?$/;
    const match = args.match(regex);

    if (!match) {
      return message.reply('الرجاء إدخال رقم صالح مثل 1K أو 1M أو 1B ❗');
    }

    let number = parseInt(match[1]);
    const suffix = match[2] ? match[2].toLowerCase() : '';

    // تحويل القيم بناءً على اللاحقة
    switch (suffix) {
      case 'k':
        number *= 1000;
        break;
      case 'm':
        number *= 1000000;
        break;
      case 'b':
        number *= 1000000000;
        break;
    }

    try {
      const tax = parseInt(number / 0.95 + 1);
      const tax2 = parseInt(tax / 0.95 + 1);
      const rate = parseInt(number * 0.02);

      const embed = new MessageEmbed()
        .setColor(config.bot.colorembed)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true })) // صورة العضو
        .setDescription(`
          ** 
          > المبلغ كامل : \`${number}\`
          >  المبلغ مع ضريبة بروبوت : \`${tax}\`
          >  المبلغ كامل مع ضريبة الوسيط : \`${tax2}\`
          >  نسبة الوسيط 2% : \`${rate}\`
          >  المبلغ كامل مع ضريبة بروبوت و الوسيط : \`${tax2 + rate}\`
          **`)
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }) // اسم العضو وصورته
        .setTimestamp();

      // إرسال الرسالة بالـ embed
      await message.channel.send({ embeds: [embed] });

      // مسح الرسالة الأصلية

    } catch (error) {
      console.error(error);
    }
  }
});



client.on('messageCreate', async message => {
    // تحقق من أن الرسالة ليست من بوت
    if (message.author.bot) return;

    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

    // تحقق من محتوى الرسالة
    if (message.content.toLowerCase() === 'خط') {
        // حذف الرسالة الأصلية
        await message.delete();

        // الرد برسالة جديدة
        await message.channel.send(config.bot.LineIce);
    }
});



const { joinVoiceChannel } = require('@discordjs/voice');
client.on('ready', () => {

  setInterval(async () => {
    client.channels.fetch(config.bot.VoiceChannelId)
      .then((channel) => {
        const VoiceConnection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator
        });
      }).catch((error) => { return; });
  }, 1000)
});


client.on('messageCreate', async (message) => {
  if (message.content.startsWith(`${config.bot.prefix}price`)) {
    if (!config.bot.owners.includes(message.author.id)) {
      message.reply('لا تملك الصلاحيات لتنفيذ هذا الأمر.');
      return;
    }
    const args = message.content.split(' ');
    if (args.length !== 2) {
      message.reply('قم بوضع سعر الآعضاء صحيح');
      return;
    }
    config.bot.price = args[1];
    fs.writeFileSync('./config.js', `module.exports = ${JSON.stringify(config, null, 2)};`, 'utf-8');

    message.reply(`اصبح سعر الآعضاء **${args[1]}**`);
  }
});

client.on('messageCreate', async (message) => {
  if (message.content.startsWith(`${config.bot.prefix}coinprice`)) {
    if (!config.bot.owners.includes(message.author.id)) {
      message.reply('لا تملك الصلاحيات لتنفيذ هذا الأمر.');
      return;
    }
    const args = message.content.split(' ');
    if (args.length !== 2) {
      message.reply('قم بوضع سعر الكوينز صحيح');
      return;
    }
    config.bot.coinprice = args[1];
    fs.writeFileSync('./config.js', `module.exports = ${JSON.stringify(config, null, 2)};`, 'utf-8');

    message.reply(`اصبح سعر الكوينز **${args[1]}**`);
  }
});
