const sqlPromise = require('../helpers/sqlPromise')
const { getStringDate, verifyJwt } = require('../helpers/utils')

exports.create = async (req, res) => {
  try {
    const { customer, payment_method, session, products } = req.body

    let sqlProducts = 'SELECT * FROM products WHERE'
    const valuesProducts = []
    products.map((product, i) => {
      if (i !== 0) sqlProducts += ' OR'
      sqlProducts += ' id=?'
      valuesProducts.push(product.id)
    })

    const reqProducts = await sqlPromise(sqlProducts, valuesProducts)

    if (reqProducts.length < products.length) {
      res.status(400).send({
        message: 'One or more products not found',
      })
      return
    }

    let total = 0
    const resProducts = []
    reqProducts.map((product) => {
      total += product.price
      resProducts.push({
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      })
    })

    const createTransaction = await sqlPromise(
      'INSERT INTO transactions (customer, total, payment_method, status, session) VALUES (?, ?, ?, 0, ?)',
      [customer, total, payment_method, session],
    )
    const transaction_id = createTransaction.insertId

    let sqlOrder =
      'INSERT INTO orders (product_id, transaction_id, count) VALUES '
    const valuesOrder = []
    products.map((product, i) => {
      sqlOrder += '(?,?,?),'
      valuesOrder.push(...[product.id, transaction_id, product.count])
    })
    sqlOrder = sqlOrder.replace(/,(?=[^,]*$)/, '')

    await sqlPromise(sqlOrder, valuesOrder)

    res.status(201).send({
      message: 'Create transaction successful',
      data: {
        id: transaction_id,
        customer: customer,
        total: total,
        payment_method: payment_method,
        products: resProducts,
      },
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}

exports.confirmOrder = async (req, res) => {
  try {
    const { id } = req.params

    await sqlPromise('UPDATE transactions SET status = ? WHERE id = ?', [1, id])

    res.status(200).send({ message: 'Confirm order successful' })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}

exports.confirmPayment = async (req, res) => {
  try {
    const { id } = req.params

    await sqlPromise('UPDATE transactions SET status = ? WHERE id = ?', [2, id])

    res.status(200).send({ message: 'Confirm payment successful' })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}

exports.closeTransaction = async (req, res) => {
  try {
    const { id } = req.params

    await sqlPromise('UPDATE transactions SET status = ? WHERE id = ?', [3, id])

    res.status(200).send({ message: 'Transaction closed' })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}

exports.readAll = async (req, res) => {
  try {
    const { month, start_date, end_date } = req.query
    const session = req.session

    const now = month ? new Date(month) : new Date()

    const firstDayOfMonth = new Date(`${now.getFullYear()}`)
    firstDayOfMonth.setMonth(now.getMonth())
    const lastDayOfMonth = new Date(`${now.getFullYear()}`)
    lastDayOfMonth.setMonth(now.getMonth() + 1)
    lastDayOfMonth.setDate(lastDayOfMonth.getDate() - 1)

    let firstDayString = start_date ?? getStringDate(firstDayOfMonth)
    firstDayString += ' 00:00:00'
    let lastDayString = end_date ?? getStringDate(lastDayOfMonth)
    lastDayString += ' 23:59:59'

    let sql =
      'SELECT transactions.*, products.id AS product_id, products.name AS product_name, products.price AS product_price, products.image_url AS product_image_url, orders.count AS order_count ' +
      'FROM orders JOIN transactions ON orders.transaction_id = transactions.id JOIN products ON orders.product_id = products.id '

    const values = []

    if (session) {
      sql += 'WHERE transactions.session = ? ORDER BY transactions.id'
      values.push(session)
    } else {
      sql +=
        'WHERE transactions.created_at BETWEEN ? AND ? ORDER BY transactions.id'
      values.push(...[firstDayString, lastDayString])
    }

    const query = await sqlPromise(sql, values)

    const data = []
    query.map((item) => {
      if (data.length === 0 || data[data.length - 1].id !== item.id) {
        data.push({
          id: item.id,
          customer: item.customer,
          total: item.total,
          payment_method: item.payment_method,
          status: item.status,
          created_at: item.created_at,
          products: [
            {
              id: item.product_id,
              name: item.product_name,
              price: item.product_price,
              image_url: item.product_image_url,
              count: item.order_count,
            },
          ],
        })
      } else {
        data[data.length - 1].products.push({
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          image_url: item.product_image_url,
          count: item.order_count,
        })
      }
    })

    res.status(200).send({ data })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}

exports.readById = async (req, res) => {
  try {
    const { id } = req.params
    const session = req.session

    let sql =
      'SELECT transactions.*, products.id AS product_id, products.name AS product_name, products.price AS product_price, products.image_url AS product_image_url, orders.count AS order_count ' +
      'FROM orders JOIN transactions ON orders.transaction_id = transactions.id JOIN products ON orders.product_id = products.id ' +
      'WHERE transactions.id = ?'

    const values = [id]
    if (session) {
      sql += ' AND transactions.session = ?'
      values.push(session)
    }

    const query = await sqlPromise(sql, values)

    if (query.length === 0) {
      res.status(404).send({ message: 'Transaction not found' })
      return
    }

    const data = {
      id: query[0].id,
      customer: query[0].customer,
      total: query[0].total,
      payment_method: query[0].payment_method,
      status: query[0].status,
      created_at: query[0].created_at,
      products: [],
    }

    query.map((item) => {
      data.products.push({
        id: item.product_id,
        name: item.product_name,
        price: item.product_price,
        image_url: item.product_image_url,
        count: item.order_count,
      })
    })

    res.status(200).send({ data })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}
