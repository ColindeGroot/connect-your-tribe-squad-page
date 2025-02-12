// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';

// Je kunt de volgende URLs uit onze API gebruiken:
// - https://fdnd.directus.app/items/tribe
// - https://fdnd.directus.app/items/squad
// - https://fdnd.directus.app/items/person
// Gebruik hiervoor de documentatie van https://directus.io/docs/guides/connect/query-parameters
// En de oefeningen uit https://github.com/fdnd-task/connect-your-tribe-squad-page/blob/main/docs/squad-page-ontwerpen.md

// Haal alle eerstejaars squads uit de WHOIS API op van dit jaar (2024–2025)
const squadResponse = await fetch('https://fdnd.directus.app/items/squad?filter={"_and":[{"cohort":"2425"},{"name":"1G"}]}')
const squadResponseJSON = await squadResponse.json()

const app = express()
app.use(express.static('public'))

const engine = new Liquid();
app.engine('liquid', engine.express()); 
app.set('views', './views')

app.use(express.urlencoded({extended: true}))


//index
app.get('/', async function (request, response) {
  const personResponse = await fetch('https://fdnd.directus.app/items/person/?sort=name&fields=*,squads.squad_id.name,squads.squad_id.cohort&filter={"_and":[{"squads":{"squad_id":{"tribe":{"name":"FDND Jaar 1"}}}},{"squads":{"squad_id":{"cohort":"2425"}}}]}')
  const personResponseJSON = await personResponse.json()
  
  response.render('index.liquid', {persons: personResponseJSON.data, squads: squadResponseJSON.data})
})

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
app.post('/', async function (request, response) {
  response.redirect(303, '/')
})

app.get('/maand/:id', async function (request, response) {
  // Gebruik de request parameter id en haal de juiste persoon uit de WHOIS API op
  const huidigeMaand = request.params.id
  const personDetailResponse = await fetch(`https://fdnd.directus.app/items/person/?fields=name,birthdate,avatar,month(birthdate),squads.squad_id.name&sort=month(birthdate)&filter={"_and":[{"month(birthdate)":${huidigeMaand}},{"squads":{"squad_id":{"name":"1G"}}}]} `)

  const personDetailResponseJSON = await personDetailResponse.json();
  console.log(personDetailResponseJSON)
  response.render('maand.liquid', {persons: personDetailResponseJSON.data, squads: squadResponseJSON.data})

})

// nog niet in gebruik
// app.get('/student/:id', async function (request, response) {
//   // Gebruik de request parameter id en haal de juiste persoon uit de WHOIS API op
//   const personDetailResponse = await fetch('https://fdnd.directus.app/items/person/' + request.params.id)
//   const personDetailResponseJSON = await personDetailResponse.json()
//   response.render('student.liquid', {person: personDetailResponseJSON.data, squads: squadResponseJSON.data})
// })



app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`)
})
