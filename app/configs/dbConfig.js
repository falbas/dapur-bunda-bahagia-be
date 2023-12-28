const mysql = require('mysql')

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
})

pool.getConnection((err) => {
  if (err) {
    return console.error(`error : ${err.message}`)
  }
  console.log(`successfully connected to ${process.env.DB_HOST}`)
})

module.exports = pool
