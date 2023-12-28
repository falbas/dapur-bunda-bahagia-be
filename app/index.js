require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bearerToken = require('express-bearer-token')

const app = express()
const port = process.env.PORT || 3000

const corsOption = {
  origin: '*',
}

app.use(cors(corsOption))
app.use(express.json())
app.use(bearerToken())

app.use('/api/storage', express.static('storage'));

app.get('/api', (req, res) => {
  res.send('Hello World!')
})

require('./routers/usersRoute')(app)

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
