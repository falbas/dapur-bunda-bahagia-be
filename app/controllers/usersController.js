const { createHmac } = require('node:crypto')
const jwt = require('jsonwebtoken')
const sqlPromise = require('../helpers/sqlPromise')
const { verifyJwt } = require('../helpers/utils')

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).send({ message: 'All input is required' })
      return
    }

    const encpass = createHmac('sha256', process.env.KEY_PASS)
      .update(password)
      .digest('hex')

    const reqLogin = await sqlPromise(
      'SELECT * FROM admins WHERE username = ? AND password = ?',
      [username, encpass],
    )

    if (reqLogin.length === 0) {
      res.status(401).send({ message: 'Username or password is wrong' })
      return
    }

    const token = jwt.sign(
      { username: reqLogin[0].username },
      process.env.TOKEN_KEY,
      {
        expiresIn: process.env.TOKEN_EXP,
      },
    )

    res.send({
      message: 'Login successful',
      token: token,
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}

exports.verify = async (req, res) => {
  try {
    const token = verifyJwt(req.token)

    res.send(token)
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}
