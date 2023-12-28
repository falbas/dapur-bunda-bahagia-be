const multer = require('multer')

exports.upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'storage/')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
    },
  }),
})
