const mongoose = require('mongoose')
const Schema = mongoose.Schema

const IndicationType = new Schema({
    type: String,
    before: String,
    after: String,
    before_explain: String,
    after_explain: String,
    createAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('IndicationType', IndicationType)