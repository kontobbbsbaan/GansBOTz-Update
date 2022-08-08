const { default: makeWASocket, BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, downloadContentFromMessage, downloadHistory, proto, getMessage, generateWAMessageContent, prepareWAMessageMedia } = require('@adiwajshing/baileys')
let fs = require('fs')
let path = require('path')
let levelling = require('../lib/levelling')
let tags = {
  'rpgabsen': '𝗥𝗣𝗚-𝗔𝗕𝗦𝗘𝗡',
  'rpg': '𝗥𝗣𝗚',
  'game': '𝗚𝗔𝗠𝗘',
  'xp': '𝗘𝗫𝗣-𝗟𝗜𝗠𝗜𝗧',
  'asupan': '𝗔𝗦𝗨𝗣𝗔𝗡',
  'sticker': '𝗦𝗧𝗜𝗖𝗞𝗘𝗥',
  'main': '𝗠𝗔𝗜𝗡',
  'kerang': '𝗞𝗘𝗥𝗔𝗡𝗚 𝗠𝗘𝗡𝗨',
  'quotes': '𝗤𝗨𝗢𝗧𝗘𝗦',
  'group': '𝗚𝗥𝗨𝗣-𝗠𝗘𝗡𝗨',
  'internet': '𝗜𝗡𝗧𝗘𝗥𝗡𝗘𝗧',
  'anonymous': '𝗔𝗡𝗢𝗡𝗬𝗠𝗢𝗨𝗦',
  'downloader': '𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥',
  'berita': '𝗕𝗘𝗥𝗜𝗧𝗔',
  'tools': '𝗧𝗢𝗢𝗟𝗦',
  'nsfw': '𝗡𝗦𝗙𝗪',
  'fun': '𝗙𝗨𝗡-𝗠𝗘𝗡𝗨',
  'anime': '𝗔𝗡𝗜𝗠𝗘 𝗠𝗘𝗡𝗨',
  'vote': '𝗩𝗢𝗧𝗜𝗡𝗚-𝗠𝗘𝗡𝗨',
  'absen': '𝗔𝗕𝗦𝗘𝗡',
  'catatan': '𝗖𝗔𝗧𝗔𝗧𝗔𝗡',
  'jadian': '𝗝𝗔𝗗𝗜𝗔𝗡',
  'islami': '𝗜𝗦𝗟𝗔𝗠𝗜',
  'owner': '𝗢𝗪𝗡𝗘𝗥-𝗠𝗘𝗡𝗨',
  'advanced': '𝗞𝗛𝗨𝗦𝗨𝗦',
  'info': '𝗜𝗡𝗙𝗢',
  'audio': '𝗔𝗨𝗗𝗜𝗢',
  'maker': '𝗠𝗔𝗞𝗘𝗥',
}
let iggw = `https://saweria.co/Kianganz`
let own = `https://wa.me/6283845409710`

const defaultMenu = {
  before: `
%readmore`.trimStart(),
  header: '⃝▣──「 %category 」───⬣',
  body: '│ ○ %cmd %islimit %isPremium',
  footer: '▣────────────⬣\n',
  after: `
*%npmname@^%version*
${'```%npmdesc```'}
`,
}
let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let package = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}'))
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    else who = m.sender 
    let user = global.db.data.users[who]
    let { exp, limit, level, money, role } = global.db.data.users[m.sender]
    let { min, xp, max } = levelling.xpRange(level, global.multiplier)
    let name = conn.getName(m.sender)
    let d = new Date(new Date + 3600000)
    let locale = 'id'
    // d.getTimeZoneOffset()
    // Offset -420 is 18.00
    // Offset    0 is  0.00
    // Offset  420 is  7.00
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d)
    let time = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
    let _uptime = process.uptime() * 1000
    let _muptime
    if (process.send) {
      process.send('uptime')
      _muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    let muptime = clockString(_muptime)
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled,
      }
    })
    for (let plugin of help)
      if (plugin && 'tags' in plugin)
        for (let tag of plugin.tags)
          if (!(tag in tags) && tag) tags[tag] = tag
    conn.menu = conn.menu ? conn.menu : {}
    let before = conn.menu.before || defaultMenu.before
    let header = conn.menu.header || defaultMenu.header
    let body = conn.menu.body || defaultMenu.body
    let footer = conn.menu.footer || defaultMenu.footer
    let after = conn.menu.after || (conn.user.jid == global.conn.user.jid ? '' : `Powered by https://wa.me/${global.conn.user.jid.split`@`[0]}`) + defaultMenu.after
    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
                .replace(/%islimit/g, menu.limit ? '🅛' : '')
                .replace(/%isPremium/g, menu.premium ? '🅟' : '')
                .trim()
            }).join('\n')
          }),
          footer
        ].join('\n')
      }),
      after
    ].join('\n')
    text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : ''
    let replace = {
      '%': '%',
      p: _p, uptime, muptime,
      me: conn.user.name,
      npmname: package.name,
      npmdesc: package.description,
      version: package.version,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      github: package.homepage ? package.homepage.url || package.homepage : '[unknown github url]',
      level, limit, money, name, weton, week, date, dateIslamic, time, totalreg, rtotalreg, role,
      readmore: readMore
    }
    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])
    
    const menu2nih = `
╭───❏ 「 𝗜𝗡𝗙𝗢 𝗨𝗦𝗘𝗥 」
│𝗡𝗔𝗠𝗔 : ${name}
│𝗟𝗜𝗠𝗜𝗧 : ${limit}
│𝗟𝗘𝗩𝗘𝗟* : ${level}
│𝗘𝗫𝗣   : ${exp}
│𝗥𝗢𝗟𝗘   : ${role}
╰──────────────◩
╭───❏「 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 」
│𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: ${global.namabot}
│𝗨𝗣𝗧𝗜𝗠𝗘: ${uptime}
│𝗠𝗢𝗗𝗘: ${global.opts['self'] ? 'Self' : 'publik'}
│𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘: ${rtotalreg}
╰──────────────◩`
     const template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
     templateMessage: {
         hydratedTemplate: {
           hydratedContentText: menu2nih.trim(),
           locationMessage: { 
           jpegThumbnail: fs.readFileSync('./src/welcome.jpg') },
           hydratedFooterText: `INFO CMD\nⓁ LIMIT\nⓅ PREMIUM`,
           hydratedButtons: [{
             urlButton: {
               displayText: 'Saweria',
               url: iggw
             }

           },
             {
             urlButton: {
               displayText: 'Contact Owner',
               url: own
             }

           },
           {
             quickReplyButton: {
               displayText: 'ALL Menu',
               id: '.allmenu',
             }
           }]
         }
       }
     }), { userJid: m.sender, quoted: m });
    //conn.reply(m.chat, text.trim(), m)
   let audio = fs.readFileSync('./mp3/Play-Date-Melanie-Martinez-Cover-by-邢凯悦XKY.opus')
   await conn.sendFile(m.chat, audio, 'error.mp3', null, m, true)
    return await conn.relayMessage(
         m.chat,
         template.message,
         { messageId: template.key.id }
     )
  } catch (e) {
    conn.reply(m.chat, 'Maaf, menu sedang error', m)
    throw e
  }
 
}
handler.help = ['menu','m']
handler.tags = ['main']
handler.command = /^(menu|m)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null
handler.exp = 3

module.exports = handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
function ucapan() {
        const hour_now = moment.tz('Asia/Jakarta').format('HH')
        var ucapanWaktu = 'Pagi kak'
        if (hour_now >= '03' && hour_now <= '10') {
          ucapanWaktu = 'Siang kak'
        } else if (hour_now >= '10' && hour_now <= '15') {
          ucapanWaktu = 'Sore kak'
        } else if (hour_now >= '15' && hour_now <= '17') {
          ucapanWaktu = 'Sore kak'
        } else if (hour_now >= '17' && hour_now <= '18') {
          ucapanWaktu = 'Selamat Malam kak'
        } else if (hour_now >= '18' && hour_now <= '23') {
          ucapanWaktu = 'Malam kak'
        } else {
          ucapanWaktu = 'Selamat Malam!'
        }	
        return ucapanWaktu
}
