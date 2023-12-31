const jwt = require('jsonwebtoken')
const { verifyJwt } = require('../helpers/utils')

exports.auth = (req, res, next) => {
  jwt.verify(req.token, process.env.TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'User not authorized',
      })
    }
    req.auth = decoded
    next()
  })
}

exports.sessionAuth = (req, res, next) => {
  const token = verifyJwt(req.token)
  const session = req.query.session

  if (!token && !session) {
    res.status(403).send({ message: 'Permission denied' })
    return
  }
  req.auth = token
  req.session = session
  next()
}
