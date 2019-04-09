//
//  Poikkeusinfofeedbot (HSL)
//

//NPM
const TeleBot = require('telebot');

//Heroku token
var token = process.env.token;

//BotToken
const bot = new TeleBot({
    token: `${token}`,
});

module.exports = bot;