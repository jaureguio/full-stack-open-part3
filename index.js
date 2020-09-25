require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

const PORT = process.env.PORT

let persons = [
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

morgan.token('body', (req, res) => {
  if(req.method !== 'POST') return null
  return `${JSON.stringify(req.body)}`
})

const loggerFormat = (tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    tokens.body(req, res),
  ].join(" ");
};

const app = express()

app
  .use(express.json())
  .use(morgan(loggerFormat));

app.get('/info', (req, res) => {
  const phonebookSize = persons.length
  const time = new Date()
  
  const template = `
  <p>Phonebook has info for ${phonebookSize} people</p>
  <p>${time}</p>
  `
  res.send(template)
})

app
  .route("/api/persons/:id")
  .get((req, res) => {
    const reqId = Number(req.params.id)

    const person = persons.find(({ id }) => id === reqId)

    if (!person) {
      return res.status(404).json({ error: "No person found" })
    }

    return res.json(person)
  })
  .delete((req, res) => {
    const reqId = Number(req.params.id)

    persons = persons.filter(({ id }) => id !== reqId)

    return res.json({ message: 'Person deleted!' })
  })

app
  .route("/api/persons")
  .get((req, res) => {
    return res.json(persons)
  })
  .post((req, res) => {
    const newEntry = req.body

    if(!newEntry.name || !newEntry.number) {
      return res.status(400).json({ error: 'person name or number missing'})
    }

    const isUnique = persons.some(({ name }) => name === newEntry.name)

    if(isUnique) {
      return res.status(403).json({ error: 'name must be unique'})
    }

    const generateId = (length = 100000) => {
      return length + Math.floor(Math.random()*length)
    }

    newEntry.id = generateId()
    persons.push(newEntry)
    
    return res.status(201).json({ message: `${newEntry.name} was added!`})
  })

app.listen(PORT, () => {
 console.log(`App is listening on port: ${PORT}`)
})