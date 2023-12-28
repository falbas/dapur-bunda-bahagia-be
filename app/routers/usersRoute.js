const r = require('express').Router()
const users = require('../controllers/usersController')

module.exports = (app) => {
  r.post('/login', users.login)

  app.use('/api', r)
}
