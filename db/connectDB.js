require('dotenv').config({ path: '../.env' })

const sql = require('mssql')
const sqlConfig = {
  user: "admin",
  password: "CNPM@2023",
  database: "HV_Nhansu",
  server: "10.17.4.38",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
}
let isConnected = new Promise((resolve, reject) => {
    let count = 0
    let id = setInterval(async () => {
        await sql.connect(sqlConfig, (err) => {
            if (err) {
                console.log(err)
                if (count == 5) {
                    reject(false)
                    clearInterval(id)
                }
                console.log('*** Connecting to the database failed, trying again... ***')
                count++
            }
            else {
                resolve(true)
                clearInterval(id)
            }
        })
    }, 3000)
})

module.exports = {isConnected, sql}