const jwt = require('jsonwebtoken')

exports.getStringDate = (date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

exports.verifyJwt = (token) =>
  jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
    if (err) {
      return undefined
    }
    return decoded
  })
