// dotenv package is required through dev script before running this file in development
// require('dotenv').config()

const express = require('express')
const cors = require('cors')
const Person = require('./models/person')

console.log(process.env.NODE_ENV)
const PORT = process.env.PORT || 3001

const app = express()

app
  .use(cors())
  .use(express.static("build"))
  .use(express.json())

// if(process.env.NODE_ENV === "development") {
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
    ].join(" ")
  }

  app.use(morgan(loggerFormat))
// }

app.get('/info', (_, res) => {
  Person.find({})
    .then(people => {
      const time = new Date()
      const template = `<p>Phonebook has info for ${people.length} people</p>\n<p>${time}</p>`
      res.send(template)
    })
    .catch((error) => next(error));
})

app
  .route("/api/persons/:id")
  .get((req, res, next) => {
    Person.findById(req.params.id)
      .then(person => res.json(person))
      .catch((error) => next(error))
  })
  .put((req, res, next) => {
    const { number } = req.body
    Person
      .findByIdAndUpdate(req.params.id, { number }, { new: true })
      .then(updatedPerson => res.json(updatedPerson))
      .catch(error => next(error))
  })
  .delete((req, res, next) => {
    Person
      .findByIdAndRemove(req.params.id)
      .then(result => {
        res.status(204).end()
      })
      .catch(error => next(error))
  })

app
  .route("/api/persons")
  .get((_, res, next) => {
    Person
      .find({})
      .then(people => res.json(people))
      .catch(error => next(error))
  })
  .post((req, res, next) => {
    const newEntry = new Person(req.body)
    
    newEntry
      .save()
      .then(addedPerson => res.status(201).json(addedPerson))
      .catch(error => next(error))
  })

const unknownEndpoint = (_, res) => {res.status(404).send({ error: "unknown endpoint" })}

const errorHandler = (error, _, res, next) => {
  console.log(error.message)

  if(error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" })
  } 

  next(error)
}

app
  .use(unknownEndpoint)
  .use(errorHandler)
  .listen(PORT, () => {
    console.log(`App is listening on port: ${PORT}`)
  })