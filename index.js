// dotenv package is required through npm's "dev" script before running this file in development
// require('dotenv').config()

const express = require('express')
const cors = require('cors')
const Person = require('./models/person')

console.log(process.env.NODE_ENV)
const PORT = process.env.PORT || 3001

const app = express()

app
  .use(cors())
  .use(express.static('build'))
  .use(express.json())

if(process.env.NODE_ENV === 'development') {
  const morgan = require('morgan')
  morgan.token('body', (req) => {
    if(req.method !== 'POST') return null
    return `${JSON.stringify(req.body)}`
  })

  app.use(
    morgan(
      ':method :url :status :res[content-length] - :response-time ms :body'
    )
  )
}

app.get('/info', (_, res, next) => {
  Person.find({})
    .then(people => {
      const time = new Date()
      const template = `<p>Phonebook has info for ${people.length} people</p>\n<p>${time}</p>`
      res.send(template)
    })
    .catch((error) => next(error))
})

app
  .route('/api/persons/:id')
  .get((req, res, next) => {
    Person.findById(req.params.id)
      .then(person => res.json(person))
      .catch((error) => next(error))
  })
  .put((req, res, next) => {
    const { number } = req.body
    Person
      .findByIdAndUpdate(req.params.id, { number }, { new: true, runValidators: true, context: 'query' })
      .then(updatedPerson => res.json(updatedPerson))
      .catch(error => next(error))
  })
  .delete((req, res, next) => {
    Person
      .findByIdAndRemove(req.params.id)
      .then(() => {
        res.status(204).end()
      })
      .catch(error => next(error))
  })

app
  .route('/api/persons')
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

const unknownEndpoint = (_, res) => {res.status(404).send({ error: 'unknown endpoint' })}

const errorHandler = (error, _, res, next) => {
  console.log(error.message)

  if(error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  if(error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

app
  .use(unknownEndpoint)
  .use(errorHandler)
  .listen(PORT, () => {
    console.log(`App is listening on port: ${PORT}`)
  })