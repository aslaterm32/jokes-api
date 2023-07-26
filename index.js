require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const jokes = require('./jokes.json')

const app = express()
const port = process.env.PORT

const keys = ['type', 'setup', 'punchline']
const values = getValues('type', jokes)

app.use(cors())
app.use('/jokes', express.json())

app.get('/', (req, res) => {
    res.status(200).send('Jokes API')
})

app.get('/jokes', (req, res) => {
    res.status(200).send(jokes)
})

app.post('/jokes', (req, res) => {
    const joke = makeKeysLowerCase(req.body)

    if (!(Object.keys(joke).toString() === keys.toString())) {
        res.status(400).send('400 - Invalid key(s)')
    } else if (!joke.type || !joke.setup || !joke.punchline) {
        res.status(400).send('400 - No value(s) given')
    } else if (!values.includes(joke.type)) {
        res.status(400).send('400 - Invalid type')
    } else if (jokes.includes(joke)) {
        res.status(400).send('400 - Already exists!')
    } else {
        try {
            jokes.push(joke)
            fs.writeFile('./jokes.json', JSON.stringify(jokes), (e) => {
                console.log(e)
            })
            res.status(200).send(joke)
        } catch {
            res.status(500).send('500 - Internal server error')
        }
    }
})

app.get('/jokes/random', (req, res) => {
    const joke = getRandomItem(jokes)
    res.status(200).send(joke)
})

app.get('/jokes/:type', (req, res) => {
    const type = req.params.type.toLowerCase()
    const result = jokes.filter((joke) => joke.type.toLowerCase() === type)
    if (result.length === 0) {
        res.status(400).send('400 - Invalid type')
    } else {
        res.status(200).send(result)
    }
})

app.listen(port, () => {
    console.log(`App running on port: ${port}`)
})

function getRandomItem(arr) {
    const index = Math.floor(Math.random() * arr.length)
    return arr[index]
}

function getValues(key, arr) {
    const types = arr.map((obj) => obj[key])

    const values = []
    for (let i = 0; i < types.length; i++) {
        if (!values.includes(types[i])) {
            values.push(types[i])
        }
    }

    return values
}

function makeKeysLowerCase(obj) {
    const newObj = {}
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
        newObj[keys[i].toLowerCase()] = obj[keys[i]]
    }
    return newObj
}
