const express = require('express')
const cors = require('cors')
const app = express()
const path = require('path')
app.use(express.json())
require('dotenv').config()
const { isConnect } = require('./db/connectDB')
const Situation = require('./models/Situation')

app.use(cors())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/dataCollector.html'))
})

app.post('/data', async (req, res) => {
    let result = await Situation.create({ content: req.body.situation, correct_answer: req.body.correct_answer })
    if (result) res.json(result)
    else res.sendStatus(500)
})

app.get('/list', async (req, res) => {
    let result = await Situation.find({})
    res.json(result)
})

app.get('/data', async (req, res) => {
    let result = await Situation.aggregate([{ $sample: { size: 1 } }])
    res.json(result)
})

isConnect
.then(() => {
    console.log('*** Connected to the database! ***')
    app.listen(process.env.PORT, process.env.HOST, () => {
        console.log('*** API server is now ready at port', process.env.PORT, 'on', process.env.HOST, '***')
    })
})
.catch(() => {
    console.log('*** Connecting to the database fail! ***')
})