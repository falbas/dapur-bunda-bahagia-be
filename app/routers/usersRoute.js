const r = require('express').Router()
const users = require('../controllers/usersController')
const { auth } = require('../middlewares/authMiddleware')

module.exports = (app) => {
  r.post('/login', users.login)
  r.get('/verify', auth, users.verify)

  app.use('/api', r)
}
