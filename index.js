require('dotenv').config()
const { response } = require('express')
const express = require('express')

const PORT = process.env.PORT

const persons = [
  {
    name: "Dan Abramov",
    number: "567056-5675",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
  {
    name: "Esteban Agostini",
    number: "234532-34535",
    id: 6,
  },
  {
    name: "Oscar Jauregui",
    number: "2345-234523",
    id: 7,
  },
  {
    name: "Katiuska",
    number: "90345-2345",
    id: 8,
  },
]

const app = express()

app
  .get('/info', (req, res) => {
    const phonebookSize = persons.length
    const time = new Date()
    
    const template = `
    <p>Phonebook has info for ${phonebookSize} people</p>
    <p>${time}</p>
    `
    res.send(template)
  })
  .get('/api/persons', (req, res) => {
    res.json(persons)
  })
  .listen(PORT, () => {
    console.log(`App is listening on port: ${PORT}`)
  })