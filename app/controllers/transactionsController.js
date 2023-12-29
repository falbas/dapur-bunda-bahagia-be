const sqlPromise = require('../helpers/sqlPromise')
const { getStringDate } = require('../helpers/utils')

exports.create = async (req, res) => {
  try {
    const { customer, payment_method, products } = req.body

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
      'INSERT INTO transactions (customer, total, payment_method, status) VALUES (?, ?, ?, 0)',
      [customer, total, payment_method]
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

    res.status(200).send({
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

    const now = month ? new Date(month) : new Date()

    const firstDayOfMonth = new Date(`${now.getFullYear()}`)
    firstDayOfMonth.setMonth(now.getMonth())
    const lastDayOfMonth = new Date(`${now.getFullYear()}`)
    lastDayOfMonth.setMonth(now.getMonth() + 1)
    lastDayOfMonth.setDate(lastDayOfMonth.getDate() - 1)

    const firstDayString = start_date ?? getStringDate(firstDayOfMonth)
    const lastDayString = end_date ?? getStringDate(lastDayOfMonth)

    const sql =
      'SELECT transactions.*, products.id AS product_id, products.name AS product_name, products.price AS product_price, orders.count AS order_count ' +
      'FROM orders JOIN transactions ON orders.transaction_id = transactions.id JOIN products ON orders.product_id = products.id ' +
      'WHERE transactions.created_at BETWEEN ? AND ? ORDER BY transactions.id'

    const query = await sqlPromise(sql, [firstDayString, lastDayString])

    const data = []
    query.map((item) => {
      if (data.length === 0 || data[data.length - 1].id !== item.id) {
        data.push({
          id: item.id,
          customer: item.customer,
          total: item.total,
          payment_method: item.payment_method,
          created_at: item.created_at,
          products: [
            {
              id: item.product_id,
              name: item.product_name,
              price: item.product_price,
              count: item.order_count,
            },
          ],
        })
      } else {
        data[data.length - 1].products.push({
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
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

    const sql =
      'SELECT transactions.*, products.id AS product_id, products.name AS product_name, products.price AS product_price, orders.count AS order_count ' +
      'FROM orders JOIN transactions ON orders.transaction_id = transactions.id JOIN products ON orders.product_id = products.id ' +
      'WHERE transactions.id = ?'

    const query = await sqlPromise(sql, [id])

    const data = {
      id: query[0].id,
      customer: query[0].customer,
      total: query[0].total,
      payment_method: query[0].payment_method,
      created_at: query[0].created_at,
      products: [],
    }

    query.map((item) => {
      data.products.push({
        id: item.product_id,
        name: item.product_name,
        price: item.product_price,
        count: item.order_count,
      })
    })

    res.status(200).send({ data })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}
