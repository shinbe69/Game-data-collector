const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const Schema = mongoose.Schema

const GameRecord = new Schema({
    staff_id: String,
    game_level: String,
    duration: Number,
    score: Number,
    total_indications_took: Number,
    createAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('GameRecord', GameRecord)