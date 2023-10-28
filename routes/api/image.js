const express = require('express')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const router = express.Router()

const { uploadFile, getFileStream  } = require('../../s3')

router
    .route('/:key')
    .get( (req, res) => {
        const key = req.params.key
        const readStream = getFileStream(key)

        const aaa = readStream.pipe(res)
        console.log(aaa)
    })

module.exports = router