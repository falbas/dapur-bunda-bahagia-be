const jwt = require('jsonwebtoken')

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
