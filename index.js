// index.js

// Vaatimukset
const bot = require('./bot')
var channelID = -1001181091249;
let poikkeukset = [];
var digiAPI = 'http://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

// NPM
var jp = require('jsonpath');
var schedule = require('node-schedule');
const { request } = require('graphql-request')

require('console-stamp')(console, 'HH:MM:ss'); //Aikaleimat logiin

// Ajastimet

var j = schedule.scheduleJob('1 * * * * *', function () {
  poikkeuscheck()
})

var j = schedule.scheduleJob('30 1 * * * *', function () {
  historycheck()
})

// Functions

function poikkeuscheck() {

  //graphQL hakulause
  const query = `{
    alerts {
      alertDescriptionText
      route {
        gtfsId
        mode
      }
      }
}`

  return request(digiAPI, query)
    .then(function (data) {
      var vastaus = JSON.stringify(data);

      var alerts = jp.query(data, '$..alertDescriptionText')
      var modes = jp.query(data, '$..mode')

      console.log("[info] Haetaan poikkeuksia")

      // Käy läpi jokaisen alertin
      for (i = 0; i < alerts.length; i += 1) {
        alert = alerts[i]
        mode = modes[i]
        if (poikkeukset.indexOf(alert) === -1) {
          // console.log("[info] Uusi poikkeus.")
          poikkeukset.push(alert)
          var viesti
          alert = alert.replace('Lähijunat: ', '')
          alert = alert.replace('Lähijuna ', '')
          alert = alert.replace('Helsingin sisäisen liikenteen linja ', '')
          alert = alert.replace('Espoon sisäisen liikenteen linja ', '')
          alert = alert.replace('Vantaan sisäisen liikenteen linja ', '')
          alert = alert.replace('Keravan sisäisen liikenteen linja ', '')
          alert = alert.replace('Raitiolinja ', '')
          alert = alert.replace('Raitiolinjat: ', '')

          if (mode == "BUS") {
            viesti = "Ⓑ " + alert
          } else if (mode == "SUBWAY") {
            viesti = "Ⓜ " + alert
          } else if (mode == "TRAM") {
            viesti = "Ⓡ " + alert
          } else if (mode == "TRAIN") {
            viesti = "Ⓙ " + alert
          } else if (mode == "FERRY") {
            viesti = "Ⓛ " + alert
          } else {
            viesti = alert
          }

          bot.sendMessage(channelID, viesti)
        } else {
          // Älä tee mitään
          //console.log("[info] Vanha poikkeus.")
        }
      }
      // console.log(poikkeukset)
    });
}


function historycheck() {
  //graphQL hakulause
  const query = `{
    alerts {
      alertDescriptionText
      }
    }`
  return request(digiAPI, query)
    .then(function (data) {
      var alerts = jp.query(data, '$..alertDescriptionText')
      console.log("[info] Tarkistetaan historia")
      for (i = 0; i < poikkeukset.length; i += 1) {
        var poikkeus = poikkeukset[i];
        // Jos API:sta ei löydy enään poikkeusta se poistetaa poikkeuksista
        if (alerts.indexOf(poikkeus) === -1) {
          poikkeukset.splice(i, 1)
        } else {
          // Älä tee mitään
        }
      }
    })
}
