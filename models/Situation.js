const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Situation = new Schema({
    content: String,
    correct_answer: String,
    createAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Situation', Situation)