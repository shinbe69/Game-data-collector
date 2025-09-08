const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const Schema = mongoose.Schema

const Indication = new Schema({
    action: String,
    typeBefore: {type: ObjectId, ref: "IndicationType"},
    typeAfter: {type: ObjectId, ref: "IndicationType"},
    isDirty: Boolean,
    createAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Indication', Indication)