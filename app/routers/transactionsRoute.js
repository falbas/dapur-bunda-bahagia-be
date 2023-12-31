const r = require('express').Router()
const transactions = require('../controllers/transactionsController')
const { auth, sessionAuth } = require('../middlewares/authMiddleware')

module.exports = (app) => {
  r.post('/', transactions.create)
  r.post('/confirm-order/:id', auth, transactions.confirmOrder)
  r.post('/confirm-payment/:id', auth, transactions.confirmPayment)
  r.post('/close-transaction/:id', auth, transactions.closeTransaction)
  r.get('/', sessionAuth, transactions.readAll)
  r.get('/:id', sessionAuth, transactions.readById)

  app.use('/api/transactions', r)
}
