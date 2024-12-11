const express = require('express')
const app = express()
const path = require('path')
app.use(express.json())
require('dotenv').config()
const { isConnect } = require('./db/connectDB')
const Situation = require('./models/Situation')

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/dataCollector.html'))
})

app.post('/send-data', async (req, res) => {
    console.log('data:', req.body)
    let result = await Situation.create({ content: req.body.situation, correct_answer: req.body.correct_answer })
    console.log(result)
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