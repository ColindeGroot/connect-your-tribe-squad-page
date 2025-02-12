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
const squadResponse = await fetch('https://fdnd.directus.app/items/squad?filter={"_and":[{"cohort":"2425"},{"tribe":{"name":"FDND Jaar 1"}}]}')

// Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
const squadResponseJSON = await squadResponse.json()

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express()); 

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

// Zorg dat werken met request data makkelijker wordt
app.use(express.urlencoded({extended: true}))


// Om Views weer te geven, heb je Routes nodig
// Maak een GET route voor de index
app.get('/', async function (request, response) {
  // Haal alle personen uit de WHOIS API op, van dit jaar
  const personResponse = await fetch('https://fdnd.directus.app/items/person/?sort=name&fields=*,squads.squad_id.name,squads.squad_id.cohort&filter={"_and":[{"squads":{"squad_id":{"tribe":{"name":"FDND Jaar 1"}}}},{"squads":{"squad_id":{"cohort":"2425"}}}]}')

  // En haal daarvan de JSON op
  const personResponseJSON = await personResponse.json()
  
  // personResponseJSON bevat gegevens van alle personen uit alle squads van dit jaar
  // Je zou dat hier kunnen filteren, sorteren, of zelfs aanpassen, voordat je het doorgeeft aan de view

  // Render index.liquid uit de views map en geef de opgehaalde data mee als variabele, genaamd persons
  // Geef ook de eerder opgehaalde squad data mee aan de view
  response.render('index.liquid', {persons: personResponseJSON.data, squads: squadResponseJSON.data})
})

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
app.post('/', async function (request, response) {
  response.redirect(303, '/')
})

app.get('/student/:id', async function (request, response) {
  // Gebruik de request parameter id en haal de juiste persoon uit de WHOIS API op
  const personDetailResponse = await fetch('https://fdnd.directus.app/items/person/' + request.params.id)
  const personDetailResponseJSON = await personDetailResponse.json()
  response.render('student.liquid', {person: personDetailResponseJSON.data, squads: squadResponseJSON.data})
})

app.get('/maand/:id', async function (request, response) {
  // Gebruik de request parameter id en haal de juiste persoon uit de WHOIS API op
  const huidigeMaand = request.params.id
  const personDetailResponse = await fetch(`https://fdnd.directus.app/items/person/?fields=name,birthdate,month(birthdate)&sort=month(birthdate)&filter={%22month(birthdate)%22:${huidigeMaand}}`)
  const personDetailResponseJSON = await personDetailResponse.json()
  console.log(personDetailResponseJSON)
  response.render('partials/maand.liquid', {person: personDetailResponseJSON.data, squads: squadResponseJSON.data})
})


app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`)
})
