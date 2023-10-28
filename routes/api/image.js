const express = require('express')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const router = express.Router()

const { uploadFile, getFileStream  } = require('../../s3')

router
    .route('profile_picture/u/:key')
    .get( (req, res) => {
        const key = req.params.key
        const readStream = getFileStream(`profile_picture/u/${key}`)

        readStream.pipe(res)
    })

module.exports = router