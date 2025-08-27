const express = require('express')
const cors = require('cors')
const app = express()
const path = require('path')
app.use(express.json())
require('dotenv').config()
const { isConnected, isConnectMongo, sql } = require('./db/connectDB')
const router = require('./routing/router')

app.use(cors())
app.use(router)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/formnhap.html'))
})


isConnected
.then(() => {
    console.log('*** Connected to the SQL Server database! ***')
    isConnectMongo
    .then(() => {
        console.log('*** Connected to the Mongo database! ***')
        app.listen(process.env.PORT, process.env.HOST, () => {
            console.log('*** API server is now ready at port', process.env.PORT, 'on', process.env.HOST, '***')
        })
    })
    .catch(() => {
        console.log('*** Connecting to the Mongo database fail! ***')
    })
})
.catch(() => {
    console.log('*** Connecting to the SQL Server database fail! ***')
})