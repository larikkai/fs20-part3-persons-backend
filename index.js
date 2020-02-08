const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')

app.use(express.json())

morgan.token('person', function (req) { return '{"name":"'+req.body.name+'","number":"'+req.body.number+'"}' })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

app.use(cors())

app.use(express.static('build'))

let persons = [
    {
        name: "Arto Hellas",
        number: "040-1231244",
        id: 1
    },
    {
        name: "Ada Lovelance",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-23232323",
        id: 3
    },
    {
        name: "Mary Peppendieck",
        number: "39-23-6423122",
        id: 4
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person){
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) =>{
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

const generateId = () => {
    //const maxId = persons.length > 0 ? Math.max(...persons.map(p => p.id)) : 0
    //return maxId + 1

    const id = Math.floor(Math.random() * (999999 - 1)) + 1
    return id
}

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name) {
        return res.status(400).json({
            error: 'name missing'
        })
    }

    if (!body.number) {
        return res.status(400).json({
            error: 'number missing'
        })
    }

    if (persons.some(person => person.name === body.name)) {
        return res.status(400).json({
            error: 'phonebook already constains persons information'
        })
    }


    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    res.json(person)
})

app.get('/info', (req, res) => {
    const value = persons.length
    const date = new Date()

    res.send('Phonebook has info for ' + value + ' people </br><br>'+ date)
})
  
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})