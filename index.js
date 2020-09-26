// dotenv package is required through dev script before running this file in development
// require('dotenv').config()

const express = require('express')
const cors = require('cors')

console.log(process.env.NODE_ENV);
const PORT = process.env.PORT || 3001

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

const app = express();

app
  .use(express.static("build"))
  .use(cors())
  .use(express.json())

if(process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
  
  morgan.token('body', (req) => {
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
  }

  app.use(morgan(loggerFormat));
}

app.get('/info', (_, res) => {
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

    let deletedIdx;
    persons = persons.filter(({ id }, idx) => {
      if(id !== reqId) {
        return true
      } else {
        deletedIdx = idx
        return false
      }
    })
    if(deletedIdx === undefined) return res.status(404).end()

    return res.json({ data: 'Person deleted!' })
  })

app
  .route("/api/persons")
  .get((_, res) => {
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
    
    return res.status(201).json(newEntry)
  })

app.listen(PORT, () => {
 console.log(`App is listening on port: ${PORT}`)
})