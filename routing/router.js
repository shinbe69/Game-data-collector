const express = require('express')
const crypto = require('node:crypto')
const router = express.Router()
const {sql} = require('../db/connectDB')
const { ObjectId } = require('mongodb')
const Player = require('../models/Player')
const Indication = require('../models/Indication')
const IndicationType = require('../models/IndicationType')

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
router.get('/indication', async (req, res) => {
    const indications = await Indication.find({}).lean()
    const indicationTypes = await IndicationType.find({})
    for await (const indication of indications) {
        const matchIndicationType = indicationTypes.find(item => item._id.equals(indication.type))
        indication.type_name = matchIndicationType.type
        indication.before = matchIndicationType.before
        indication.after = matchIndicationType.after
        indication.before_explain = matchIndicationType.before_explain
        indication.after_explain = matchIndicationType.after_explain
    }
    res.json(indications)
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
router.get('/check-health', (req, res) => {
    res.sendStatus(200)
})

module.exports = router