const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const Schema = mongoose.Schema

const Indication = new Schema({
    action: String,
    type: {type: ObjectId, ref: "IndicationType"},
    createAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Indication', Indication)