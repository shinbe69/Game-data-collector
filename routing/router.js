const express = require('express')
const crypto = require('node:crypto')
const router = express.Router()
const {sql} = require('../db/connectDB')
const { ObjectId } = require('mongodb')
const Player = require('../models/Player')
const Indication = require('../models/Indication')
const IndicationType = require('../models/IndicationType')
const GameRecord = require('../models/GameRecord')

router.post('/login', async (req, res) => {
    let { username, password } = req.body
    if (typeof username !== 'string' || typeof password !== 'string') res.sendStatus(400)
    else {
        let account = await sql.query(`SELECT * FROM TaiKhoan WHERE taiKhoan = '${ username }'`)
        if (account.recordset.length == 0) res.sendStatus(401)
        else {
            let validPassword = account.recordset[0].matKhau
            let hashPassword = Buffer.from(password, 'utf8')
            let i = 0
            while (i < 3) {
                md5 = crypto.createHash('md5');
                hashPassword = md5.update(hashPassword).digest();
                i++
            }
            let hashHex = hashPassword.toString('hex')
            if (validPassword === hashHex) {
                let user = await sql.query(`SELECT * FROM HoSoNhanVien WHERE maNhanVien = '${ account.recordset[0].maNhanVien }'`)
                res.json(user.recordset[0])
            }
            else res.sendStatus(401)
        }
    }
})

router.post('/data-from-form', async (req, res) => {
    console.log(req.body.indication, req.body.indicationTypeBefore, req.body.indicationTypeAfter, req.body.isDirty)
    let result = await Indication.create({ action: req.body.indication, typeBefore: req.body.indicationTypeBefore, typeAfter: req.body.indicationTypeAfter, isDirty: req.body.isDirty })
    if (result) res.json(result)
    else res.sendStatus(500)
})

router.post('/data', async (req, res) => {
    const {username} = req.body
    const player = await Player.find({staff_id: username})
    res.json(player ? player[0] : null)
})

router.get('/update-staff', async (req, res) => {
    const staffs = await sql.query(`SELECT maNhanVien AS staff_id, CONCAT(hoDem, ten) AS name, KhoaPhong.tenKhoa AS department
        FROM HoSoNhanVien INNER JOIN KhoaPhong
        ON khoaPhong = KhoaPhong.maKhoa`)
    let countUpdated = 0
    for await (const staff of staffs.recordset) {
        const player = await Player.find({staff_id: staff.staff_id})
        if (player.length === 0) {
            const playerCreating = await Player.create({staff_id: staff.staff_id, name: staff.name, department: staff.department})
            if (playerCreating) countUpdated++
        }
    }
    res.json({numberOfPlayerCreated: countUpdated})
})
router.get('/indication-type', async (req, res) => {
    const indicationType = await IndicationType.find({})
    res.json(indicationType)
})
router.get('/simple-indication', async (req, res) => {
    const indications = await Indication.find({})
    res.json(indications)
})
router.get('/indication', async (req, res) => {
    const indications = await Indication.find({}).lean()
    const indicationTypes = await IndicationType.find({})
    const babyRelatedIndications = []
    const adultRelatedIndications = []
    for await (const indication of indications) {
        const indicationTypeBefore = indicationTypes.find(item => item._id.equals(indication.typeBefore))
        const indicationTypeAfter = indicationTypes.find(item => item._id.equals(indication.typeAfter))
        indication.typeBefore_name = indicationTypeBefore.type
        indication.typeAfter_name = indicationTypeAfter.type
        indication.before = indicationTypeBefore.before
        indication.after = indicationTypeAfter.after
        indication.before_explain = indicationTypeBefore.before_explain
        indication.after_explain = indicationTypeAfter.after_explain
        if (indication.action.toLocaleLowerCase().includes('bé')) babyRelatedIndications.push(indication)
        else adultRelatedIndications.push(indication)
    }
    const randomInt = Math.round(Math.random())
    if (randomInt === 1) res.json(babyRelatedIndications)
    else res.json(adultRelatedIndications)
})
router.post('/indication', async (req, res) => {
    const {action, typeId} = req.body;
    if (!action || !typeId) return res.sendStatus(400)
    const indicationType = await IndicationType.findById(typeId)
    if (indicationType.length == 0) res.sendStatus(400)
    else {
        const createResult = await Indication.create({action, type: typeId})
        if (createResult) res.sendStatus(201)
        else res.sendStatus(500)
    }
})
router.post('/indication/type', async (req, res) => {
    const {type, before, after, beforeExplain, afterExplain} = req.body
    if (!type) res.sendStatus(400)
    else {
        //check valid later
        const createIndicationType = await IndicationType.create({type, before, after, before_explain: beforeExplain, after_explain: afterExplain})
        if (createIndicationType) res.sendStatus(201)
        else res.sendStatus(500)
    }
})
router.post('/record', async (req, res) => {
    const {staff_id, game_level, duration , score, total_indications_took} = req.body
    console.log('Data:', staff_id, game_level, duration , score, total_indications_took)
    const createResult = await GameRecord.create({staff_id, game_level, duration: (duration * 1), score, total_indications_took})
    if (createResult) res.sendStatus(200)
    else res.sendStatus(500)
})
router.get('/record', async (req, res) => {
    const {staff_id} = req.query
    let staffRecords = await GameRecord.find({staff_id}).lean()
    staffRecords = staffRecords.map(item => ({...item, createAt: new Date(item.createAt).toLocaleString('en-GB')}))
    res.json(staffRecords)
})
router.get('/check-health', (req, res) => {
    res.sendStatus(200)
})

module.exports = router