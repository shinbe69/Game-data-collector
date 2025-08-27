const express = require('express')
const crypto = require('node:crypto')
const router = express.Router()
const {sql} = require('../db/connectDB')
const Player = require('../models/Player')

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
    const player = await sql.query(`SELECT CONCAT(hoDem, ten) AS name, KhoaPhong.tenKhoa AS department FROM HoSoNhanVien INNER JOIN KhoaPhong ON HoSoNhanVien.khoaPhong = KhoaPhong.maKhoa WHERE maNhanVien = '${username}'`)
    res.json(player.recordset[0])
})

router.get('/update-staff', async (req, res) => {
    const staffs = await sql.query(`SELECT maNhanVien AS staff_id, CONCAT(hoDem, ten) AS name, KhoaPhong.tenKhoa AS department
        FROM HoSoNhanVien INNER JOIN KhoaPhong
        ON khoaPhong = KhoaPhong.maKhoa`)
    let countUpdated = 0
    staffs.recordset.forEach(async (staff) => {
        const playerCreating = await Player.create({staff_id: staff.staff_id, name: staff.name, department: staff.department})
        if (playerCreating) countUpdated++
    })
    res.json({numberOfPlayerCreated: countUpdated})
})

router.get('/check-health', (req, res) => {
    res.sendStatus(200)
})

module.exports = router