const r = require('express').Router()
const categories = require('../controllers/productCategoriesController')

module.exports = (app) => {
  r.get('/', categories.readAll)

  app.use('/api/categories', r)
}
