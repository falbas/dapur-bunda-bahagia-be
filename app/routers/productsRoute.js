const r = require('express').Router()
const products = require('../controllers/productsController')
const { auth } = require('../middlewares/authMiddleware')
const { upload } = require('../middlewares/uploadMiddleware')

module.exports = (app) => {
  r.post('/', auth, upload.single('image'), products.create)
  r.get('/', products.readAll)
  r.get('/:id', products.readById)
  r.put('/:id', auth, upload.single('image'), products.update)
  r.delete('/:id', auth, products.delete)

  app.use('/api/products', r)
}
