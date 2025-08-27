const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Player = new Schema({
    staff_id: String,
    name: String,
    department: String,
    createAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Player', Player)