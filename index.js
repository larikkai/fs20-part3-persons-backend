require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')
var morgan = require('morgan')
const cors = require('cors')

app.use(express.json())

morgan.token('person', function (req) { return '{"name":"'+req.body.name+'","number":"'+req.body.number+'"}' })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

app.use(cors())

app.use(express.static('build'))

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>')
})


app.get('/info', (req, res) => {
  const date = new Date()
  Person.count().then(total => {
    res.send('<div>Phonebook has info for '+total+ ' people</br></br>'+date+ '</div>')
  })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if(person) {
        res.json(person.toJSON())
      }else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

const generateId = () => {
  const id = Math.floor(Math.random() * (999999 - 1)) + 1
  return id
}

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number,
    id: generateId()
  })

  person
    .save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(res.status(204).end())
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number
  }
  console.log(req.params.id)
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})