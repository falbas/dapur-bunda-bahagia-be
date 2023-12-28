const sqlPromise = require('../helpers/sqlPromise')

exports.create = async (req, res) => {
  try {
    const { category_id, name, price, status } = req.body

    let image_url = undefined
    if (req.file) {
      image_url =
        process.env.APP_URL + '/api/' + req.file.path.replace('\\', '/')
    }

    if (!category_id || !name || !price || !status || !image_url) {
      res.status(400).send({ message: 'All input is required' })
      return
    }

    const query = await sqlPromise(
      'INSERT INTO products (category_id, name, price, image_url, status) VALUES (?,?,?,?,?)',
      [category_id, name, price, image_url, status]
    )

    res.status(201).send({
      message: 'Insert product successful',
      data: {
        id: query.insertId,
        category_id,
        name,
        price,
        image_url,
        status,
      },
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}

exports.readAll = async (req, res) => {
  try {
    const query = await sqlPromise('SELECT * FROM products')

    res.status(200).send({
      data: query,
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}

exports.readById = async (req, res) => {
  try {
    const { id } = req.params

    const query = await sqlPromise('SELECT * FROM products WHERE id = ?', [id])

    if (query.length === 0) {
      res.status(404).send({ message: 'Product not found' })
      return
    }

    res.status(200).send({
      data: query[0],
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const { id } = req.params
    let { category_id, name, price, status } = req.body

    let image_url = undefined
    if (req.file) {
      image_url =
        process.env.APP_URL + '/api/' + req.file.path.replace('\\', '/')
    }

    if (!category_id && !name && !price && !status && !image_url) {
      res.status(200).send({ message: 'No update' })
      return
    }

    let sql = 'UPDATE products SET'
    const updateValues = []
    if (category_id) (sql += ' category_id=?,'), updateValues.push(category_id)
    if (name) (sql += ' name=?,'), updateValues.push(name)
    if (price) (sql += ' price=?,'), updateValues.push(price)
    if (status) (sql += ' status=?,'), updateValues.push(status)
    if (image_url) (sql += ' image_url=?,'), updateValues.push(image_url)
    sql = sql.replace(/,(?=[^,]*$)/, '')
    sql += ' WHERE id=?'
    updateValues.push(id)

    const query = await sqlPromise(sql, updateValues)

    if (query.affectedRows === 0) {
      res.status(404).send({ message: 'Product not found' })
      return
    }

    res.status(200).send({
      message: 'Update product successful',
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}

exports.delete = async (req, res) => {
  try {
    const { id } = req.params

    const query = await sqlPromise('DELETE FROM products WHERE id = ?', [id])

    if (query.affectedRows === 0) {
      res.status(404).send({ message: 'Product not found' })
      return
    }

    res.status(200).send({
      message: 'Delete product successful',
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}
