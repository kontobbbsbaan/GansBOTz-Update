let fetch = require('node-fetch')
let handler = async(m, { conn }) => {
m.reply('1 Limit Digunakan')
  let res = await fetch('https://api.waifu.pics/sfw/waifu')
  if (!res.ok) throw await res.text()
  let json = await res.json()
  if (!json.url) throw 'Error!'
  conn.sendFile(m.chat, json.url, '', 'Istri Gwej', m)
}
handler.help = ['waifu']
handler.tags = ['anime']
handler.command = /^(waifu)$/i
handler.limit = true
//MADE IN ERPAN 1140 BERKOLABORASI DENGAN BTS
module.exports = handler
