const sqlPromise = require('../helpers/sqlPromise')

exports.readAll = async (req, res) => {
  try {
    const query = await sqlPromise('SELECT * FROM categories')

    res.status(200).send({ data: query })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}
