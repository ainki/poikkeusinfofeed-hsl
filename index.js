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
  poikkeuscheck(1)
})

var j = schedule.scheduleJob('15 1 * * * *', function () {
  historycheck()
})

// Functions

function poikkeuscheck(moodi) {

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

      // console.log("[info] Haetaan poikkeuksia")

      // Käy läpi jokaisen alertin
      for (i = 0; i < alerts.length; i += 1) {
        alert = alerts[i]
        mode = modes[i]
        if (poikkeukset.indexOf(alert) === -1) {
          console.log("[info]  Uusi poikkeus: " + alert)
          poikkeukset.push(alert)
          var viesti
          // Lyhennetään viestejä
          alert = alert.replace('Lähijuna ', '')
          alert = alert.replace('Lähijunat: ', '')
          alert = alert.replace('Helsingin sisäisen liikenteen linja ', '')
          alert = alert.replace('Helsingin sisäisen liikenteen linjat: ', '')
          alert = alert.replace('Espoon sisäisen liikenteen linja ', '')
          alert = alert.replace('Espoon sisäisen liikenteen linjat: ', '')
          alert = alert.replace('Vantaan sisäisen liikenteen linja ', '')
          alert = alert.replace('Vantaan sisäisen liikenteen linjat: ', '')
          alert = alert.replace('Keravan sisäisen liikenteen linja ', '')
          alert = alert.replace('Keravan sisäisen liikenteen linjat: ', '')
          alert = alert.replace('Kirkkonummen sisäisen liikenteen linja ', '')
          alert = alert.replace('Kirkkonummen sisäisen liikenteen linjat:', '')
          alert = alert.replace('Seutuliikenteen linja ', '')
          alert = alert.replace('Seutuliikenteen linjat: ', '')
          alert = alert.replace('Raitiolinja ', '')
          alert = alert.replace('Raitiolinjat: ', '')
          alert = alert.replace('Metro ', '')

          // Viestin alkuun merkki
          if (mode == "BUS") {
            viesti = "Ⓑ " + alert
          } else if (mode == "SUBWAY") {
            viesti = "Ⓜ " + alert
          } else if (mode == "TRAM") {
            viesti = "Ⓡ " + alert
          } else if (mode == "RAIL") {
            viesti = "Ⓙ " + alert
          } else if (mode == "FERRY") {
            viesti = "Ⓛ " + alert
          } else {
            viesti = alert
          }
          // Jos ei ensinmäinen haku
          if (moodi == 1) {
            bot.sendMessage(channelID, viesti)
          }
        } else {
          // Älä tee mitään - Vanha poikkeus
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
          console.log("[info]  Poistetaan historiasta: " + poikkeus)
          poikkeukset.splice(i, 1)
        } else {
          // Älä tee mitään
        }
      }
    })
}

// Käynnistyshaku (ei lähetä viestejä)
poikkeuscheck()